"use client";
import styles from './AssetVisualizer.module.css';import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PriceData , Coin } from "@/types/types";
import type { EChartsOption, SeriesOption } from 'echarts';
import { PredictionMetadata } from '@/types/types';



const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


//const  api = process.env.API ? process.env.API : "http://localhost:3000/api/crypto";
const api = "/api/proxy";

const pricesLength = 120;

interface AssetPriceVisualizerProps {
  coin: Coin;
}

interface History{
  val_loss: number[]
  val_mean_absolute_error: number[]
  mean_absolute_error: number[]
  loss: number[]  }



  function formatUsdAdaptive(
    x: number | null | undefined,
    opts: Intl.NumberFormatOptions = {}
  ): string {
    if (x == null || !isFinite(x)) return "—";
  
    const ax = Math.abs(x);
    // Decide decimals by scale
    let maxFrac: number;
    if (ax >= 1000)       maxFrac = 0;
    else if (ax >= 1)     maxFrac = 2;
    else if (ax >= 0.01)  maxFrac = 4;
    else if (ax >= 1e-4)  maxFrac = 6;
    else if (ax >= 1e-6)  maxFrac = 8;
    else                  maxFrac = 10; // very small, still readable
  
    // If it's *extremely* small, show scientific to avoid a screen full of zeros
    if (ax > 0 && ax < 1e-10) {
      return `$${x.toExponential(2)}`; // e.g., $1.23e-10
    }
  
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFrac,
      ...opts,
    }).format(x);
  }

const AssetPriceVisualizer = (props: AssetPriceVisualizerProps) => {

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [metadata, setMetadata] = useState<PredictionMetadata | null>(null);

  function parseToLocalTime(dateString :string) {
    const dateObject = new Date(dateString + "Z"); // Add "Z" to indicate UTC time
    const localDateObject = new Date(dateObject.getTime() );
    return localDateObject.toLocaleString();
  }

  function get_value_from_history( number : number ) {
    try { return number.toFixed(8)
    } catch (error) {
      console.error("Error parsing history:", error);
      return 0
    }
  }
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
useEffect(() => {
  setLoading(true); // ✅ Reset loading whenever coin changes
  setPrices([]);
  async function fetchPrices() {
    try {
      const res = await fetch(api + `?resource=predictions&coin=${props.coin.symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const text = await res.text();  // Get raw text
  
      // Try parsing after confirming it's valid
      const data = JSON.parse(text);  // This is where it usually fails
  
      setPrices(data.predictions.slice(0, pricesLength));
      setMetadata(data.metadata );
  
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }
  

  fetchPrices();
}, [props.coin]);

  useEffect(() => {
    setPrices([]);
    async function fetchPrices() {
      try {
        //const res = await fetchData();
         const response_ = await fetch( api + `?resource=predictions&coin=${props.coin.symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => response.json())
        
          .then((data) => { setPrices(data.predictions)  ; setMetadata(data.metadata) ; setLoading(false)  }) 

      } catch (error) {
        console.error('Error fetching data:', error);
      }
     
    }
    fetchPrices();
  }, [props]);



  const minPrice = Math.min(...prices.map(p => p.price)) * .99;
  // Adding a small buffer to the max price to ensure the line fits within the chart
  const maxPrice = Math.max(...prices.map(p => p.price)) * 1.01;
  // Adding a small buffer to the min price to ensure the line fits within the chart

  

  const options: EChartsOption = prices.length === 0
  ? {
      title: {
        text: "No data available",
        left: "center",
        top: "middle",
        textStyle: {
          color: "lightgray",
          fontSize: 16,
        },
      },
    }
  : { 
      textStyle: {
        color: "lightgray",
      },
      title: {
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#222',
        borderColor: '#555',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const [point] = params;
          const value = point.data;
        
          const formatPrice = (val: number | undefined): string => {
            if (val === undefined) return '-';
        
            if (val >= 1) {
              return val.toFixed(4).replace(/0+$/, ''); // e.g. 1.05233434 → 1.05
            } else if (val >= 0.01) {
              return val.toFixed(4).replace(/0+$/, ''); // e.g. 0.123456 → 0.1234
            } else {
              return val.toFixed(8).replace(/0+$/, ''); // trim trailing zeroes
            }
          };
        
          return `
            <strong>${point.seriesName}</strong><br/>
            ${point.axisValue}<br/>
            Price: $${formatPrice(value)}
          `;
        },
        
      },
      grid: {
        left: isMobile ? 50 : 60,
        right: 10,
        bottom: isMobile ? 50 : 40,
        top: 30,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: prices.map(({ date }) => parseToLocalTime(date)),
        axisLine: { lineStyle: { color: "#ccc"  } },
        axisLabel: {
          color: "#ccc",
          fontSize: isMobile ? 9 : 12,
          rotate: isMobile ? 45 : 0,
          formatter: (value: string, index: number) => {
            const parts = value.split(", ");
            return isMobile ? parts[1]?.replace(/:\d+$/, "") ?? value : value;
          },
        },
      },
      yAxis: {
        type: "value",
        min: minPrice,
        max: maxPrice,
        axisLine: { lineStyle: { color: "#ccc" } },
        axisLabel: {
          color: "#ccc",
          fontSize: isMobile ? 10 : 12,
          margin: 10,
          formatter: (value: number) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`; // e.g. 1200 → 1k
            } else if (value >= 1) {
              return value.toFixed(2).replace(/0+$/, '');               // e.g. 1.052 → 1.05
            } else if (value >= 0.01) {
              return value.toFixed(4).replace(/0+$/, '');               // e.g. 0.04567 → 0.0456
            } else {
              return value.toFixed(8).replace(/0+$/, ''); // e.g. 0.00056750 → 0.0005675
            }
          },
        },
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          start: 70,
          end: 100,
          bottom: 10,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 85,
          end: 100,
        },
      ],
      series: [
        {
          name: "Historical Price",
          data: prices.slice(0, -12).map(({ price }) => Number(price.toFixed(8))),
          type: "line" as const,
          smooth: true,
          lineStyle: { color: "white" },
          itemStyle: { color: "gray" },
        },
        ...(prices.length > 20
          ? [{
              name: "Predicted Price",
              data: prices.map((_, index) =>
                index < prices.length - 13
                  ? null
                  : Number(prices[index].price.toFixed(8))
              ),
              type: "line" as const,
              smooth: true,
              lineStyle: { color: "green" },
              itemStyle: { color: "green" },
            }]
          : []),
      ] as SeriesOption[],
    };


  return (

    <div className={styles.visualizerWrapper}>
    <div className={styles.visualizerHeader}>
    <h2 className={styles.headerTitle}>
        <img
          src={props.coin.coinpng}
          alt={`${props.coin.name} icon`}
          className={styles.headerIcon}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/icons/default.png";
          }}
        />
        {props.coin.name} 
      </h2>
      <div className={styles.legendBar}>
        <span className={styles.legendItem}>
          <span className={styles.dotLegend} style={{ backgroundColor: "gray" }}></span> Historical Price
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dotLegend} style={{ backgroundColor: "limegreen" }}></span> Predicted Price
        </span>
      </div>
      <p className={styles.metrics}>
        <abbr title="Mean Absolute Error — average absolute difference between predicted and actual price">
          MAE
        </abbr>{" "}
        per step (USD): {metadata?.mae !== undefined ? formatUsdAdaptive(metadata?.mae) : "N/A"}
      </p>
    </div>
   
  
    <div className={styles.visualizerChart}>
    {loading ? (
        <div className={styles.loaderWrapper}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      ) : (
        <ReactECharts
          option={options}
          style={{ width: '100%', height: '100%' }}
          notMerge={true}
        />
    )}
    </div>
  </div>
  

  );
};

export default AssetPriceVisualizer;
