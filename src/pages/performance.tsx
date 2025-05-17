"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './performance.module.css';
import '../app/globals.css';

import { useSignalQuery } from '@/hooks/useSignalQuery';

const PerformancePage = () => {
  const tradeStats = useSignalQuery('trade_stats');
  const volumeStats = useSignalQuery('volume_summary');
  const modelSummary = useSignalQuery('model_summary');
  const byCoin = useSignalQuery('by_coin');
  const outcomeSummary = useSignalQuery('outcome_summary');

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.contentWrapper}>
        <section className={styles.container}>
          <header className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>📈 Strategy Results</h2>
            <p className={styles.resultsSubtitle}>
              Latest predictions and signal performance across all models.
            </p>
          </header>

          {tradeStats.loading || volumeStats.loading || modelSummary.loading || byCoin.loading || outcomeSummary.loading ? (
            <p>Loading summary data...</p>
          ) : tradeStats.error || volumeStats.error || modelSummary.error || byCoin.error || outcomeSummary.error ? (
            <p>Error loading summary data.</p>
          ) : (
            <div className={styles.tablesSection}>
              <section className={styles.statsSection}>
                <h3 className={styles.tableTitle}>Volume & Trade Stats</h3>
                <div className={styles.scrollableTable}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Total Profit</td><td>${tradeStats.data.total_profit.toFixed(2)}</td></tr>
                      <tr><td>Avg Profit/Trade</td><td>${tradeStats.data.avg_profit_per_trade.toFixed(2)}</td></tr>
                      <tr><td>Total Trades</td><td>{tradeStats.data.total_trades}</td></tr>
                      <tr><td>Total Entry Volume</td><td>${volumeStats.data.total_entry_volume.toFixed(2)}</td></tr>
                      <tr><td>Total Exit Volume</td><td>${volumeStats.data.total_exit_volume.toFixed(2)}</td></tr>
                      <tr><td>Total Volume Profit</td><td>${volumeStats.data.total_profit.toFixed(2)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.statsSection}>
                <h3 className={styles.tableTitle}>Model Summary</h3>
                <div className={styles.scrollableTable}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Trades</th>
                        <th>Total Entry</th>
                        <th>Total Profit</th>
                        <th>ROI %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelSummary.data.map((item :any, index :any) => (
                        <tr key={index}>
                          <td>{item.model_name}</td>
                          <td>{item.trades}</td>
                          <td>${item.total_entry.toFixed(2)}</td>
                          <td>${item.total_profit.toFixed(2)}</td>
                          <td>{item.roi_percent.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.statsSection}>
                <h3 className={styles.tableTitle}>Performance by Coin</h3>
                <div className={styles.scrollableTable}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Coin</th>
                        <th>Trades</th>
                        <th>Total Entry</th>
                        <th>Total Profit</th>
                        <th>ROI %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byCoin.data.map((item:any, index:any) => (
                        <tr key={index}>
                          <td>{item.coin}</td>
                          <td>{item.trades}</td>
                          <td>${item.total_entry.toFixed(2)}</td>
                          <td>${item.total_profit.toFixed(2)}</td>
                          <td>{item.roi_percent.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.statsSection}>
                <h3 className={styles.tableTitle}>Outcome Summary</h3>
                <div className={styles.scrollableTable}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Outcome</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomeSummary.data.map((item:any, index:any) => (
                        <tr key={index}>
                          <td>{item.outcome}</td>
                          <td>{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PerformancePage;
