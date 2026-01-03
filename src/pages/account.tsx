"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "./account.module.css";

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

  // Google-only Hosted UI login
  function loginWithGoogle() {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const redirectUri =
      process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? `${window.location.origin}/`;

    const scope = "openid email profile";

    // identity_provider=Google forces Google IdP (no Cognito username/password)
    const url =
      `${domain}/oauth2/authorize` +
      `?identity_provider=Google` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = url;
  }

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

  const isAuthed = !!session?.authenticated;

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Account | Gatsbyt</title>
      </Head>


      <main className={styles.page}>
        <h1 className={styles.title}>Account</h1>
        <p className={styles.subtitle}>
          {isAuthed ? "Your profile details." : "Sign in with Google to continue."}
        </p>

        <div className={styles.container}>
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorTitle}>Couldn’t load session</div>
              <div className={styles.errorText}>{error}</div>
            </div>
          ) : isAuthed ? (
            <>
              <div className={styles.grid}>
                <Field label="Name" value={session?.user?.name} />
                <Field label="Email" value={session?.user?.email} />
              </div>

              <div className={styles.actions}>
                <button className={styles.dangerBtn} onClick={logout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.grid}>
                <Field label="Status" value="Not signed in" />
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={loginWithGoogle}>
                  Sign in with Google
                </button>
              </div>
            </>
          )}
        </div>
      </main>

    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value || "—"}</div>
    </div>
  );
}
