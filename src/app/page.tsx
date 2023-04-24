"use client";

import { createContext } from "react";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
import { type } from "os";
import { fetchData } from "../pages/api/crypto"; // Import the function to fetch data

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface PriceData {
  date: string;
  price: number;
}
const  api = process.env.API ? process.env.API : "http://localhost:3000/api/crypto";
const AssetPriceVisualizer = () => {

  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    async function fetchPrices() {
      try {
        //const res = await fetchData();
         const response_ = await fetch( api, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => response.json())
        
          .then((data) => {setPrices(data.predictions) , setLoading(false) })
          
      } catch (error) {
        console.error('Error fetching data:', error);
      }
     
    }
    fetchPrices();
  }, []);

           
  const minPrice = Math.min(...prices.map(({ price }) => price));
  const maxPrice = Math.max(...prices.map(({ price }) => price));

  

  const options: EChartsOption = {
    title: {
      text: "Asset Prices",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: prices.map(({ date }) => date),
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
          color: "green",
        },
        itemStyle: {
          color: "green",
        },
      },
      prices.length > 20 &&{
        data: Array(prices.length - 20)
        .fill(null)
        .concat(prices.slice(-20).map(({ price }) => price)),
        type: "line",
        smooth: true,
        lineStyle: {
          color: "red",
        },
        itemStyle: {
          color: "red",
        },
      },
    ]
    
    
  };
  

  return (
    loading ? <div>Loading...</div> :
    <div>
      <ReactECharts option={options} />
    </div>
  );
};

export default AssetPriceVisualizer;
