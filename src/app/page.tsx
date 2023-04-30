"use client";
import "./styles.css";
import React from "react";
import AssetPriceVisualizer from "./AssetPriceVisualizer"; // Import AssetPriceVisualizer
import coins from "./coins";
import { useState } from "react";
import { Coin } from "@/types/types";





const App = () => {

  const [coin, setCoin] = useState<Coin>({ name: "Bitcoin", symbol: "btc" });
  const SidebarMenu = () => {
    return (
      <div
        className="sidebar"
        style={{
          height: "auto",
          minHeight: "100px",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {coins.map((coin_) => (
          <button style={{
            backgroundColor: coin.symbol === coin_.symbol ? "#000000" : "#1A237E",
            fontWeight: coin.symbol === coin_.symbol ? "bold" : "normal", width: "100px",

          }}
            onClick={() => setCoin( coin_)}>{coin_.name}</button>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <SidebarMenu /> 
      <div className="main">
        {<AssetPriceVisualizer coin={coin} />}    </div>
    </div>
  );
};

export default App;
