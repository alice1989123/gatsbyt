"use client";

import React, { useEffect, useMemo, useState } from "react";
import AssetPriceVisualizer from "../components/AssetPriceVisualizer";
import coins from "../app/coins";
import { Coin, PredictionMetadata } from "@/types/types";
import CustomSelect from "../components/CustomSelect";
import { FaTelegramPlane } from "react-icons/fa";
import styles from "./predictions.module.css";

type Timeframe = "1H" | "4H" | "1D" | "1W";
const FAV_KEY = "gatsbyt_favorite_coins_v1";

export default function PredictionsPage() {
  const [coin, setCoin] = useState<Coin>(coins[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Sidebar UX
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Controls (today: hourly only)
  const supportedTimeframes = useMemo(
  () => new Set<Timeframe>(["1H", "4H",]),
  []
);
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");

  // MAE toggle
  const [showMaeBand, setShowMaeBand] = useState(true);

  // optional: read chart metadata to enable/disable MAE button
  const [chartMeta, setChartMeta] = useState<PredictionMetadata | null>(null);
  const canMae = !!(chartMeta?.mae != null && isFinite(Number(chartMeta.mae)));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 980);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Load favorites
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(new Set(parsed));
      }
    } catch {
      // ignore
    }

    setHydrated(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // keep timeframe valid
  useEffect(() => {
    if (!supportedTimeframes.has(timeframe)) setTimeframe("1H");
  }, [supportedTimeframes, timeframe]);

  const persistFavorites = (next: Set<string>) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  const toggleFavorite = (symbol: string) => {
    const next = new Set(favorites);
    if (next.has(symbol)) next.delete(symbol);
    else next.add(symbol);
    persistFavorites(next);
  };

  const options = useMemo(
    () =>
      coins.map((c) => ({
        label: c.name,
        value: c.symbol,
        icon: c.coinpng,
      })),
    []
  );

  const filteredCoins = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list =
      q.length === 0
        ? coins
        : coins.filter(
            (c) =>
              (c.name || "").toLowerCase().includes(q) ||
              (c.symbol || "").toLowerCase().includes(q)
          );

    // Favorites first
    return [...list].sort((a, b) => {
      const af = favorites.has(a.symbol) ? 1 : 0;
      const bf = favorites.has(b.symbol) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.name.localeCompare(b.name);
    });
  }, [query, favorites]);

  return (
    <div className={styles.layoutWrapper}>

      {/* HERO */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroWatermark} />
        <div className={styles.pageHeroInner}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.pageTitleRow}>
                <h1 className={styles.pageTitle}>Price Forecasts</h1>
                <span className={styles.pagePill}>Beta</span>
              </div>

              <p className={styles.pageSubtitle}>
                Interactive forecasts powered by our time-series models. Select an asset to view the projected path and confidence.
              </p>

              <div className={styles.pageActions}>
                <a
                  href="https://t.me/crypto_gatsbyt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaPrimary}
                >
                  <FaTelegramPlane className={styles.telegramIcon} />
                  Get alerts on Telegram
                </a>

                <span className={styles.ctaNote}>
                  Signals are informational only. Not financial advice.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebarWrap}>
          {!hydrated ? null : isMobile ? (
            <div className={styles.mobileSelectWrap}>
              <CustomSelect
                withIcons
                options={options}
                value={{ label: coin.name, value: coin.symbol, icon: coin.coinpng }}
                onChange={(option) => {
                  const selected = coins.find((c) => c.symbol === option.value);
                  if (selected) setCoin(selected);
                }}
              />
            </div>
          ) : (
            <div className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarTitle}>Assets</div>
                <div className={styles.sidebarHint}>Search + pin favorites</div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.sidebarSearch}
                  placeholder="Search (BTC, ETH, SOL...)"
                  aria-label="Search assets"
                />
              </div>

              <div className={styles.sidebarList}>
                {filteredCoins.map((c) => {
                  const selected = coin.symbol === c.symbol;
                  const fav = favorites.has(c.symbol);

                  return (
                    <button
                      key={c.symbol}
                      onClick={() => setCoin(c)}
                      className={`${styles.sidebarBtn} ${selected ? styles.sidebarBtnSelected : ""}`}
                      title={c.symbol}
                    >
                      <div className={styles.sidebarItem}>
                        <img
                          src={c.coinpng}
                          alt={`${c.name} icon`}
                          className={styles.icon}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/icons/default.png";
                            e.currentTarget.style.objectFit = "contain";
                          }}
                        />

                        <div className={styles.coinText}>
                          <span className={styles.coinLabel}>{c.name}</span>
                          <span className={styles.coinSymbol}>{c.symbol}</span>
                        </div>

                        <span
                          role="button"
                          aria-label={fav ? "Unfavorite asset" : "Favorite asset"}
                          className={`${styles.favoriteStar} ${fav ? styles.favoriteStarOn : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(c.symbol);
                          }}
                        >
                          ★
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.visualizerContainer}>
            {/* Chart header bar (THIS is the only place for controls) */}
            <div className={styles.visualizerHeader}>
              <div className={styles.visualizerHeaderLeft}>
                <img
                  src={coin.coinpng}
                  alt={`${coin.name} icon`}
                  className={styles.visualizerCoinIcon}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/default.png";
                    e.currentTarget.style.objectFit = "contain";
                  }}
                />
                <div className={styles.visualizerTitleBlock}>
                  <div className={styles.visualizerTitle}>{coin.name}</div>
                  <div className={styles.visualizerSub}>{coin.symbol}</div>
                </div>
              </div>

              <div className={styles.visualizerHeaderRight}>
                <div className={styles.tfGroup} aria-label="Timeframe">
                  {(["1H", "4H", "1D", "1W"] as Timeframe[]).map((tf) => {
                    const disabled = !supportedTimeframes.has(tf);
                    return (
                      <button
                        key={tf}
                        className={`${styles.tfBtn} ${timeframe === tf ? styles.tfBtnActive : ""} ${
                          disabled ? styles.tfBtnDisabled : ""
                        }`}
                        onClick={() => !disabled && setTimeframe(tf)}
                        type="button"
                        disabled={disabled}
                        title={disabled ? "Coming soon — models currently run on 1H candles" : ""}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className={`${styles.metaChip} ${showMaeBand ? styles.metaChipOn : ""} ${
                    !canMae ? styles.metaChipDisabled : ""
                  }`}
                  title={!canMae ? "MAE not available for this model output" : "Toggle ±MAE band"}
                  onClick={() => canMae && setShowMaeBand((v) => !v)}
                  disabled={!canMae}
                >
                  MAE {showMaeBand ? "shown in chart" : "hidden"}
                </button>
              </div>
            </div>

            <AssetPriceVisualizer
            coin={coin}
            timeframe={timeframe}
            showMaeBand={showMaeBand}
            onMetadata={setChartMeta}
          />
          </div>

          <div className={styles.explanationContainer}>
            <h4 className={styles.aboutTitle}>About this forecast</h4>

            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Training window</div>
                <div className={styles.infoValue}>June 2018 → Present (if available)</div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Inputs</div>
                <div className={styles.infoValue}>Closing price (and internal features)</div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Use</div>
                <div className={styles.infoValue}>Research & monitoring</div>
              </div>
            </div>

            <p className={styles.fineprint}>
              Forecasts are probabilistic estimates and may differ materially from real market prices due to volatility, news, and liquidity conditions.
              This tool does not provide investment advice.
            </p>
          </div>
        </main>
      </div>

      {/* Floating Telegram */}
      <a
        href="https://t.me/crypto_gatsbyt"
        className={styles.telegramFloating}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get alerts on Telegram"
      >
        <FaTelegramPlane />
      </a>

    </div>
  );
}
