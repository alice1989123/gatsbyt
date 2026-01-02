"use client";

import coins from "@/app/coins";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./signals.module.css";
import "../app/globals.css";
import { useSignalQuery } from "@/hooks/useSignalQuery";

const get_icon = (coin: string) => {
  const coinData = coins.find((c) => c.symbol === coin);
  return coinData?.coinpng ?? "/icons/btc.png";
};

const OpenSignalsPage = () => {
  const openSignals = useSignalQuery("open_signals");

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.contentWrapper}>
        <section className={styles.container}>
          <header className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Open Signals</h2>

            <p className={styles.resultsSubtitle}>
              Live trade setups generated recently. Review entry, risk, and targets before acting.
            </p>

            <div className={styles.headerPill}>
              <span className={styles.pillDot} />
              Updated in real time • last 12h window
            </div>
          </header>

          {openSignals.loading ? (
            <p>Loading open signals...</p>
          ) : openSignals.error ? (
            <p>Error loading signals.</p>
          ) : (
            <section className={styles.statsSection}>
              <h3 className={styles.tableTitle}>Active Signals</h3>

              <div className={styles.scrollableTable}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Model</th>
                      <th>Created</th>
                      <th>Action</th>
                      <th>Entry</th>
                      <th>Stop Loss</th>
                      <th>Take Profit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {openSignals.data.map((signal: any, index: number) => {
                      const isBuy = signal.action === "BUY";

                      return (
                        <tr key={index}>
                          {/* Coin + (mobile-only) action pill in header */}
                          <td className={styles.coinTd} data-label="Coin">
                            <div className={styles.coinCell}>
                              <img
                                src={get_icon(signal.coin)}
                                alt={`${signal.coin} icon`}
                                className={styles.coinIcon}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/icons/default.png";
                                  e.currentTarget.style.objectFit = "contain";
                                }}
                              />

                              <div className={styles.coinSymbol}>
                                <span className={styles.coinTicker}>{signal.coin}</span>
                                <span className={styles.coinPairHint}>USDT</span>
                              </div>

                              {/* Mobile pill (hide on desktop via CSS) */}
                              <span
                                className={[
                                  styles.badge,
                                  isBuy ? styles.badgeBuy : styles.badgeShort,
                                  styles.mobileActionPill,
                                ].join(" ")}
                              >
                                {signal.action}
                              </span>
                            </div>
                          </td>

                          <td data-label="Model">{signal.model_name}</td>

                          <td data-label="Created">
                            {new Date(signal.created_at).toLocaleString()}
                          </td>

                          {/* Desktop action column (hide on mobile via CSS) */}
                          <td className={styles.actionRow} data-label="Action">
                            <span
                              className={[
                                styles.badge,
                                isBuy ? styles.badgeBuy : styles.badgeShort,
                              ].join(" ")}
                            >
                              {signal.action}
                            </span>
                          </td>

                          <td data-label="Entry">${signal.entry?.toFixed(2) ?? "-"}</td>
                          <td data-label="Stop Loss">${signal.stop_loss?.toFixed(2) ?? "-"}</td>
                          <td data-label="Take Profit">${signal.take_profit?.toFixed(2) ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OpenSignalsPage;
