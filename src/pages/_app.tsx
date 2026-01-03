// src/pages/_app.tsx
import type { AppProps } from "next/app";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
