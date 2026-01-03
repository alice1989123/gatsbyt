// hooks/useSignalQuery.ts
"use client";

import { useEffect, useState } from "react";

export const useSignalQuery = (query: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = `/api/proxy?resource=predictions_results&query=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        // ✅ redirect on auth failure
        if (res.status === 401 || res.status === 403) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/api/auth/login?next=${next}`;
          return;
        }

        // keep your logging if you want
        console.log(res);

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
        }

        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!mounted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [query]);

  return { data, loading, error };
};
