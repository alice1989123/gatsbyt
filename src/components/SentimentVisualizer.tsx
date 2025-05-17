
import styles from "./visualizer.module.css";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
import { PriceData , Coin } from "@/types/types";





const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


const  api = process.env.API ? process.env.API : "http://localhost:3000/api/crypto";

interface AssetPriceVisualizerProps {
  coin: "string";
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

const dummyPrices = [
  { date: "2023-01-01", price: 100 },
  { date: "2023-02-01", price: 110 },
  { date: "2023-03-01", price: 105 },
  // add more items as needed
];

const dummyMetadata = { /* dummy metadata data */ };

const dummyHistory = {
  val_loss: [0.1, 0.2, 0.15],
  val_mean_absolute_error: [0.05, 0.07, 0.06],
  mean_absolute_error: [0.04, 0.06, 0.05],
  loss: [0.1, 0.2, 0.15],
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


  

  useEffect(() => {
    setPrices([]);
    async function fetchPrices() {
      try {
        setPrices(dummyPrices);
        setHistory(dummyHistory);
        setLoading(false);
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

      right: 70, // Move legend to the right
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
      top: 10,
      text: `${"sentiment"} Price Prediction`,
      textStyle: {
        color: "lightgray", 
        
      },
      subtext: `Mean Squared Error: ${ get_value_from_history( history.mean_absolute_error) }  Val Mean Squared Error: ${ get_value_from_history( history.val_mean_absolute_error) }  Loss: ${ get_value_from_history( history.loss) }  Val Loss: ${ get_value_from_history( history.val_loss) } ` ,
      

    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: prices.map(({ date }) =>  parseToLocalTime(date) ),
    },
    yAxis: {
      type: "value",
      min: minPrice,
      max: maxPrice,
    },
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
