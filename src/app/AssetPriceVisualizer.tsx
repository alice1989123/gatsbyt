"use client";
import styles from './AssetVisualizer.module.css';import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PriceData , Coin } from "@/types/types";
import type { EChartsOption, SeriesOption } from 'echarts';
import { PulseLoader } from "react-spinners";




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
  setLoading(true); // ✅ Reset loading whenever coin changes
  setPrices([]);
  async function fetchPrices() {
    try {
      const response_ = await fetch(api + `?resource=predictions&coin=${props.coin.symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response_.json();
      setPrices(data.predictions);
      setMetadata(data.metadata);
      setHistory(JSON.parse(data.metadata.history));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // ✅ Ensure it's set to false even on failure
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
        
          .then((data) => { setPrices(data.predictions)  ; setMetadata(data.metadata);  setHistory(JSON.parse( (data.metadata.history  ))) ; setLoading(false)  }) 

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
          return `
            <strong>${point.seriesName}</strong><br/>
            ${point.axisValue}<br/>
            Price: $${point.data?.toFixed(2)}
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
          formatter: (value: number) =>
            value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value.toFixed(2)}`,
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
          data: prices.slice(0, -12).map(({ price }) => Number(price.toFixed(4))),
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
                  : Number(prices[index].price.toFixed(4))
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
        {props.coin.name} - USDT
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
        MSE: {get_value_from_history(history.mean_absolute_error)} | Val MSE: {get_value_from_history(history.val_mean_absolute_error)} | Loss: {get_value_from_history(history.loss)}
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
