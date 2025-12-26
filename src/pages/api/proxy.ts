// src/pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

function getApiHost(raw?: string) {
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function parseJwtNoVerify(token: string) {
  try {
    const payloadB64 = token.split(".")[1];
    const json = Buffer.from(payloadB64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("[proxy] HIT", { url: req.url, method: req.method });

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // ✅ use id_token for API GW JWT authorizer (has aud)
  const idToken = req.cookies?.id_token;
  const accessToken = req.cookies?.access_token;

  if (!idToken && !accessToken) {
    return res.status(401).json({ error: "Not authenticated (no token cookies)" });
  }

  const chosen = idToken || accessToken!;
  const claims = parseJwtNoVerify(chosen);
  console.log("[proxy] token claims", {
    token_use: claims?.token_use,
    aud: claims?.aud,
    client_id: claims?.client_id,
    iss: claims?.iss,
  });

  const apiHost = getApiHost(process.env.NEXT_CRYPTO_API);
  if (!apiHost) return res.status(500).json({ error: "Missing NEXT_CRYPTO_API" });

  const env = process.env.NEXT_PUBLIC_ENV || "dev"; // or prod
  if (!apiHost) return res.status(500).json({ error: "Missing NEXT_NEXT_CRYPTO_API" });
  console.log("[proxy] NEXT_CRYPTO_API:", process.env.NEXT_CRYPTO_API);


  const { resource, metric_name, coin, query } = req.query;

  let path: string;
  if (resource === "news") {
    path = `/${env}/news`;
  } else if (resource === "on_chain_metrics") {
    if (!metric_name || typeof metric_name !== "string") return res.status(400).json({ error: "Bad metric_name" });
    path = `/${env}/on_chain_metrics?metric=${encodeURIComponent(metric_name)}`;
  } else if (resource === "predictions") {
    if (!coin || typeof coin !== "string") return res.status(400).json({ error: "Bad coin" });
    path = `/${env}/predictions?coin=${encodeURIComponent(coin)}`;
  } else if (resource === "predictions_results") {
    if (!query || typeof query !== "string") return res.status(400).json({ error: "Bad query" });
    path = `/${env}/predictions_results?query=${encodeURIComponent(query)}`;
  } else {
    return res.status(400).json({ error: "Bad resource" });
  }

  const url = `https://${apiHost}${path}`;
  console.log("[proxy] -> upstream", url);

  const upstream = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${chosen}`, // ✅ id_token first
      Accept: "application/json",
    },
  });

  const text = await upstream.text();
  console.log("[proxy] <- upstream", { status: upstream.status, body: text.slice(0, 300) });

  res.status(upstream.status);
  res.setHeader("content-type", upstream.headers.get("content-type") || "text/plain");
  return res.send(text);
}
