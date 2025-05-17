import React from 'react';
import styles from './SummaryCards.module.css';

export const SummaryCards = ({ stats, volume }: { stats: any; volume: any }) => {
  const format = (value: any) => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <div className={styles.cardGrid}>
      {stats && volume ? (
        <>
          <div className={styles.card}><h4>Total Profit</h4><p>${format(stats.total_profit)}</p></div>
          <div className={styles.card}><h4>Avg Profit/Trade</h4><p>${format(stats.avg_profit_per_trade)}</p></div>
          <div className={styles.card}><h4>Total Trades</h4><p>{stats.total_trades ?? 0}</p></div>
          <div className={styles.card}><h4>Total Entry Volume</h4><p>${format(volume.total_entry_volume)}</p></div>
          <div className={styles.card}><h4>Total Exit Volume</h4><p>${format(volume.total_exit_volume)}</p></div>
          <div className={styles.card}><h4>Total Volume Profit</h4><p>${format(volume.total_profit)}</p></div>
        </>
      ) : (
        <p>Loading cards...</p>
      )}
    </div>
  );
};
