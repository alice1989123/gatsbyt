"use client";

import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-name">gatsbyt</div>
            <div className="footer-brand-sub">
              Crypto forecasts, signals, and on-chain analytics.
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer">
            {/* Replace hrefs with your real routes when ready */}
            <a className="footer-link" href="/methodology">Methodology</a>
            <a className="footer-link" href="/data-sources">Data sources</a>
            <a className="footer-link" href="/terms">Terms</a>
            <a className="footer-link" href="/privacy">Privacy</a>
            <a className="footer-link" href="/contact">Contact</a>
          </nav>
        </div>

        <div className="footer-disclaimer">
          Data and forecasts are provided for informational purposes only and do not
          constitute financial advice. Past performance is not indicative of future results.
        </div>

        <div className="footer-bottom">
          <span>© {year} Gatsbyt. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
