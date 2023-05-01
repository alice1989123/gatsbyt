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

  interface Metadata { 
    history: History
  }
  interface History{
    val_loss: number[]
    val_mean_absolute_error: number[]
  }


  function get_metrics (metadata: Metadata) {

    const loss = metadata.history.val_loss [ metadata.history.val_loss.length -1]
    const mae = metadata.history.val_mean_absolute_error [ metadata.history.val_mean_absolute_error.length -1]
  }
  

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
        
          .then((data) => { setPrices(data.predictions)  , setMetadata(data.metadata), setLoading(false)  ; console.log (data.metadata.history.loss) ;/* console.log( get_metrics(data.metadata.history) )*/})

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


    legend: {
      right: 10, // Move legend to the right
      borderRadius: 5, // Rounded corners
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      backgroundColor: "#13195c", // Set background color to dark blue
      data: ['Historical Price', 'Predicted Price'],
      textStyle: {
        color: "white", // Set title text color to white
      },
  
    },
    title: {
      text: `${props.coin.name} Price - Prediction`,
      textStyle: {
        color: "lightgray", 
        
      },
      subtext: `Mean Squared Error: ${1.0.toFixed(4)} ( the lower the better)` ,
      

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
      {         name: "Historical Price",
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
        ? { name: "Predicted Price",
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
    <><div style={{ width: "90%", height: "600px" , marginTop:"1rem" }}>
       <ReactECharts style={{ height: "100%" }}
        option={loading ? {} : options}
        notMerge={true}
        /> 
    </div>
    </>
  );
};

export default AssetPriceVisualizer;
