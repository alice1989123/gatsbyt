"use client";
import GlassSelect, { SimpleOption } from "@/components/GlassSelect";
import React, { useMemo, useState } from "react";
import styles from "./performance.module.css";
import { useSignalQuery } from "@/hooks/useSignalQuery";
import coins from "../app/coins";


const topNOptions: SimpleOption<number>[] = [
  { label: "Top 5", value: 5 },
  { label: "Top 10", value: 10 },
  { label: "All", value: 0 },
];

const sortOptions: SimpleOption<string>[] = [
  { label: "ROI ↓", value: "roi:desc" },
  { label: "ROI ↑", value: "roi:asc" },
  { label: "Profit ↓", value: "profit:desc" },
  { label: "Profit ↑", value: "profit:asc" },
  { label: "Trades ↓", value: "trades:desc" },
  { label: "Trades ↑", value: "trades:asc" },
  { label: "Entry ↓", value: "entry:desc" },
  { label: "Entry ↑", value: "entry:asc" },
  { label: "Coin A→Z", value: "coin:asc" },
  { label: "Coin Z→A", value: "coin:desc" },
];
function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US").format(n);
}
function formatPercent(n: number) {
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(2)}%`;
}

type SortKey = "roi" | "profit" | "trades" | "entry" | "coin";
type SortDir = "desc" | "asc";

export default function PerformancePage() {
  const tradeStats = useSignalQuery("trade_stats");
  const volumeStats = useSignalQuery("volume_summary");
  const modelSummary = useSignalQuery("model_summary");
  const byCoin = useSignalQuery("by_coin");
  const outcomeSummary = useSignalQuery("outcome_summary");
  const paperReadiness = useSignalQuery("paper_readiness");
  const generatorFunnel = useSignalQuery("generator_funnel");
  const generatorPerformance = useSignalQuery("generator_performance");
  const rejectionSummary = useSignalQuery("rejection_summary");

  const isLoading =
    tradeStats.loading ||
    volumeStats.loading ||
    modelSummary.loading ||
    byCoin.loading ||
    outcomeSummary.loading ||
    paperReadiness.loading ||
    generatorFunnel.loading ||
    generatorPerformance.loading ||
    rejectionSummary.loading;

  const isError =
    !!tradeStats.error ||
    !!volumeStats.error ||
    !!modelSummary.error ||
    !!byCoin.error ||
    !!outcomeSummary.error ||
    !!paperReadiness.error ||
    !!generatorFunnel.error ||
    !!generatorPerformance.error ||
    !!rejectionSummary.error;

  // Coin icon map (optional)
  const coinIconBySymbol = useMemo(() => {
    const m = new Map<string, string>();
    coins.forEach((c: any) => m.set(String(c.symbol).toUpperCase(), c.coinpng));
    return m;
  }, []);

  // Controls for the big “by coin” list
  const [coinQuery, setCoinQuery] = useState("");
  const [topN, setTopN] = useState<number>(5);
  const [sortKey, setSortKey] = useState<SortKey>("roi");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const byCoinFiltered = useMemo(() => {
    const raw: any[] = Array.isArray(byCoin.data) ? byCoin.data : [];
    const q = coinQuery.trim().toLowerCase();

    let list =
      q.length === 0
        ? raw
        : raw.filter((x) => String(x.coin || "").toLowerCase().includes(q));

    const dir = sortDir === "asc" ? 1 : -1;

    list = [...list].sort((a, b) => {
      const aCoin = String(a.coin ?? "");
      const bCoin = String(b.coin ?? "");

      const aRoi = Number(a.roi_percent);
      const bRoi = Number(b.roi_percent);

      const aProfit = Number(a.total_profit);
      const bProfit = Number(b.total_profit);

      const aTrades = Number(a.trades);
      const bTrades = Number(b.trades);

      const aEntry = Number(a.total_entry);
      const bEntry = Number(b.total_entry);

      switch (sortKey) {
        case "coin":
          return aCoin.localeCompare(bCoin) * dir;
        case "profit":
          return (aProfit - bProfit) * dir;
        case "trades":
          return (aTrades - bTrades) * dir;
        case "entry":
          return (aEntry - bEntry) * dir;
        case "roi":
        default:
          return (aRoi - bRoi) * dir;
      }
    });

    if (topN > 0) list = list.slice(0, topN);
    return list;
  }, [byCoin.data, coinQuery, topN, sortKey, sortDir]);

  const kpis = useMemo(() => {
    if (isLoading || isError) return [];
    const totalProfit = Number(tradeStats.data?.total_profit);
    const avgProfit = Number(tradeStats.data?.avg_profit_per_trade);
    const totalTrades = Number(tradeStats.data?.total_trades);
    const entryVol = Number(volumeStats.data?.total_entry_volume);

    return [
      { label: "Total Profit", value: formatMoney(totalProfit) },
      { label: "Total Trades", value: formatNumber(totalTrades) },
      { label: "Avg Profit / Trade", value: formatMoney(avgProfit) },
      { label: "Total Entry Volume", value: formatMoney(entryVol) },
    ];
  }, [isLoading, isError, tradeStats.data, volumeStats.data]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.page}>
        <div className={styles.content}>
          <header className={styles.hero}>
            <h1 className={styles.title}>Strategy Results</h1>
            <p className={styles.subtitle}>
              Aggregated profit, volume, and ROI across models and traded symbols.
            </p>
          </header>

          {isLoading ? (
            <div className={styles.stateBox}>Loading performance…</div>
          ) : isError ? (
            <div className={styles.stateBoxError}>
              <div className={styles.stateTitle}>Couldn’t load performance data</div>
              <div className={styles.stateHint}>
                Refresh the page. If it persists, the API may be unavailable.
              </div>
            </div>
          ) : (
            <>
              {/* ✅ KPI CARDS BACK */}
              <section className={styles.kpiGrid}>
                {kpis.map((k) => (
                  <div key={k.label} className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>{k.label}</div>
                    <div className={styles.kpiValue}>{k.value}</div>
                  </div>
                ))}
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeaderRow}>
                  <div>
                    <h2 className={styles.sectionTitle}>Paper-Trading Readiness</h2>
                    <div className={styles.sectionHint}>
                      V2 signal cohort only, net of stored fees and slippage
                    </div>
                  </div>
                  <span className={styles.statusPill}>{paperReadiness.data?.status ?? "UNKNOWN"}</span>
                </div>
                <div className={styles.kpiGrid}>
                  <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Closed Paper Trades</div>
                    <div className={styles.kpiValue}>
                      {formatNumber(Number(paperReadiness.data?.closed_paper_trades))}
                    </div>
                  </div>
                  <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Net Expectancy</div>
                    <div className={styles.kpiValue}>
                      {formatPercent(Number(paperReadiness.data?.net_expectancy_percent))}
                    </div>
                  </div>
                  <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Net Win Rate</div>
                    <div className={styles.kpiValue}>
                      {formatPercent(Number(paperReadiness.data?.net_win_rate_percent))}
                    </div>
                  </div>
                  <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Maximum Drawdown</div>
                    <div className={styles.kpiValue}>
                      {formatPercent(Number(paperReadiness.data?.maximum_drawdown_percent))}
                    </div>
                  </div>
                </div>
                <div className={styles.readinessReason}>{paperReadiness.data?.reason}</div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Generator Funnel</h2>
                  <div className={styles.sectionHint}>Candidates proposed, accepted, selected, and saved</div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead><tr><th>Generator</th><th className={styles.right}>Evaluations</th><th className={styles.right}>Candidates</th><th className={styles.right}>Accepted</th><th className={styles.right}>Selected</th><th className={styles.right}>Saved</th><th className={styles.right}>Pass Rate</th></tr></thead>
                    <tbody>
                      {(Array.isArray(generatorFunnel.data) ? generatorFunnel.data : []).map((item: any) => {
                        const candidates = Number(item.raw_candidates);
                        const accepted = Number(item.gate_accepted);
                        const passRate = candidates > 0 ? (accepted / candidates) * 100 : 0;
                        return <tr key={item.generator}><td className={styles.ellipsis} title={item.generator}>{item.generator}</td><td className={styles.right}>{formatNumber(Number(item.evaluations))}</td><td className={styles.right}>{formatNumber(candidates)}</td><td className={styles.right}>{formatNumber(accepted)}</td><td className={styles.right}>{formatNumber(Number(item.selected))}</td><td className={styles.right}>{formatNumber(Number(item.positions_saved))}</td><td className={styles.right}>{formatPercent(passRate)}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Generator Performance</h2>
                  <div className={styles.sectionHint}>Closed paper positions after fees and slippage</div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead><tr><th>Generator</th><th className={styles.right}>Trades</th><th className={styles.right}>Expectancy</th><th className={styles.right}>Win Rate</th><th className={styles.right}>Profit Factor</th><th className={styles.right}>Compounded</th><th className={styles.right}>Drawdown</th></tr></thead>
                    <tbody>
                      {(Array.isArray(generatorPerformance.data) ? generatorPerformance.data : []).map((item: any) => <tr key={item.generator}><td className={styles.ellipsis} title={item.generator}>{item.generator}</td><td className={styles.right}>{formatNumber(Number(item.closed_paper_trades))}</td><td className={styles.right}>{formatPercent(Number(item.net_expectancy_percent))}</td><td className={styles.right}>{formatPercent(Number(item.net_win_rate_percent))}</td><td className={styles.right}>{item.profit_factor == null ? "∞" : Number(item.profit_factor).toFixed(3)}</td><td className={styles.right}>{formatPercent(Number(item.compounded_return_percent))}</td><td className={styles.right}>{formatPercent(Number(item.maximum_drawdown_percent))}</td></tr>)}
                      {!Array.isArray(generatorPerformance.data) || generatorPerformance.data.length === 0 ? <tr><td colSpan={7} className={styles.emptyRow}>No V2 paper positions have closed yet.</td></tr> : null}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Gate Rejections</h2>
                  <div className={styles.sectionHint}>Why candidate signals did not become paper positions</div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead><tr><th>Generator</th><th>Reason</th><th className={styles.right}>Total</th></tr></thead>
                    <tbody>{(Array.isArray(rejectionSummary.data) ? rejectionSummary.data : []).map((item: any, index: number) => <tr key={`${item.generator}-${item.reason}-${index}`}><td className={styles.ellipsis}>{item.generator}</td><td>{item.reason}</td><td className={styles.right}>{formatNumber(Number(item.total))}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              {/* Volume & Trade Stats */}
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Volume & Trade Stats</h2>
                  <div className={styles.sectionHint}>High-level totals across strategies</div>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th className={styles.right}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Profit</td>
                        <td className={styles.right}>
                          {formatMoney(Number(tradeStats.data.total_profit))}
                        </td>
                      </tr>
                      <tr>
                        <td>Avg Profit / Trade</td>
                        <td className={styles.right}>
                          {formatMoney(Number(tradeStats.data.avg_profit_per_trade))}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Trades</td>
                        <td className={styles.right}>
                          {formatNumber(Number(tradeStats.data.total_trades))}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Entry Volume</td>
                        <td className={styles.right}>
                          {formatMoney(Number(volumeStats.data.total_entry_volume))}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Exit Volume</td>
                        <td className={styles.right}>
                          {formatMoney(Number(volumeStats.data.total_exit_volume))}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Volume Profit</td>
                        <td className={styles.right}>
                          {formatMoney(Number(volumeStats.data.total_profit))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Model Summary */}
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Model Summary</h2>
                  <div className={styles.sectionHint}>Aggregated results per model</div>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th className={styles.right}>Trades</th>
                        <th className={styles.right}>Total Entry</th>
                        <th className={styles.right}>Total Profit</th>
                        <th className={styles.right}>ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(modelSummary.data) ? modelSummary.data : []).map(
                        (item: any, index: number) => {
                          const roi = Number(item.roi_percent);
                          const roiClass =
                            Number.isFinite(roi) && roi > 0
                              ? styles.pos
                              : Number.isFinite(roi) && roi < 0
                              ? styles.neg
                              : "";

                          return (
                            <tr key={index}>
                              <td className={styles.ellipsis} title={item.model_name}>
                                {item.model_name}
                              </td>
                              <td className={styles.right}>{formatNumber(Number(item.trades))}</td>
                              <td className={styles.right}>
                                {formatMoney(Number(item.total_entry))}
                              </td>
                              <td className={styles.right}>
                                {formatMoney(Number(item.total_profit))}
                              </td>
                              <td className={`${styles.right} ${roiClass}`}>
                                {formatPercent(roi)}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ✅ Performance by Coin (search + topN + sort + optional icons) */}
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeaderRow}>
                  <div>
                    <h2 className={styles.sectionTitle}>Performance by Coin</h2>
                    <div className={styles.sectionHint}>Breakdown per traded symbol</div>
                  </div>

                  <div className={styles.tableControls}>
                    <div className={styles.searchWrap}>
                      <span className={styles.searchIcon}>⌕</span>

                      <input
                        value={coinQuery}
                        onChange={(e) => setCoinQuery(e.target.value)}
                        className={styles.searchInput}
                        placeholder="Search coin (BTC, ETH, SOL...)"
                        aria-label="Search coin"
                      />

                      {coinQuery.trim().length > 0 ? (
                        <button
                          type="button"
                          className={styles.clearBtn}
                          onClick={() => setCoinQuery("")}
                          aria-label="Clear search"
                          title="Clear"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>

                    <GlassSelect<number>
                      width="160px"
                      options={topNOptions}
                      value={topNOptions.find((o) => o.value === topN) ?? topNOptions[0]}
                      onChange={(o) => setTopN(o.value)}
                      usePortal
                    />

                    <GlassSelect<string>
                      width="160px"
                      options={sortOptions}
                      value={
                        sortOptions.find((o) => o.value === `${sortKey}:${sortDir}`) ?? sortOptions[0]
                      }
                      onChange={(o) => {
                        const [k, d] = o.value.split(":") as [SortKey, SortDir];
                        setSortKey(k);
                        setSortDir(d);
                      }}
                      usePortal
                    />
                  </div>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Coin</th>
                        <th className={styles.right}>Trades</th>
                        <th className={styles.right}>Total Entry</th>
                        <th className={styles.right}>Total Profit</th>
                        <th className={styles.right}>ROI</th>
                      </tr>
                    </thead>

                    <tbody>
                      {byCoinFiltered.map((item: any, index: number) => {
                        const roi = Number(item.roi_percent);
                        const roiClass =
                          Number.isFinite(roi) && roi > 0
                            ? styles.pos
                            : Number.isFinite(roi) && roi < 0
                            ? styles.neg
                            : "";

                        const iconUrl = coinIconBySymbol.get(String(item.coin).toUpperCase());

                        return (
                          <tr key={`${item.coin}-${index}`}>
                            <td className={styles.coinCell}>
                              {iconUrl ? (
                                <img
                                  className={styles.coinIcon}
                                  src={iconUrl}
                                  alt=""
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span className={styles.coinText}>{item.coin}</span>
                            </td>
                            <td className={styles.right}>{formatNumber(Number(item.trades))}</td>
                            <td className={styles.right}>{formatMoney(Number(item.total_entry))}</td>
                            <td className={styles.right}>{formatMoney(Number(item.total_profit))}</td>
                            <td className={`${styles.right} ${roiClass}`}>{formatPercent(roi)}</td>
                          </tr>
                        );
                      })}

                      {byCoinFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.emptyRow}>
                            No results for “{coinQuery.trim()}”.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Outcome Summary */}
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Outcome Summary</h2>
                  <div className={styles.sectionHint}>Trade outcome counts</div>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Outcome</th>
                        <th className={styles.right}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(outcomeSummary.data) ? outcomeSummary.data : []).map(
                        (item: any, index: number) => (
                          <tr key={index}>
                            <td>{item.outcome}</td>
                            <td className={styles.right}>{formatNumber(Number(item.total))}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
