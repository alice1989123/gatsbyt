"use client";
import "./styles.css";
import React, { useState, useEffect } from "react";
import AssetPriceVisualizer from "./AssetPriceVisualizer"; 
import coins from "./coins";
import { Coin } from "@/types/types";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import './globals.css';
import CustomSelect from "../components/CustomSelect";
import { FaTelegramPlane } from "react-icons/fa";

const App = () => {
  const [coin, setCoin] = useState<Coin>(coins[0]);

  const SidebarMenu = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      setHydrated(true);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!hydrated) return null;

    if (isMobile) {
      return (
        <div style={{ padding: '1rem', width: '100%' }}>
          <CustomSelect
            withIcons={true}
            options={coins.map((coin) => ({
              label: coin.name,
              value: coin.symbol,
              icon: coin.coinpng,
            }))}
            value={{
              label: coin.name,
              value: coin.symbol,
              icon: coin.coinpng,
            }}
            onChange={(option) => {
              const selected = coins.find((c) => c.symbol === option.value);
              if (selected) setCoin(selected);
            }}
          />
        </div>
      );
    }

    return (
      <div className="sidebar">
        {coins.map((coin_) => (
          <button
            key={coin_.symbol}
            onClick={() => setCoin(coin_)}
            className={coin.symbol === coin_.symbol ? "selected" : ""}
          >
            <div className="sidebar-item">
              <img
                src={coin_.coinpng}
                alt={`${coin_.name} icon`}
                className="icon"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/icons/default.png";
                  e.currentTarget.style.objectFit = "contain";
                }}
              />
              <span>{coin_.name}</span>
            </div>
          </button>
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

          {/* Mobile-only Telegram CTA above chart */}
          <div className="telegram-join-desktop-only">
            <p className="telegram-text">
              📡 Join our Telegram Group to get real-time trading signals and model alerts.
            </p>
            <a
              href="https://t.me/crypto_gatsbyt"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button"
            >
              <FaTelegramPlane style={{ marginRight: "8px" }} />
              Join our Telegram Group
            </a>
          </div>

          <div className="visualizer-container">
            <AssetPriceVisualizer coin={coin} />
          </div>

          <div className="explanation-container">
            <h4>How the Calculations are Built </h4>
            <p>
              The calculations are based on a deep learning model that is trained on the closing price from June 2018 to the present date for each coin, provided that data is available. Since many of the coins are relatively new.
            </p>
            <p>
              Since the price depends on many other factors, such as political or sentiment analysis, the predicted price may differ from the actual ones. Therefore, these predictions should not be used for investment purposes.
            </p>
          </div>
        </div>
      </div>
      <a
        href="https://t.me/crypto_gatsbyt"
        className="telegram-floating"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Telegram Group"
      >
        <FaTelegramPlane />
      </a>
      <Footer />
    </div>
  );
};

export default App;
