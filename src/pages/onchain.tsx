"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./onchain.module.css";
import EChartsReact from "echarts-for-react";
import CustomSelect from "@/components/CustomSelect";

const api = "/api/proxy";

type MetricInfo = { label: string; description: string };
type MetricMap = Record<string, MetricInfo>;
type RangePreset = "1M" | "6M" | "1Y" | "ALL";
type Point = [string | number | Date, number]; // echarts time series

const metricMap: MetricMap = {
  blocks_mined: {
    label: "Blocks Mined Per Day",
    description:
      "Total number of Bitcoin blocks mined each day. Indicates block production rate and overall network activity.",
  },
  avg_block_size_bytes: {
    label: "Average Block Size (Bytes)",
    description:
      "Average size in bytes of blocks mined each day. Reflects how full blocks are with transaction data.",
  },
  avg_tx_per_block: {
    label: "Average Transactions Per Block",
    description:
      "Average number of transactions included in each block per day. Shows how densely packed blocks are.",
  },
  avg_block_weight: {
    label: "Average Block Weight",
    description:
      "Average block weight units per day (up to 4M units per block). Includes SegWit discounts and witness data.",
  },
  avg_difficulty: {
    label: "Mining Difficulty",
    description:
      "Average mining difficulty per day. Higher values indicate more hash power and competition on the network.",
  },
  total_value_transferred_btc: {
    label: "Total BTC Transferred Per Day",
    description:
      "Total amount of BTC moved on-chain each day. Useful for gauging on-chain economic activity.",
  },
  avg_fee_btc: {
    label: "Average Fee (BTC)",
    description:
      "Average transaction fee per day, measured in BTC. Reflects fee market pressure and congestion.",
  },
  btc_usd_rate: {
    label: "BTC/USD Rate",
    description: "Daily BTC/USD price used for converting on-chain metrics to USD.",
  },
  total_value_transferred_usd: {
    label: "Total USD Transferred Per Day",
    description:
      "Total value of BTC moved on-chain per day, converted to USD using the daily BTC price.",
  },
  avg_fee_usd: {
    label: "Average Fee (USD)",
    description:
      "Average transaction fee per day, converted to USD. Combines fee pressure with BTC price.",
  },
};

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function toMs(ts: string | number | Date) {
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  const d = new Date(ts);
  return d.getTime();
}

function movingAverage(points: Point[], windowSize: number): Point[] {
  if (windowSize <= 1) return points;
  const out: Point[] = [];
  let sum = 0;
  const q: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const v = points[i][1];
    q.push(v);
    sum += v;
    if (q.length > windowSize) sum -= q.shift()!;
    const avg = sum / q.length;
    out.push([points[i][0], avg]);
  }
  return out;
}

function filterByRange(points: Point[], preset: RangePreset): Point[] {
  if (preset === "ALL") return points;
  if (points.length === 0) return points;

  const lastMs = toMs(points[points.length - 1][0]);
  const days =
    preset === "1M" ? 30 : preset === "6M" ? 183 : preset === "1Y" ? 365 : 0;
  const cutoff = lastMs - days * 24 * 60 * 60 * 1000;

  return points.filter((p) => toMs(p[0]) >= cutoff);
}

function computeStats(points: Point[]) {
  if (points.length === 0) return { latest: null, avg7: null, change30: null };

  const latest = points[points.length - 1][1];

  const last7 = points.slice(Math.max(0, points.length - 7));
  const avg7 =
    last7.reduce((acc, p) => acc + p[1], 0) / Math.max(1, last7.length);

  // 30D change: compare latest to value ~30 points back (daily series assumption)
  const idx30 = points.length - 31;
  const base30 = idx30 >= 0 ? points[idx30][1] : null;
  const change30 =
    base30 && base30 !== 0 ? ((latest - base30) / base30) * 100 : null;

  return { latest, avg7, change30 };
}

const OnChain = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>(
    "total_value_transferred_usd"
  );

  const [rawSeries, setRawSeries] = useState<Point[]>([]);
  const [range, setRange] = useState<RangePreset>("1Y");
  const [smooth7d, setSmooth7d] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `${api}?resource=on_chain_metrics&metric_name=${selectedMetric}`
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();

        // Expected: [{ timestamp, value }, ...]
        const formatted: Point[] = (json ?? [])
          .map((item: any) => [item.timestamp, Number(item.value)] as Point)
          .filter((p: Point) => Number.isFinite(p[1]))
          .sort((a: any, b: any) => toMs(a[0]) - toMs(b[0]));

        if (!cancelled) setRawSeries(formatted);
      } catch (err: any) {
        if (!cancelled) setErrorMsg(err?.message || "Unknown fetch error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedMetric]);

  const displaySeries = useMemo(() => {
    const ranged = filterByRange(rawSeries, range);
    const smoothed = smooth7d ? movingAverage(ranged, 7) : ranged;
    return smoothed;
  }, [rawSeries, range, smooth7d]);

  const stats = useMemo(() => computeStats(displaySeries), [displaySeries]);

  const metricInfo = metricMap[selectedMetric] ?? {
    label: selectedMetric,
    description: "No description available for this metric.",
  };

  const chartOptions = useMemo(() => {
    return {
      backgroundColor: "transparent",
      grid: { left: 55, right: 25, top: 40, bottom: 55 },

      title: {
        text: metricInfo.label,
        left: "left",
        top: 0,
        textStyle: { color: "rgba(255,255,255,0.92)", fontSize: 14 },
      },

      tooltip: {
        trigger: "axis",
        borderWidth: 0,
        backgroundColor: "rgba(20, 25, 40, 0.92)",
        textStyle: { color: "#fff" },
        axisPointer: { type: "line" },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const date = new Date(p.value[0]);
          const val = Number(p.value[1]);
          return `
            <div style="font-size:12px; opacity:.85;">${date.toLocaleDateString()}</div>
            <div style="font-size:14px; font-weight:700; margin-top:2px;">${formatCompact(
              val
            )}</div>
          `;
        },
      },

      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.25)" } },
        axisLabel: { color: "rgba(255,255,255,0.75)" },
        splitLine: { show: false },
      },

      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.25)" } },
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
          formatter: (v: number) => formatCompact(v),
        },
        splitLine: {
          show: true,
          lineStyle: { color: "rgba(255,255,255,0.08)" },
        },
      },

      series: [
        {
          name: metricInfo.label,
          type: "line",
          data: displaySeries,
          showSymbol: false,
          smooth: true,
          lineStyle: { width: 2 },
          emphasis: { focus: "series" },
          areaStyle: { opacity: 0.06 },
        },
      ],

      dataZoom: [
        { type: "inside", throttle: 60 },
        {
          type: "slider",
          height: 22,
          bottom: 10,
          borderColor: "rgba(255,255,255,0.15)",
          fillerColor: "rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.03)",
          textStyle: { color: "rgba(255,255,255,0.65)" },
        },
      ],
    };
  }, [metricInfo.label, displaySeries]);

  return (
    <div className={styles.root}>
      <main className={styles.page}>
        <div className={styles.content}>
          <header className={styles.hero}>
            <h1 className={styles.title}>On-Chain Metrics</h1>
            <p className={styles.subtitle}>
              Explore Bitcoin’s on-chain activity over time — fees, block size,
              transaction volume, and more.
            </p>
          </header>

          <section className={styles.controlsCard}>
            <div className={styles.controlsRow}>
              <div className={styles.metricSelect}>
                <span className={styles.controlLabel}>Metric</span>
                <CustomSelect
                  options={Object.keys(metricMap).map((key) => ({
                    label: metricMap[key].label,
                    value: key,
                  }))}
                  value={{
                    label: metricMap[selectedMetric]?.label || selectedMetric,
                    value: selectedMetric,
                  }}
                  onChange={(option) => setSelectedMetric(option.value)}
                  placeholder="Select a metric..."
                  width="360px"
                />
              </div>

              <div className={styles.rightControls}>
                <div className={styles.rangeGroup}>
                  <span className={styles.controlLabel}>Range</span>
                  <div className={styles.rangeButtons}>
                    {(["1M", "6M", "1Y", "ALL"] as RangePreset[]).map((p) => (
                      <button
                        key={p}
                        className={`${styles.rangeBtn} ${
                          range === p ? styles.rangeBtnActive : ""
                        }`}
                        onClick={() => setRange(p)}
                        type="button"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleGroup}>
                  <span className={styles.controlLabel}>Smoothing</span>
                  <button
                    className={`${styles.toggleBtn} ${
                      smooth7d ? styles.toggleOn : styles.toggleOff
                    }`}
                    onClick={() => setSmooth7d((v) => !v)}
                    type="button"
                    aria-pressed={smooth7d}
                    title="Toggle 7D moving average"
                  >
                    {smooth7d ? "7D MA: ON" : "7D MA: OFF"}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.metricDescription}>
              <div className={styles.metricName}>{metricInfo.label}</div>
              <div className={styles.metricDescText}>{metricInfo.description}</div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Latest</div>
                <div className={styles.statValue}>
                  {stats.latest == null ? "-" : formatCompact(stats.latest)}
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>7D Avg</div>
                <div className={styles.statValue}>
                  {stats.avg7 == null ? "-" : formatCompact(stats.avg7)}
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>30D Change</div>
                <div className={styles.statValue}>
                  {stats.change30 == null
                    ? "-"
                    : `${stats.change30.toFixed(2)}%`}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.chartCard}>
            {loading ? (
              <div className={styles.stateBox}>Loading data…</div>
            ) : errorMsg ? (
              <div className={styles.stateBoxError}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn’t load metric</div>
                <div style={{ opacity: 0.85, fontSize: 13 }}>{errorMsg}</div>
              </div>
            ) : rawSeries.length === 0 ? (
              <div className={styles.stateBox}>No data returned for this metric.</div>
            ) : (
              <EChartsReact option={chartOptions} style={{ height: 520, width: "100%" }} />
            )}
          </section>
        </div>
      </main>

    </div>
  );
};

export default OnChain;
