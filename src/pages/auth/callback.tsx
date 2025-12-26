"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function AuthCallback() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (ran.current) return;         // ✅ prevent double call in dev
    ran.current = true;

    const code = router.query.code;
    if (!code || typeof code !== "string") {
      router.replace("/?auth=missing_code");
      return;
    }

    (async () => {
      const res = await fetch(`/api/auth/exchange-code?code=${encodeURIComponent(code)}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("exchange failed", data);
        router.replace(`/?auth=exchange_failed`);
        return;
      }

      // ✅ redirect to where user wanted to go (cookie you already set: post_login_redirect)
      // If your server redirects after exchange, you can just router.replace("/")
      router.replace("/account");
    })();
  }, [router.isReady, router.query.code, router]);

  return null;
}
