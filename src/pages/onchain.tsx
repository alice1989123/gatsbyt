"use client";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
import { ECharts } from "echarts";
import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import styles from './onchain.module.css'; 
import SentimentVisualizer from '../app/components/SentimentVisualizer';
import { NewsItem } from '../types/types';
import EChartsReact from "echarts-for-react";
import '../app/globals.css';
const api = '/api/proxy'; 

const OnChain = () => {

  const metricOptions = [
    "Number of blocks mined",
    "avg_block_size_per_day",
    "avg_tx_per_block_per_day",
    "avg_block_weight",
    "difficulty_over_time",
    "total_value_transferred_per_day",
    "avg_fee_per_day",
    "total_value_transferred_usd_per_day"
  ];

 
  
  const [selectedMetric, setSelectedMetric] = useState("total_value_transferred_usd_per_day");
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${api}?resource=on_chain_metrics&metric_name=${selectedMetric}`);
        const json = await res.json();
        const formatted = json.map((item: any) => [item.timestamp, item.value]);
        setSeriesData(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
  
    fetchData();
  }, [selectedMetric]); 
  const metricMap: {
    [key: string]: { label: string; description: string }
  } = {
    "Number of blocks mined": {
      label: "Number of Blocks Mined",
      description: "The total number of Bitcoin blocks mined on each day. Indicates network activity and block production rate."
    },
    "avg_block_size_per_day": {
      label: "Average Block Size Per Day",
      description: "The average size (in bytes) of all blocks mined on a given day. Reflects how full blocks are with transaction data."
    },
    "avg_tx_per_block_per_day": {
      label: "Average Transactions Per Block Per Day",
      description: "The average number of transactions included in each block per day. Shows how densely packed the blocks are."
    },
    "avg_block_weight": {
      label: "Average Block Weight",
      description: "The average weight units of blocks per day (up to 4 million units per block). This includes SegWit discounts and witness data."
    },
    "difficulty_over_time": {
      label: "Difficulty Over Time",
      description: "The mining difficulty adjustment value over time. A higher value indicates more competition and hash power on the network."
    },
    "total_value_transferred_per_day": {
      label: "Total BTC Transferred Per Day",
      description: "The sum of all Bitcoin moved on-chain on each day, measured in BTC. Useful for gauging overall transaction volume."
    },
    "avg_fee_per_day": {
      label: "Average Fee Per Day",
      description: "The average transaction fee paid per day, measured in satoshis. Reflects network congestion and fee market dynamics."
    },
    "total_value_transferred_usd_per_day": {
      label: "Total USD Transferred Per Day",
      description: "The total value of Bitcoin transferred per day, converted to USD using historical BTC prices."
    }
  };
  const chartOptions = {
    title: {
      text: metricMap[selectedMetric]?.label || selectedMetric,      textStyle: {
        color: "#ffffff"
      }
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value :number) => {
        return new Intl.NumberFormat('en-US', {
          notation: "compact",
          maximumFractionDigits: 2
        }).format(value);
      }
    },
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: "#ffffff" } },
      axisLabel: { color: "#ffffff" }
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#ffffff" } },
      axisLabel: {
        color: "#ffffff",
        formatter: (value:number) =>
          new Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 2
          }).format(value)
      }
    },
    series: [
      {
        name: metricMap[selectedMetric]?.label || selectedMetric, 
        type: "line",
        data: seriesData,
        showSymbol: false,
        smooth: true
      }
    ],
    dataZoom: [
      {
        type: "inside",
        start: 70,
        end: 100
      },
      {
        start: 70,
        end: 100
      }
    ]
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      backgroundColor: "#13195c"
    }}>
      <Header />
      
      <div className={styles.page} style={{ flex: 1, padding: "2rem 1rem" }}>
        <h1 className={styles.title}>On Chain Metrics</h1>
  
        <div style={{ textAlign: "center", color: "#ffffff", marginBottom: "20px" }}>
        <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap"
              }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
              Explore Key Blockchain Activity
            </h2>
          </div>
          <p style={{ fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            Choose a metric below to visualize Bitcoin’s on-chain activity over time, including fees, block size, transaction volume and more.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "10px" }}>
  <select
    value={selectedMetric}
    onChange={(e) => setSelectedMetric(e.target.value)}
    style={{ padding: "8px", fontSize: "16px" }}
  >
    {Object.keys(metricMap).map((key) => (
      <option key={key} value={key}>{metricMap[key].label}</option>
    ))}
  </select>

  {/* ℹ️ hover tooltip */}
  <div className={styles.tooltipWrapper}>
  <span className={styles.infoIcon}>ℹ️</span>
  <div className={styles.tooltipContent}>
    {metricMap[selectedMetric].description}
  </div>
</div>

</div>
  
       
        <EChartsReact option={chartOptions} style={{ height: "500px", width: "100%" }} />
      </div>
  
      <Footer />
    </div>
  );
};


export default OnChain;
