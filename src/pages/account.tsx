"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./account.module.css"; // ✅ create this file
import "../app/globals.css"; // if you already do this elsewhere

type SessionResponse = {
  authenticated: boolean;
  user?: {
    email?: string;
    name?: string;
    sub?: string;
    username?: string;
  };
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const logoutUri = encodeURIComponent(window.location.origin + "/");

    window.location.href =
      `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${logoutUri}`;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`session ${res.status}: ${text}`);
        }

        const data = (await res.json()) as SessionResponse;
        setSession(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load session");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Account | Gatsbyt</title>
      </Head>

      <Header />

      <main className={styles.page}>
        <h1 className={styles.title}>Account</h1>
        <p className={styles.subtitle}>Your session and profile details.</p>

        <div className={styles.container}>
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorTitle}>Couldn’t load session</div>
              <div className={styles.errorText}>{error}</div>
            </div>
          ) : session?.authenticated ? (
            <>
              <div className={styles.grid}>
                <Field label="Name" value={session.user?.name} />
                <Field label="Email" value={session.user?.email} />
                <Field label="Username" value={session.user?.username} />
                <Field label="Sub" value={session.user?.sub} mono />
              </div>

              <div className={styles.actions}>
                <button className={styles.dangerBtn} onClick={logout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <p>
              You’re not authenticated. Try opening a protected page to trigger Hosted UI login.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${mono ? styles.mono : ""}`}>
        {value || "—"}
      </div>
    </div>
  );
}
