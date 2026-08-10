# Predictions Results API

Source-controlled baseline for the AWS Lambda function `predictions_results_api`.

## Production integration

- Region: `mx-central-1`
- Runtime: Python 3.12
- Handler: `get_predictions_results.lambda_handler`
- API Gateway routes: `/predictions_results` and `/predictions_results_api`
- Database path: Lambda to PostgreSQL through the VPN database proxy on port `15432`
- Psycopg2: provided by Lambda layer `psycopg2-layer:1`

The handler expects these Lambda environment variables:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`

Do not store their values in this repository.

## Baseline

`get_predictions_results.py` was copied from the deployed Lambda package on
2026-08-09 before generator scorecard work began.

Deployed source SHA-256:

`2a6d8b857173358b1ac7b6f0587474a56dac74aed601dff82eec8cdd593b4bfa`

The current Amplify performance page consumes these query values:

- `trade_stats`
- `volume_summary`
- `model_summary`
- `by_coin`
- `outcome_summary`
- `open_signals`
- `paper_readiness`
- `generator_funnel`
- `generator_performance`
- `rejection_summary`

The legacy queries continue to read `closed_signals`. The generator and readiness
queries read the V2 evaluation ledger and paper-only rows from `strategy_signals`
so historical legacy performance is not mixed into the new cohort.

## Validation

```bash
PYTHONPATH=lambdas/predictions_results_api python -m unittest discover \
  -s lambdas/predictions_results_api -p 'test_*.py' -v
npm ci
npm run lint
npm run build
```
