"use client";
import "./styles.css";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";

import { PriceData , Coin } from "@/types/types";





const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


const  api = process.env.API ? process.env.API : "http://localhost:3000/api/crypto";

interface AssetPriceVisualizerProps {
  coin: Coin;
}

const AssetPriceVisualizer = (props: AssetPriceVisualizerProps) => {

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [metadata , setMetadata] = useState<Object[]>([]);

  useEffect(() => {
    setPrices([]);
    async function fetchPrices() {
      try {
        //const res = await fetchData();
         const response_ = await fetch( api + `?collection_name=${props.coin.symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => response.json())
        
          .then((data) => { setPrices(data.predictions)  , setMetadata(data.metadata), setLoading(false) })
          
      } catch (error) {
        console.error('Error fetching data:', error);
      }
     
    }
    fetchPrices();
  }, [props]);



  const minPrice = Math.min(...prices.map(({ price }) => price));
  const maxPrice = Math.max(...prices.map(({ price }) => price));

  

  const options: EChartsOption = {

    legend: {
      borderRadius: 5, // Rounded corners
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      backgroundColor: '#f9f9f9',
      data: ['Historical Data', 'Predicted Data'],
    },
    title: {
      text: `${props.coin.name} Price - Prediction`,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: prices.map(({ date }) => new Date(date).toLocaleString()),
    },
    yAxis: {
      type: "value",
      min: minPrice,
      max: maxPrice,
    },
    series: [
      {
        data: prices.slice(0, -20).map(({ price }) => price),
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
        ? {
            data: Array(prices.length - 20)
              .fill(null)
              .concat(prices.slice(-20).map(({ price }) => price)),
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
    <><div style={{ width: "90%", height: "1000px" }}>
       <ReactECharts
        option={loading ? {} : options}
        notMerge={true}
        /> 
    </div></>
  );
};

export default AssetPriceVisualizer;
