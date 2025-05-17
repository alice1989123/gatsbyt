"use client";
import coins from '@/app/coins';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './signals.module.css';
import '../app/globals.css';

import { useSignalQuery } from '@/hooks/useSignalQuery';
import { get } from 'http';

const get_icon = (coin: string) => {
  const coinData = coins.find((c) => c.symbol === coin);
  if (coinData) {
    return coinData.coinpng;
  }
  return "/icons/btc.png";
};

const OpenSignalsPage = () => {
  const openSignals = useSignalQuery('open_signals');

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.contentWrapper}>
        <section className={styles.container}>
          <header className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>📡 Open Signals</h2>
            <p className={styles.resultsSubtitle}>
              Signals generated in the last 12 hours, currently open for action.
            </p>
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
                    {openSignals.data.map((signal: any, index: number) => (
                      <tr key={index}>
                        <td> <div className={styles.coinWrapper}><img
                              src={get_icon(signal.coin)}
                              alt={`${signal.coin} icon`}
                              className={styles.coinIcon}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/icons/default.png";
                                e.currentTarget.style.objectFit = "contain";
                              }}
                            /> 
                            </div>
                        {signal.coin}
                        </td>
                        <td>{signal.model_name}</td>
                        <td>{new Date(signal.created_at).toLocaleString()}</td>
                        <td className={signal.action === 'BUY' ? styles.positive : styles.negative}>
                          {signal.action}
                        </td>
                        <td>${signal.entry?.toFixed(2) ?? '-'}</td>
                        <td>${signal.stop_loss?.toFixed(2) ?? '-'}</td>
                        <td>${signal.take_profit?.toFixed(2) ?? '-'}</td>
                      </tr>
                    ))}
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
