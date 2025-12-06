"use client";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
import { ECharts } from "echarts";
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './onchain.module.css'; 
import SentimentVisualizer from '../components/SentimentVisualizer';
import { NewsItem } from '../types/types';
import EChartsReact from "echarts-for-react";
import '../app/globals.css';
const api = '/api/proxy'; 
import CustomSelect from "@/components/CustomSelect";

const OnChain = () => {

 
  const [selectedMetric, setSelectedMetric] = useState("total_value_transferred_usd");
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
    description:
      "Daily BTC/USD price used for converting on-chain metrics to USD.",
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
  
      <div className={styles.selectorWrapper} >
        <CustomSelect
          options={Object.keys(metricMap).map((key) => ({
            label: metricMap[key].label,
            value: key,
          }))}
          value={{
            label: metricMap[selectedMetric]?.label || selectedMetric,
            value: selectedMetric,
          }}
          onChange={(option) => {
            setSelectedMetric(option.value);
          }}
          placeholder="Select a metric..."
          width="360px"
        />

          {/* ℹ️ hover tooltip */}
          <div className={styles.tooltipWrapper}>
          <span className={styles.infoIcon}>ℹ️</span>
          <div className={styles.tooltipContent}>
            {metricMap[selectedMetric].description}
          </div>
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
