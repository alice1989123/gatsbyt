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

  {/* Page header (professional) */}
  <div className="page-hero">
    <div className="page-hero-inner">
      <div className="page-title-row">
        <h1 className="page-title">Price Forecasts</h1>
        <span className="page-pill">Beta</span>
      </div>

      <p className="page-subtitle">
        Interactive forecasts powered by our time-series models. Select an asset to view the projected path and confidence.
      </p>

      {/* Product CTA row */}
      <div className="page-actions">
        <a
          href="https://t.me/crypto_gatsbyt"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-primary"
        >
          <FaTelegramPlane style={{ marginRight: 8 }} />
          Get alerts on Telegram
        </a>

        <span className="cta-note">
          Signals are informational only. Not financial advice.
        </span>
      </div>
    </div>
  </div>

  <div className="container">
    <SidebarMenu />

    <div className="main">
      <div className="visualizer-container">
        <AssetPriceVisualizer coin={coin} />
      </div>

      {/* Professional “About” card */}
      <div className="explanation-container">
        <h4>About this forecast</h4>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">Training window</div>
            <div className="info-value">June 2018 → Present (if available)</div>
          </div>

          <div className="info-card">
            <div className="info-label">Inputs</div>
            <div className="info-value">Closing price (and internal features)</div>
          </div>

          <div className="info-card">
            <div className="info-label">Use</div>
            <div className="info-value">Research & monitoring</div>
          </div>
        </div>

        <p className="fineprint">
          Forecasts are probabilistic estimates and may differ materially from real market prices due to volatility,
          news, and liquidity conditions. This tool does not provide investment advice.
        </p>
      </div>
    </div>
  </div>

  <a
    href="https://t.me/crypto_gatsbyt"
    className="telegram-floating"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Get alerts on Telegram"
  >
    <FaTelegramPlane />
  </a>

  <Footer />
</div>

  );
};

export default App;
