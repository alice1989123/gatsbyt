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
import { useEffect } from "react";
import CustomSelect from "./components/CustomSelect";


const App = () => {

  const [coin, setCoin] = useState<Coin>(coins[0]);
  const SidebarMenu = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [hydrated, setHydrated] = useState(false); // ← new
    
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      setHydrated(true); // ← set only after first render
  
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    if (!hydrated) return null;
    const options = coins.map((coin_) => ({
      value: coin_.symbol,
      label: coin_.name
    }));
    
  
    
  if (isMobile) {
    return (
      <div style={{ padding: '1rem', width: '100%' }}>
       <CustomSelect
  options={coins.map((coin) => ({ label: coin.name, value: coin.symbol }))}
  value={{ label: coin.name, value: coin.symbol }}
  onChange={(option) => {
    const selected = coins.find(c => c.symbol === option.value);
    if (selected) setCoin(selected);
  }}
/>
      </div>
    );
  }

    // Desktop: keep buttons
    return (
      <div className="sidebar">
        {coins.map((coin_) => (
        <button
        key={coin_.symbol}
        onClick={() => setCoin(coin_)}
        className={coin.symbol === coin_.symbol ? "selected" : ""}
      >
        {coin_.name}
      </button>
        ))}
      </div>
    );
  
  }

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
