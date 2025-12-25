// src/pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const code = router.query.code;
    const codeStr =
      typeof code === "string" ? code : Array.isArray(code) ? code[0] : null;

    const state = router.query.state;
    const next =
      typeof state === "string" ? state : Array.isArray(state) ? state[0] : "/";

    if (!codeStr) {
      setError("Missing ?code in URL");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/auth/exchange-code?code=${encodeURIComponent(codeStr)}`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Token exchange failed");
          return;
        }

        router.replace(next);
      } catch (e) {
        setError("Unexpected error while finishing sign-in");
      }
    })();
  }, [router.isReady]);

  if (error) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 520 }}>
          <h1>Auth error</h1>
          <p>{error}</p>
          <Link href="/login" className="btn btn-primary">
          Go to login
        </Link>
        </div>
      </main>
    );
  }

  return (
  <div className="layout-wrapper">
    <Header />
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
      {/* spinner / message */}
    </main>
    <Footer />
  </div>
);
}
