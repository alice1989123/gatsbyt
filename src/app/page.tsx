import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.badge}>AI Crypto Intelligence</div>

            <h1 className={styles.title}>
              Forecasts, Signals, Performance, On-Chain Metrics, and News — in one place.
            </h1>

            <p className={styles.subtitle}>
              Gatsbyt helps you track crypto markets with AI-driven summaries, predictive models,
              and performance analytics. Built for clarity, speed, and daily decision-making.
            </p>

            <div className={styles.ctaRow}>
              {/* ✅ middleware will redirect to Hosted UI login */}
              <Link href="/signals" className={styles.primaryCta}>
                Get started
              </Link>

              {/* ✅ also protected, but still a nice CTA */}
              <Link href="/predictions" className={styles.secondaryCta}>
                View forecasts
              </Link>
            </div>

            <div className={styles.smallNote}>
              Login required (Google via Cognito Hosted UI). Gatsbyt never stores your password.
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What you can do</h2>
          <p className={styles.sectionSub}>
            Everything is organized into focused dashboards so you can move fast.
          </p>

          <div className={styles.grid}>
            <Feature
              title="Forecast"
              desc="Visualize model forecasts per coin and compare against recent price history."
              href="/predictions"
              tag="Login required"
            />
            <Feature
              title="Signals"
              desc="Trade signal feed with clear status and quick navigation to details."
              href="/signals"
              tag="Login required"
            />
            <Feature
              title="Performance"
              desc="Track strategy performance and summary analytics over time."
              href="/performance"
              tag="Login required"
            />
            <Feature
              title="On-Chain"
              desc="Explore on-chain indicators and how they evolve across market cycles."
              href="/onchain"
              tag="Login required"
            />
            <Feature
              title="News Digest"
              desc="Curated headlines summarized with AI, with sentiment to spot the mood."
              href="/news"
              tag="Login required"
            />
          </div>
        </section>

        {/* How it works */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How it works</h2>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <div>
                <div className={styles.stepTitle}>Sign in</div>
                <div className={styles.stepText}>
                  Use Cognito Hosted UI with Google login (PKCE).
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <div>
                <div className={styles.stepTitle}>Browse dashboards</div>
                <div className={styles.stepText}>
                  Forecasts, signals, performance, on-chain, and AI news — consistent UI.
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <div>
                <div className={styles.stepTitle}>Act with context</div>
                <div className={styles.stepText}>
                  Use forecasts + sentiment + performance to reduce “guessing”.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Trust */}
        <section className={styles.section}>
          <div className={styles.trustCard}>
            <h2 className={styles.sectionTitle}>Security-first</h2>
            <ul className={styles.trustList}>
              <li>Secure Google login.</li>
              <li>No password storage.</li>
              <li>Access to dashboards is private to your account.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Feature({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.tagProtected}>{tag}</div>
      </div>
      <div className={styles.cardDesc}>{desc}</div>
      <div className={styles.cardHint}>Open →</div>
    </Link>
  );
}
