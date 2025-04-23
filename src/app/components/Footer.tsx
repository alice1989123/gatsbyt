"use client"
import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
     
      <div className="footer-disclaimer">
        Disclaimer: The information and predictions provided on this platform are for informational purposes only and should not be construed as financial advice.
      </div>
      <div className="footer-content">
        <div className="footer-legend">Gatsbyt: Powering Decentralization with AI</div>
        <div>© {new Date().getFullYear()} Gatsbyt. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;