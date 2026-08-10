import json
import math
import os
import time
from collections import defaultdict
from statistics import fmean, stdev

import psycopg2


query_cache = {}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-store"},
    }


def _as_float(value, default=0.0):
    return default if value is None else float(value)


def _percent(value):
    return round(value * 100, 4)


def _readiness(returns, minimum_trades, target_trades, maximum_drawdown):
    if not returns:
        return {
            "status": "INSUFFICIENT_SAMPLE",
            "reason": f"need {minimum_trades} more closed trades",
            "closed_paper_trades": 0,
            "net_expectancy_percent": 0.0,
            "expectancy_95pct_lower_bound_percent": 0.0,
            "net_win_rate_percent": 0.0,
            "profit_factor": None,
            "compounded_return_percent": 0.0,
            "maximum_drawdown_percent": 0.0,
            "minimum_trades": minimum_trades,
            "target_trades": target_trades,
        }

    expectancy = fmean(returns)
    standard_error = stdev(returns) / math.sqrt(len(returns)) if len(returns) > 1 else math.inf
    lower_bound = expectancy - 1.645 * standard_error
    gains = sum(value for value in returns if value > 0)
    losses = -sum(value for value in returns if value < 0)
    profit_factor = gains / losses if losses else None
    equity = 1.0
    peak = 1.0
    maximum_drawdown_seen = 0.0
    for value in returns:
        equity *= 1 + value
        peak = max(peak, equity)
        maximum_drawdown_seen = max(maximum_drawdown_seen, 1 - equity / peak)

    if len(returns) < minimum_trades:
        status = "INSUFFICIENT_SAMPLE"
        reason = f"need {minimum_trades - len(returns)} more closed trades"
    elif len(returns) < target_trades:
        status = "PRELIMINARY"
        reason = f"need {target_trades - len(returns)} more trades for readiness review"
    elif expectancy <= 0 or lower_bound <= 0:
        status = "REJECTED"
        reason = "net expectancy confidence gate did not pass"
    elif profit_factor is not None and profit_factor <= 1:
        status = "REJECTED"
        reason = "profit factor does not exceed 1"
    elif maximum_drawdown_seen > maximum_drawdown:
        status = "REJECTED"
        reason = "maximum drawdown exceeds the configured limit"
    else:
        status = "PAPER_READY"
        reason = "all sample and risk gates passed"

    return {
        "status": status,
        "reason": reason,
        "closed_paper_trades": len(returns),
        "net_expectancy_percent": _percent(expectancy),
        "expectancy_95pct_lower_bound_percent": None if not math.isfinite(lower_bound) else _percent(lower_bound),
        "net_win_rate_percent": _percent(sum(value > 0 for value in returns) / len(returns)),
        "profit_factor": None if profit_factor is None else round(profit_factor, 4),
        "compounded_return_percent": _percent(equity - 1),
        "maximum_drawdown_percent": _percent(maximum_drawdown_seen),
        "minimum_trades": minimum_trades,
        "target_trades": target_trades,
    }


def _load_paper_returns(cursor):
    cursor.execute(
        """
        SELECT
            model_name,
            closed_at,
            CASE WHEN signal->>'action' = 'BUY' THEN 1 ELSE -1 END
                * (exit_price::double precision / entry_price::double precision - 1)
                - 2 * (
                    COALESCE(NULLIF(signal->>'fee_pct', '')::double precision, 0.005)
                    + COALESCE(NULLIF(signal->>'slippage_pct', '')::double precision, 0.0005)
                ) AS net_return
        FROM strategy_signals
        WHERE status = 'closed'
          AND signal->>'paper_trade' = 'true'
          AND signal->>'action' IN ('BUY', 'SHORT')
          AND entry_price > 0
          AND exit_price > 0
          AND outcome IN ('take_profit', 'stop_loss', 'timeout')
        ORDER BY closed_at, id
        """
    )
    return [(row[0], row[1], float(row[2])) for row in cursor.fetchall()]


def _execute_query(cursor, query_type):
    if query_type == "model_summary":
        cursor.execute(
            """
            SELECT model_name, COUNT(*), ROUND(SUM(entry), 2), ROUND(SUM(profit), 2),
                   ROUND(SUM(profit) / NULLIF(SUM(entry), 0) * 100, 2)
            FROM closed_signals GROUP BY model_name ORDER BY 5 DESC
            """
        )
        return [
            {"model_name": row[0], "trades": row[1], "total_entry": _as_float(row[2]),
             "total_profit": _as_float(row[3]), "roi_percent": _as_float(row[4])}
            for row in cursor.fetchall()
        ]
    if query_type == "outcome_summary":
        cursor.execute("SELECT outcome, COUNT(*) FROM closed_signals GROUP BY outcome ORDER BY 2 DESC")
        return [{"outcome": row[0], "total": row[1]} for row in cursor.fetchall()]
    if query_type == "trade_stats":
        cursor.execute("SELECT ROUND(SUM(profit), 4), ROUND(AVG(profit), 4), COUNT(*) FROM closed_signals")
        row = cursor.fetchone()
        return {"total_profit": _as_float(row[0]), "avg_profit_per_trade": _as_float(row[1]), "total_trades": row[2]}
    if query_type == "volume_summary":
        cursor.execute("SELECT ROUND(SUM(entry), 2), ROUND(SUM(exit), 2), ROUND(SUM(exit-entry), 2) FROM closed_signals")
        row = cursor.fetchone()
        return {"total_entry_volume": _as_float(row[0]), "total_exit_volume": _as_float(row[1]), "total_profit": _as_float(row[2])}
    if query_type == "by_coin":
        cursor.execute(
            """
            SELECT coin, COUNT(*), ROUND(SUM(entry), 2), ROUND(SUM(profit), 2),
                   ROUND(SUM(profit) / NULLIF(SUM(entry), 0) * 100, 2)
            FROM closed_signals GROUP BY coin ORDER BY 5 DESC
            """
        )
        return [
            {"coin": row[0], "trades": row[1], "total_entry": _as_float(row[2]),
             "total_profit": _as_float(row[3]), "roi_percent": _as_float(row[4])}
            for row in cursor.fetchall()
        ]
    if query_type == "open_signals":
        cursor.execute(
            """
            SELECT id, coin, model_name, created_at, signal->>'action',
                   (signal->>'entry')::numeric, (signal->>'stop_loss')::numeric,
                   (signal->>'take_profit')::numeric
            FROM strategy_signals
            WHERE status = 'open' AND signal->>'action' IS DISTINCT FROM 'HOLD'
              AND created_at >= NOW() - interval '12 hours'
            ORDER BY created_at DESC
            """
        )
        return [
            {"id": str(row[0]), "coin": row[1], "model_name": row[2],
             "created_at": row[3].isoformat(), "action": row[4],
             "entry": _as_float(row[5], None), "stop_loss": _as_float(row[6], None),
             "take_profit": _as_float(row[7], None)}
            for row in cursor.fetchall()
        ]
    if query_type == "generator_funnel":
        cursor.execute(
            """
            SELECT model_name, COUNT(*),
                   COUNT(*) FILTER (WHERE candidate_action IN ('BUY', 'SHORT')),
                   COUNT(*) FILTER (WHERE accepted),
                   COUNT(*) FILTER (WHERE evaluation->>'selected' = 'true'),
                   COUNT(*) FILTER (WHERE evaluation->>'position_saved' = 'true'),
                   AVG(signal_score), MAX(evaluated_at)
            FROM strategy_signal_evaluations
            WHERE gate_version = 'signal-quality-v2.2'
            GROUP BY model_name ORDER BY model_name
            """
        )
        return [
            {"generator": row[0], "evaluations": row[1], "raw_candidates": row[2],
             "gate_accepted": row[3], "selected": row[4], "positions_saved": row[5],
             "average_score": None if row[6] is None else round(float(row[6]), 2),
             "last_evaluated_at": row[7].isoformat()}
            for row in cursor.fetchall()
        ]
    if query_type == "rejection_summary":
        cursor.execute(
            """
            SELECT model_name, COALESCE(rejection_reason, 'unknown'), COUNT(*)
            FROM strategy_signal_evaluations
            WHERE NOT accepted AND gate_version = 'signal-quality-v2.2'
            GROUP BY model_name, rejection_reason ORDER BY 3 DESC, 1, 2
            """
        )
        return [{"generator": row[0], "reason": row[1], "total": row[2]} for row in cursor.fetchall()]
    if query_type in {"paper_readiness", "generator_performance"}:
        rows = _load_paper_returns(cursor)
        if query_type == "paper_readiness":
            return _readiness(
                [row[2] for row in rows],
                int(os.getenv("PAPER_MINIMUM_TRADES", "100")),
                int(os.getenv("PAPER_TARGET_TRADES", "200")),
                float(os.getenv("PAPER_MAX_DRAWDOWN_PCT", "0.10")),
            )
        grouped = defaultdict(list)
        for model_name, _, net_return in rows:
            grouped[model_name].append(net_return)
        return [
            {"generator": model_name, **_readiness(returns, 1, 200, 0.10)}
            for model_name, returns in sorted(grouped.items())
        ]
    raise ValueError(f"Unknown query: {query_type}")


def lambda_handler(event, context):
    query_type = (event.get("queryStringParameters") or {}).get("query", "model_summary")
    cache_ttl = int(os.getenv("CACHE_TTL_SECONDS", "60"))
    cached = query_cache.get(query_type)
    if cached and time.time() - cached[0] < cache_ttl:
        return _response(200, cached[1])

    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(
            dbname=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            host=os.environ["DB_HOST"],
            port=os.getenv("DB_PORT", "15432"),
        )
        connection.set_session(readonly=True, autocommit=True)
        cursor = connection.cursor()
        data = _execute_query(cursor, query_type)
        query_cache[query_type] = (time.time(), data)
        return _response(200, data)
    except ValueError as error:
        return _response(400, {"error": str(error)})
    except Exception:
        return _response(500, {"error": "Database query failed"})
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()
