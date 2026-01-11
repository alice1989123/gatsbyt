// src/pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

function getApiHost(raw?: string) {
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function parseJwtNoVerify(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // JWT payload is base64url (not base64)
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clearAuthCookies(req: NextApiRequest, res: NextApiResponse) {
  const proto = req.headers["x-forwarded-proto"];
  const isHttps = proto === "https";

  const base = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");

  // NOTE: If in prod you set a Domain=... cookie, you must also clear that variant too.
  res.setHeader("Set-Cookie", [
    `id_token=; ${base}`,
    `access_token=; ${base}`,
    `refresh_token=; ${base}`,
  ]);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("[proxy] HIT", { url: req.url, method: req.method });

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const idToken = req.cookies?.id_token;
  const accessToken = req.cookies?.access_token;

  if (!idToken && !accessToken) {
    // Optional but recommended: if you got here unauthenticated, ensure cookies are clean
    clearAuthCookies(req, res);
    res.setHeader("Cache-Control", "no-store");
    return res.status(401).json({ error: "Not authenticated (no token cookies)" });
  }

  // Prefer id_token for API Gateway JWT authorizer (aud claim)
  const chosen = idToken || accessToken!;
  const claims = parseJwtNoVerify(chosen);

  console.log("[proxy] token claims", {
    token_use: claims?.token_use,
    aud: claims?.aud,
    client_id: claims?.client_id,
    iss: claims?.iss,
  });

  const rawApi =
    process.env.NEXT_CRYPTO_API ??
    "https://kz89j9juql.execute-api.mx-central-1.amazonaws.com";

  const apiHost = getApiHost(rawApi);
  if (!apiHost) return res.status(500).json({ error: "Missing NEXT_CRYPTO_API" });

  const env = process.env.NEXT_PUBLIC_ENV || "dev";

  const { resource, metric_name, coin, query , model_name , interval} = req.query;

  let path: string;

  if (resource === "news") {
    path = `/${env}/news`;
  } else if (resource === "on_chain_metrics") {
    if (!metric_name || typeof metric_name !== "string") {
      return res.status(400).json({ error: "Bad metric_name" });
    }
    path = `/${env}/on_chain_metrics?metric=${encodeURIComponent(metric_name)}`;
  } else if (resource === "predictions") {
    if (!coin || typeof coin !== "string") {
      return res.status(400).json({ error: "Bad coin" });
    }
    path = `/${env}/predictions?coin=${encodeURIComponent(coin)}&model_name=${encodeURIComponent(model_name as string)}&interval=${encodeURIComponent(interval as string)}`;
    console.log("path", path);
  } else if (resource === "predictions_results") {
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Bad query" });
    }
    path = `/${env}/predictions_results?query=${encodeURIComponent(query)}`;
  } else {
    return res.status(400).json({ error: "Bad resource" });
  }

  const url = `https://${apiHost}${path}`;
  console.log("[proxy] -> upstream", url);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${chosen}`,
        Accept: "application/json",
      },
    });
  } catch (err: any) {
    console.error("[proxy] upstream fetch failed", err?.message || err);
    return res.status(502).json({ error: "Upstream fetch failed" });
  }

  const contentType = upstream.headers.get("content-type") || "text/plain";
  const text = await upstream.text();

  // If upstream says unauthorized, clear cookies so the browser stops sending stale tokens
  if (upstream.status === 401 || upstream.status === 403) {
    console.warn("[proxy] upstream unauthorized", { status: upstream.status });
    clearAuthCookies(req, res);
    res.setHeader("Cache-Control", "no-store");
    return res.status(upstream.status).json({ error: "Not authenticated (upstream)" });
  }

  console.log("[proxy] <- upstream", { status: upstream.status, body: text.slice(0, 300) });

  res.status(upstream.status);
  res.setHeader("content-type", contentType);
  res.setHeader("Cache-Control", "no-store"); // good for APIs
  return res.send(text);
}
