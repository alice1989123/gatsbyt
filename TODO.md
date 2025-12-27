/**
 * TODO — AssetPriceVisualizer
 *
 * ✅ UX polish (today)
 * - [ ] Add explicit "Retry" UI when fetch fails (show error state + button).
 * - [ ] Show "Updated X min ago" using API `cached_at` (trust signal).
 * - [ ] If MAE unavailable: keep button disabled + tooltip ("Uncertainty not available for this model").
 * - [ ] Ensure chart top bar never overlaps chart: keep `grid.top` aligned with bar height.
 *
 * ✅ Data correctness / robustness
 * - [ ] Sort incoming data by timestamp (already done) and guard against duplicates (same date).
 * - [ ] Enforce UTC semantics: expect API dates as ISO with `Z`. If missing, append `Z` (already done).
 * - [ ] Use backend-provided split point instead of guessing:
 *       - `forecast_start_date` OR `history_end_date` returned by API.
 * - [ ] Avoid relying on `label_width` to infer split; treat as horizon only.
 *
 * ✅ Backend contract to support future UX (timeframes, uncertainty)
 * - [ ] Add API request param: `timeframe=1H|4H|1D|1W` (even if only 1H supported now).
 * - [ ] Have API return: `timeframe` and/or `candle_interval_seconds`.
 * - [ ] Replace single MAE with per-step uncertainty:
 *       - `mae_per_step: number[]` OR quantiles (`q10/q50/q90`) per step.
 * - [ ] Prefer explicit series separation in API:
 *       - `history[]` + `forecast[]` (instead of one mixed `predictions[]`).
 *
 * ✅ Chart behavior / readability
 * - [ ] If `mae_per_step` exists: draw widening band across horizon (stepwise band).
 * - [ ] Add "Forecast start" marker using the backend split date (not xLabels index).
 * - [ ] Tooltip: display both values + uncertainty only when enabled; keep HTML minimal.
 *
 * ✅ Performance scaling
 * - [ ] For long histories: disable point symbols, use `showSymbol: false`, consider ECharts `sampling: 'lttb'`.
 * - [ ] Memoize heavy arrays (already using useMemo) and avoid rebuilding options unless needed.
 *
 * ✅ Component boundaries (avoid duplication with Predictions page)
 * - [ ] Decide ownership of top controls:
 *       Option A) Keep timeframe + MAE toggle inside AssetPriceVisualizer (single source of truth)
 *       Option B) Lift state to PredictionsPage and pass props:
 *         - timeframe, onTimeframeChange
 *         - showMaeBand, onToggleMae
 *       (Pick one and remove the other to prevent double UI / conflicting state.)
 */
