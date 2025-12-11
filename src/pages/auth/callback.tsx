// src/pages/auth/callback.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hasta que router.query esté listo
    if (!router.isReady) return;

    const code = router.query.code;
    const codeStr =
      typeof code === "string" ? code : Array.isArray(code) ? code[0] : null;

    console.log("[callback] query:", router.query);

    if (!codeStr) {
      setError("Missing ?code in URL");
      return;
    }

    (async () => {
      try {
        console.log("[callback] calling /api/auth/exchange-code with", codeStr);
        const res = await fetch(
          `/api/auth/exchange-code?code=${encodeURIComponent(codeStr)}`,
          { method: "GET", credentials: "include" },
        );

        console.log("[callback] response:", res.status, res.statusText);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.log("[callback] body error:", data);
          setError(data.error || "Token exchange failed");
          return;
        }

        // cookies ya están → mandamos al home o dashboard
        router.replace("/");
      } catch (e) {
        console.error("[callback] unexpected error:", e);
        setError("Unexpected error while finishing sign-in");
      }
    })();
  }, [router]);

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Auth error</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Signing you in…</h1>
      <p>You will be redirected in a moment.</p>
    </main>
  );
}
