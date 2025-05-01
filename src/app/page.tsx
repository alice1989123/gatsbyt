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
import Select from 'react-select';
import { GroupBase, StylesConfig, ThemeConfig } from 'react-select';

const customStyles: StylesConfig<any, false, GroupBase<any>> = {
  control: (base) => ({
    ...base,
    backgroundColor: '#1a237e',
    borderColor: '#3949ab',
    color: 'white',
    borderRadius: '8px',
    padding: '2px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a237e',
    borderRadius: '8px',
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? '#5c6bc0' : '#1a237e',
    color: 'white',
    cursor: 'pointer',
  }),
  input: (base) => ({
    ...base,
    color: 'white', // ← ensures typed letters are visible
  }),
};

const customTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: '#5c6bc0',
    primary: '#3949ab',
  },
});
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
    const handleChange = (selectedOption: any) => {
      const selected = coins.find(c => c.symbol === selectedOption.value);
      if (selected) setCoin(selected);
    };
  
    
  if (isMobile) {
    return (
      <div style={{ padding: '1rem', width: '100%' }}>
        <Select
        options={options}
        value={{ value: coin.symbol, label: coin.name }}
        onChange={handleChange}
        styles={customStyles}
        theme={customTheme}
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
            style={{
              backgroundColor: coin.symbol === coin_.symbol ? "#000000" : "#1A237E",
              fontWeight: coin.symbol === coin_.symbol ? "bold" : "normal",
              width: "100px",
            }}
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
