import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface PriceData {
  date: string;
  price: number;
}

const AssetPriceVisualizer = () => {
  const generateDummyData = (): PriceData[] => {
    const data: PriceData[] = [];
    const startDate = new Date("2022-01-01");
    const endDate = new Date("2022-03-01");
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(
        startDate.getTime() + i * (1000 * 3600 * 24)
      );
      const dateString = currentDate.toISOString().slice(0, 10);
      const price = Math.floor(Math.random() * 1000) + 1;
      data.push({ date: dateString, price });
    }

    return data;
  };
  const [prices, setPrices] = useState<PriceData[]>([]);

  useEffect(() => {
    async function fetchPrices() {
      //const response = await fetch("/api/prices");
      const data = generateDummyData(); //   [] await response.json();
      setPrices(data);
    }
    fetchPrices();
  }, []);

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
    },
    series: [
      {
        data: prices.map(({ price }) => price),
        type: "line",
        smooth: true,
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={options} />
    </div>
  );
};

export default AssetPriceVisualizer;
