"use client";

import React, { useEffect, useMemo, useState } from "react";
import AssetPriceVisualizer from "../components/AssetPriceVisualizer";
import coins from "../app/coins";
import { Coin } from "@/types/types";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomSelect from "../components/CustomSelect";
import { FaTelegramPlane } from "react-icons/fa";
import styles from "./predictions.module.css";

// NOTE (Pages Router):
// Do NOT import globals.css here. Put it in src/pages/_app.tsx.

export default function PredictionsPage() {
  const [coin, setCoin] = useState<Coin>(coins[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    setHydrated(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const options = useMemo(
    () =>
      coins.map((c) => ({
        label: c.name,
        value: c.symbol,
        icon: c.coinpng,
      })),
    []
  );

  return (
    <div className={styles.layoutWrapper}>
      <Header />

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
                Interactive forecasts powered by our time-series models. Select an asset to view
                the projected path and confidence.
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
                value={{
                  label: coin.name,
                  value: coin.symbol,
                  icon: coin.coinpng,
                }}
                onChange={(option) => {
                  const selected = coins.find((c) => c.symbol === option.value);
                  if (selected) setCoin(selected);
                }}
              />
            </div>
          ) : (
            <div className={styles.sidebar}>
              {coins.map((c) => {
                const selected = coin.symbol === c.symbol;
                return (
                  <button
                    key={c.symbol}
                    onClick={() => setCoin(c)}
                    className={`${styles.sidebarBtn} ${selected ? styles.sidebarBtnSelected : ""}`}
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
                      <span className={styles.coinLabel}>{c.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.visualizerContainer}>
            <AssetPriceVisualizer coin={coin} />
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
              Forecasts are probabilistic estimates and may differ materially from real market prices
              due to volatility, news, and liquidity conditions. This tool does not provide investment
              advice.
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

      <Footer />
    </div>
  );
}
