"use client";
import styles from './AssetVisualizer.module.css';import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
import { PriceData , Coin } from "@/types/types";






const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


//const  api = process.env.API ? process.env.API : "http://localhost:3000/api/crypto";
const api = "/api/proxy";

interface AssetPriceVisualizerProps {
  coin: Coin;
}

interface History{
  val_loss: number[]
  val_mean_absolute_error: number[]
  mean_absolute_error: number[]
  loss: number[]  }


const dummy_history = {
  val_loss: [],
  val_mean_absolute_error: [],
  mean_absolute_error: [],
  loss: [],
}

const AssetPriceVisualizer = (props: AssetPriceVisualizerProps) => {

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [metadata , setMetadata] = useState<Object[]>([]);
  const [history , setHistory] = useState<History>(dummy_history);

  function parseToLocalTime(dateString :string) {
    const dateObject = new Date(dateString + "Z"); // Add "Z" to indicate UTC time
    const localDateObject = new Date(dateObject.getTime() );
    return localDateObject.toLocaleString();
  }

  function get_value_from_history( list :number[]) {
    try { return list[list.length - 1].toFixed(4
    )
    } catch (error) {
      return 0
    }
  }
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);

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
        
          .then((data) => { setPrices(data.predictions)  ; setMetadata(data.metadata);  setHistory(JSON.parse( (data.metadata.history  ))) ; setLoading(false)  }) 

      } catch (error) {
        console.error('Error fetching data:', error);
      }
     
    }
    fetchPrices();
  }, [props]);



  const minPrice = Math.min(...prices.map(({ price }) => Number(price.toFixed(4))));
  const maxPrice = Math.max(...prices.map(({ price }) => Number(price.toFixed(4))));

  

  const options: EChartsOption = {
    textStyle: {
      color: "lightgray", 
    },

    title: {
      show: false
    },

    xAxis: {
      type: "category",
      data: prices.length > 0 ? prices.map(({ date }) => parseToLocalTime(date)) : [],
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#ccc" }
    },
    yAxis: {
      type: "value",
      min: prices.length > 0 ? minPrice : 0,
      max: prices.length > 0 ? maxPrice : 100,
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#ccc" }
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 70,   // Adjust as needed
        end: 100,
        bottom: 10
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 70,
        end: 100
      }
    ],
    series: [
      {         name: "Historical Price",
        data: prices.slice(0, -12).map(({ price }) => Number(price.toFixed(4))),
        type: "line",
        smooth: true,
        lineStyle: {
          color: "gray",
        },
        itemStyle: {
          color: "gray",
        },
      },
      prices.length > 20
        ? { name: "Predicted Price",
            data: Array(prices.length - 12)
              .fill(null)
              .concat(prices.slice(-13).map(({ price }) => Number(price.toFixed(4)) )),
            type: "line",
            smooth: true,
            lineStyle: {
              color: "green",
            },
            itemStyle: {
              color: "green",
            },
          }
        : {},
    ],
    
  };
  

  return (

    <div className={styles.visualizerWrapper}>
    <div className={styles.visualizerHeader}>
      <h2>{props.coin.name} - USDT</h2>
      <div className={styles.legendBar}>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: "gray" }}></span> Historical Price
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: "limegreen" }}></span> Predicted Price
        </span>
      </div>
      <p className={styles.metrics}>
        MSE: {get_value_from_history(history.mean_absolute_error)} | Val MSE: {get_value_from_history(history.val_mean_absolute_error)} | Loss: {get_value_from_history(history.loss)}
      </p>
    </div>
  
    <div className={styles.visualizerChart}>
      {loading ? (
        <div style={{ color: 'white' }}>Loading chart...</div>
      ) : (
        <ReactECharts
          option={options}
          style={{ width: '100%', height: '100%' }} // now fills .visualizerChart's size
          notMerge={true}
        />
      )}
    </div>
  </div>
  

  );
};

export default AssetPriceVisualizer;
