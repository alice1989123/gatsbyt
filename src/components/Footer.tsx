"use client";

import React from "react";
import styles from "./Footer.module.css";
import Link from "next/link";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerBrandName}>gatsbyt</div>
            <div className={styles.footerBrandSub}>
              Crypto forecasts, signals, and on-chain analytics.
            </div>

            <div className={styles.footerSupport}>
              Support:{" "}
              <a className={styles.footerSupportLink} href="mailto:support@gatsbyt.com">
                support@gatsbyt.com
              </a>
            </div>
          </div>

          <nav className={styles.footerLinks} aria-label="Footer">
            <Link className={styles.footerLink} href="/methodology">Methodology</Link>
            <Link className={styles.footerLink} href="/data-sources">Data sources</Link>
            <Link className={styles.footerLink} href="/terms">Terms</Link>
            <Link className={styles.footerLink} href="/privacy">Privacy</Link>
            <Link className={styles.footerLink} href="/contact">Contact</Link>
          </nav>
        </div>

        <div className={styles.footerDisclaimer}>
          Data and forecasts are provided for informational purposes only and do not
          constitute financial advice. Past performance is not indicative of future results.
        </div>

        <div className={styles.footerBottom}>
          <span>© {year} Gatsbyt. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
