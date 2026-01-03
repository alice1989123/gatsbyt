"use client";

import React from "react";
import "./Footer.css";
import Link from "next/link";

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

            {/* ✅ add this */}
            <div className="footer-support">
              Support:{" "}
              <a className="footer-support-link" href="mailto:support@gatsbyt.com">
                support@gatsbyt.com
              </a>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <Link className="footer-link" href="/methodology">Methodology</Link>
            <Link className="footer-link" href="/data-sources">Data sources</Link>
            <Link className="footer-link" href="/terms">Terms</Link>
            <Link className="footer-link" href="/privacy">Privacy</Link>
            <Link className="footer-link" href="/contact">Contact</Link>
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
