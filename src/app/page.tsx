import "./styles.css";
import React from "react";
import AssetPriceVisualizer from "./AssetPriceVisualizer"; // Import AssetPriceVisualizer
import coins from "./coins";
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
       {coins.map((coin) => (
        <button key={coin.symbol}>{coin.name}</button>
      ))}
    </div>
  );
};



const App = () => {
  return (
    <div className="container">
      <SidebarMenu />
      <div className="main">
        <AssetPriceVisualizer />
      </div>
    </div>
  );
};

export default App;
