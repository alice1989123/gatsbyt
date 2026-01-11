"use client";

import styles from "./AssetVisualizer.module.css";
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption, SeriesOption } from "echarts";
import { PriceData, Coin, PredictionMetadata } from "@/types/types";
import { fetchWithAuthRedirect } from "@/lib/fetchWithAuthRedirect";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const api = "/api/proxy";
const pricesLength = 120;
const DEFAULT_HORIZON = 12;

// colors (match your design)
const COLOR_HIST = "#E5E7EB";
const COLOR_PRED = "#22C55E";
const COLOR_BAND = "rgba(34, 197, 94, 0.12)";
const COLOR_GRID = "rgba(255,255,255,0.08)";
const COLOR_AXIS = "rgba(255,255,255,0.35)";
const COLOR_LABEL = "rgba(255,255,255,0.75)";
const COLOR_POINTER = "rgba(255,255,255,0.22)";

interface AssetPriceVisualizerProps {
  coin: Coin;
  timeframe: "1H" | "4H" | "1D" | "1W";
  showMaeBand?: boolean;
  onMetadata?: (meta: PredictionMetadata | null) => void;
}

function timeframeToInterval(tf: "1H" | "4H" | "1D" | "1W"): string {
  switch (tf) {
    case "1H":
      return "1h";
    case "4H":
      return "4h";
    case "1D":
      return "1d";
    case "1W":
      return "1w";
    default:
      return "1h";
  }
}

function formatUsdAdaptive(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return "—";
  const ax = Math.abs(x);
  const maxFrac =
    ax >= 1000 ? 0 : ax >= 1 ? 2 : ax >= 0.01 ? 4 : ax >= 1e-4 ? 6 : ax >= 1e-6 ? 8 : 10;

  if (ax > 0 && ax < 1e-10) return `$${x.toExponential(2)}`;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  }).format(x);
}

function formatAxisCompact(value: number): string {
  if (!isFinite(value)) return "—";
  const ax = Math.abs(value);
  if (ax >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`.replace(/\.0$/, "");
  if (ax >= 1000) return `${(value / 1000).toFixed(0)}k`;
  if (ax >= 1) return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  if (ax >= 0.01) return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

// API returns "YYYY-MM-DDTHH:mm:ss" (no timezone) -> treat as UTC
function parseApiUtcMs(dateString: string): number {
  const iso = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  return new Date(iso).getTime();
}

function parseToLocalLabelFromApiUtc(dateString: string) {
  const t = parseApiUtcMs(dateString);
  if (!isFinite(t)) return dateString;
  return new Date(t).toLocaleString();
}

// Price can be a number OR an object like { source: "89400.0", parsedValue: 89400 }
function getNumericPrice(p: any): number {
  const v = p?.price;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v && typeof v === "object") {
    if (typeof v.parsedValue === "number") return v.parsedValue;
    if (typeof v.source === "string") return Number(v.source);
  }
  return Number(v);
}

export default function AssetPriceVisualizer({
  coin,
  timeframe,
  showMaeBand = true,
  onMetadata,
}: AssetPriceVisualizerProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [metadata, setMetadata] = useState<PredictionMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch per coin + timeframe
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setPrices([]);
      setMetadata(null);
      onMetadata?.(null);

      try {
        const interval = timeframeToInterval(timeframe);
        const url =
        `${api}?resource=predictions` +
        `&coin=${encodeURIComponent(coin.symbol)}` +
        `&interval=${encodeURIComponent(interval)}` +
        `&model_name=GRU`;

        const res = await fetchWithAuthRedirect(url, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list: PriceData[] = Array.isArray(data?.predictions) ? data.predictions : [];
        const meta: PredictionMetadata | null = data?.metadata ?? null;

        if (!mounted) return;

        const normalized = [...list].sort((a, b) => parseApiUtcMs(a.date) - parseApiUtcMs(b.date));

        // Prefer "model window" (input + label) if available, otherwise last N points
        const iw = Number((meta as any)?.input_width);
        const lw = Number((meta as any)?.label_width ?? DEFAULT_HORIZON);
        const wantModel = isFinite(iw) && iw > 0 && isFinite(lw) && lw > 0 ? iw + lw : NaN;

        const want = isFinite(wantModel)
          ? Math.min(normalized.length, Math.max(20, wantModel))
          : Math.min(normalized.length, pricesLength);

        // Always take the most recent chunk
        const sliced = normalized.slice(-want);

        setPrices(sliced);
        setMetadata(meta);
        onMetadata?.(meta);
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error("❌ fetch predictions:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
    // NOTE: intentionally NOT depending on onMetadata to avoid ref-churn re-fetch loops
  }, [coin.symbol, timeframe]);

  const xLabels = useMemo(() => prices.map((p) => parseToLocalLabelFromApiUtc(p.date)), [prices]);

  const numericPrices = useMemo(() => prices.map((p) => getNumericPrice(p)), [prices]);

  const [minPrice, maxPrice] = useMemo(() => {
    const vals = numericPrices.filter((v) => isFinite(v));
    if (vals.length === 0) return [0, 1];
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const pad = (maxV - minV) * 0.06 || maxV * 0.01 || 1;
    return [minV - pad, maxV + pad];
  }, [numericPrices]);

  const labelWidth = useMemo(() => {
    const h = Number((metadata as any)?.label_width ?? DEFAULT_HORIZON);
    if (!isFinite(h) || h <= 0) return DEFAULT_HORIZON;
    return Math.max(1, Math.min(h, Math.max(1, prices.length - 1)));
  }, [metadata, prices.length]);

  const inputWidth = useMemo(() => {
    const iw = Number((metadata as any)?.input_width);
    return isFinite(iw) && iw > 0 ? iw : null;
  }, [metadata]);

  // Forecast start: if we have input_width and we sliced exactly iw+lw, start = iw
  // Otherwise, fall back to "last labelWidth points are forecast"
  const forecastStartIndex = useMemo(() => {
    if (prices.length <= 1) return 0;

    if (inputWidth != null && prices.length >= inputWidth + labelWidth) {
      return prices.length - labelWidth; // robust even if extra context sneaks in
    }

    if (inputWidth != null && inputWidth < prices.length) return inputWidth;

    return Math.max(0, prices.length - labelWidth);
  }, [prices.length, inputWidth, labelWidth]);

  const maeGlobal = useMemo(() => {
    const v = (metadata as any)?.mae;
    const n = v != null ? Number(v) : NaN;
    return isFinite(n) ? n : null;
  }, [metadata]);

  const maePerStep = useMemo(() => {
    const arr = (metadata as any)?.mae_per_step;
    if (!Array.isArray(arr)) return null;
    const nums = arr.map((x: any) => Number(x));
    return nums.every((n: number) => isFinite(n)) ? nums : null;
  }, [metadata]);

  const stepMaeAtIndex = (i: number): number | null => {
    if (i < forecastStartIndex) return null;
    const step = i - forecastStartIndex; // 0..labelWidth-1
    if (maePerStep && step >= 0 && step < maePerStep.length) return maePerStep[step];
    return maeGlobal; // fallback
  };

  const lowerBand = useMemo(() => {
    if (!showMaeBand) return null;
    return prices.map((_, i) => {
      const m = stepMaeAtIndex(i);
      if (m == null) return null;
      return getNumericPrice(prices[i]) - m;
    });
  }, [prices, forecastStartIndex, maePerStep, maeGlobal, showMaeBand]);

  const upperMinusLower = useMemo(() => {
    if (!showMaeBand) return null;
    return prices.map((_, i) => {
      const m = stepMaeAtIndex(i);
      if (m == null) return null;
      return 2 * m;
    });
  }, [prices, forecastStartIndex, maePerStep, maeGlobal, showMaeBand]);

  const options: EChartsOption = useMemo(() => {
    if (prices.length === 0) {
      return {
        textStyle: { color: "lightgray" },
        title: {
          text: loading ? "Loading..." : "No data available",
          left: "center",
          top: "middle",
          textStyle: { color: "lightgray", fontSize: 16 },
        },
      };
    }

    const forecastLabel = xLabels[Math.min(forecastStartIndex, xLabels.length - 1)];
    const series: SeriesOption[] = [];

    // confidence band (stack trick)
    if (showMaeBand && lowerBand && upperMinusLower) {
      series.push(
        {
          name: "LowerBand",
          type: "line",
          data: lowerBand,
          stack: "band",
          symbol: "none",
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 },
          tooltip: { show: false },
          emphasis: { disabled: true },
        } as SeriesOption,
        {
          name: "±MAE band",
          type: "line",
          data: upperMinusLower,
          stack: "band",
          symbol: "none",
          lineStyle: { opacity: 0 },
          areaStyle: { color: COLOR_BAND, opacity: 1 },
          tooltip: { show: false },
          emphasis: { disabled: true },
        } as SeriesOption
      );
    }

    // historical
    series.push({
      name: "Historical Price",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      data: numericPrices.map((v, i) => (i < forecastStartIndex ? v : null)),
      lineStyle: { width: 2, color: COLOR_HIST },
      itemStyle: { color: COLOR_HIST },
      emphasis: { focus: "series" },
    } as SeriesOption);

    // predicted (+ bridge)
    series.push({
      name: "Predicted Price",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      data: numericPrices.map((v, i) => {
        if (i === forecastStartIndex - 1) return v; // bridge point
        return i >= forecastStartIndex ? v : null;
      }),
      lineStyle: { width: 2, color: COLOR_PRED },
      itemStyle: { color: COLOR_PRED },
      emphasis: { focus: "series" },
      markLine: {
        symbol: ["none", "none"],
        label: {
          show: true,
          formatter: "Forecast starts",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 900,
        },
        lineStyle: {
          color: "rgba(255,255,255,0.35)",
          type: "dashed",
          width: 1.5,
        },
        data: [{ xAxis: forecastLabel }],
      },
    } as SeriesOption);

    return {
      animation: false,
      textStyle: { color: "lightgray" },

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          lineStyle: { color: COLOR_POINTER, width: 1, type: "dashed" },
          crossStyle: { color: COLOR_POINTER, width: 1, type: "dashed" },
        },
        backgroundColor: "#121318",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#fff", fontSize: 12 },
        formatter: (params: any) => {
          const axisValue = params?.[0]?.axisValue ?? "";
          const hist = params.find((p: any) => p.seriesName === "Historical Price");
          const pred = params.find((p: any) => p.seriesName === "Predicted Price");

          const histVal = hist?.data;
          const predVal = pred?.data;

          const idx = params?.[0]?.dataIndex;
          const stepMae = typeof idx === "number" ? stepMaeAtIndex(idx) : null;

          const lines: string[] = [`<div style="font-weight:900;margin-bottom:4px;">${axisValue}</div>`];

          if (histVal != null) lines.push(`Historical: <b>${formatUsdAdaptive(histVal)}</b>`);
          if (predVal != null) lines.push(`Predicted: <b>${formatUsdAdaptive(predVal)}</b>`);

          if (showMaeBand && predVal != null && stepMae != null) {
            lines.push(
              `±MAE(step): <b>${formatUsdAdaptive(stepMae)}</b>`,
              `Range: <b>${formatUsdAdaptive(predVal - stepMae)}</b> → <b>${formatUsdAdaptive(predVal + stepMae)}</b>`
            );
          }

          return lines.join("<br/>");
        },
      },

      grid: {
        left: isMobile ? 44 : 60,
        right: 14,
        bottom: isMobile ? 58 : 46,
        top: 22,
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: xLabels,
        axisLine: { lineStyle: { color: COLOR_AXIS } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: COLOR_LABEL,
          fontSize: isMobile ? 9 : 12,
          rotate: isMobile ? 45 : 0,
        },
      },

      yAxis: {
        type: "value",
        min: minPrice,
        max: maxPrice,
        axisLine: { lineStyle: { color: COLOR_AXIS } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: COLOR_GRID } },
        axisLabel: {
          color: COLOR_LABEL,
          fontSize: isMobile ? 10 : 12,
          margin: 10,
          formatter: (v: number) => formatAxisCompact(v),
        },
      },

      dataZoom: [
        ...(isMobile
          ? []
          : [
              {
                type: "slider",
                show: true,
                xAxisIndex: 0,
                start: 70,
                end: 100,
                bottom: 10,
                height: 20,
              },
            ]),
        { type: "inside", xAxisIndex: 0, start: 70, end: 100 },
      ],

      series,
    };
  }, [
    prices,
    loading,
    xLabels,
    isMobile,
    minPrice,
    maxPrice,
    forecastStartIndex,
    numericPrices,
    showMaeBand,
    lowerBand,
    upperMinusLower,
  ]);

  return (
    <div className={styles.visualizerChart}>
      {loading ? (
        <div className={styles.loaderWrapper}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      ) : (
        <ReactECharts option={options} style={{ width: "100%", height: "100%" }} notMerge />
      )}
    </div>
  );
}
