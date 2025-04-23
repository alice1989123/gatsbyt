"use client";
import "./styles.css";
import React from "react";
import AssetPriceVisualizer from "./AssetPriceVisualizer"; 
import coins from "./coins";
import { useState } from "react";
import { Coin } from "@/types/types";
import Header from "./components/Header"; 
import Footer from "./components/Footer"; 
import './globals.css';

const App = () => {

  const [coin, setCoin] = useState<Coin>(coins[0]);
  const SidebarMenu = () => {
    return (
      <div
        className="sidebar"
        style={{
          height: "auto",
          minHeight: "100px",
/*           maxHeight: "100vh",
 */          overflowY: "auto",
        }}
      >
        {coins.map((coin_) => (
          <button style={{
            backgroundColor: coin.symbol === coin_.symbol ? "#000000" : "#1A237E",
            fontWeight: coin.symbol === coin_.symbol ? "bold" : "normal", width: "100px",

          }}
            onClick={() => setCoin( coin_)} key={coin_.symbol} >{coin_.name}</button>
        ))}
      </div>
    );
  };

  return (
    <div className="layout-wrapper">
      <Header />
      <h1 className="section-title"> AI-Powered Price Predictions </h1>
      <div className="container">
        <SidebarMenu />
        <div className="main">
          <div className="visualizer-container">
            {<AssetPriceVisualizer coin={coin} />}
          </div>
          <div className="explanation-container">
            <h4>How the Calculations are Built </h4>
            <p>
            The calculations are based on a deep learning model that is trained on the closing price from June 2018 to the present date for each coin, provided that data is available. Since many of the coins are relatively new.  </p>
          <p>
          Since the price depends on many other factors, such as political or sentiment analysis, the predicted price may differ from the actual ones. Therefore, these predictions should not be used for investment purposes.
          </p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
