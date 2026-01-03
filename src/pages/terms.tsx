import Head from "next/head";
import Link from "next/link";
import styles from "./terms.module.css";

export default function TermsPage() {
  const updated = "January 2026";

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Terms of Service | Gatsbyt</title>
        <meta
          name="description"
          content="Terms of Service, Risk Disclosure, and Disclaimer for Gatsbyt."
        />
      </Head>


      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.meta}>Last updated: {updated}</p>

          <section className={styles.card}>
            <h2>1) Agreement</h2>
            <p>
              These Terms of Service (“Terms”) govern your use of Gatsbyt (“Gatsbyt”, “we”, “us”).
              By accessing or using the service, you agree to these Terms and our{" "}
              <Link className={styles.link} href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className={styles.card}>
            <h2>2) Important: Not financial advice</h2>
            <p>
              Gatsbyt provides information and analytics for educational and informational purposes
              only. Gatsbyt does <b>not</b> provide investment, legal, tax, or financial advice, and
              nothing on the service should be interpreted as a recommendation to buy, sell, or hold
              any asset.
            </p>
            <p>
              You are solely responsible for your decisions and for evaluating whether any strategy
              is suitable for you.
            </p>
          </section>

          <section className={styles.card}>
            <h2>3) Risk disclosure</h2>
            <ul>
              <li>
                <b>High risk:</b> Cryptocurrency markets are volatile. Loss of funds is possible,
                including the loss of your entire investment.
              </li>
              <li>
                <b>No guarantees:</b> Forecasts, signals, and performance metrics are probabilistic
                and may be wrong. Past performance does not guarantee future results.
              </li>
              <li>
                <b>Delays and outages:</b> Data sources can be delayed, incomplete, or incorrect.
                System downtime may occur.
              </li>
              <li>
                <b>Third-party platforms:</b> Trades executed on exchanges or brokers are governed
                by their terms. Gatsbyt is not responsible for their actions or availability.
              </li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>4) Forecasts and signals</h2>
            <p>
              Gatsbyt may display forecasts, indicators, alerts, and trading signals. These are
              generated using algorithms and data sources that can change over time. You understand
              that:
            </p>
            <ul>
              <li>Signals may be delayed, duplicated, or missing.</li>
              <li>Model performance can degrade in new market conditions.</li>
              <li>Any action you take based on Gatsbyt content is at your own risk.</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>5) Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use Gatsbyt for unlawful purposes.</li>
              <li>Attempt to bypass authentication or access restricted areas.</li>
              <li>Reverse engineer, scrape excessively, or disrupt service operation.</li>
              <li>Upload malware or abuse the platform.</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>6) Accounts and security</h2>
            <p>
              Access may require authentication. You are responsible for safeguarding your account
              and for any activity performed under it.
            </p>
          </section>

          <section className={styles.card}>
            <h2>7) Intellectual property</h2>
            <p>
              Gatsbyt and its content (including software, branding, UI, and documentation) are
              protected by intellectual property laws. You may not copy, distribute, or create
              derivative works except as permitted by law or with written permission.
            </p>
          </section>

          <section className={styles.card}>
            <h2>8) Disclaimers</h2>
            <p>
              Gatsbyt is provided on an “as is” and “as available” basis. We disclaim all warranties
              to the maximum extent permitted by law, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section className={styles.card}>
            <h2>9) Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Gatsbyt will not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits,
              revenue, data, or goodwill arising from your use of the service.
            </p>
          </section>

          <section className={styles.card}>
            <h2>10) Changes</h2>
            <p>
              We may update these Terms from time to time. If changes are material, we will make
              reasonable efforts to notify users by posting updated Terms and changing the “Last
              updated” date.
            </p>
          </section>

          <section className={styles.card}>
            <h2>11) Contact</h2>
            <p>
              Questions about these Terms? Email{" "}
              <a className={styles.link} href="mailto:support@gatsbyt.com">
                support@gatsbyt.com
              </a>
              .
            </p>
            <p className={styles.small}>
              Also see: <Link className={styles.link} href="/privacy">Privacy Policy</Link>
            </p>
          </section>
        </div>
      </main>

    </div>
  );
}
