// src/pages/_app.tsx
import type { AppProps } from "next/app";


import "../styles/styles.css";   // adjust path if needed
import "../styles/globals.css";    // adjust path if needed


export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}