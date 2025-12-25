import aws4 from "aws4";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { resource, metric_name, coin, query } = req.query;

  // These will be inlined from next.config.js env:
  const apiHost = process.env.NEXT_CRYPTO_API;         // e.g. kz89j9juql.execute-api.mx-central-1.amazonaws.com
  const region = process.env.NEXT_DEFAULT_REGION;      // e.g. mx-central-1
  const accessKeyId = process.env.NEXT_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_SECRET_ACCESS_KEY;

  // Fail fast so you don't sign "undefined"
  if (!apiHost || !region || !accessKeyId || !secretAccessKey) {
    console.log("ENV_PRESENT", {
      NEXT_CRYPTO_API: !!apiHost,
      NEXT_DEFAULT_REGION: !!region,
      NEXT_ACCESS_KEY_ID: !!accessKeyId,
      NEXT_SECRET_ACCESS_KEY: !!secretAccessKey,
    });
    return res.status(500).json({ error: "Missing required env vars (inlined build env not present)" });
  }

  let path: string;

  if (resource === "news") {
    path = "/default/news";
  } else if (resource === "on_chain_metrics") {
    if (!metric_name || typeof metric_name !== "string") {
      return res.status(400).json({ error: "Missing or invalid metric_name" });
    }
    path = `/default/on_chain_metrics?metric=${encodeURIComponent(metric_name)}`;
  } else if (resource === "predictions") {
    if (!coin || typeof coin !== "string") {
      return res.status(400).json({ error: "Missing or invalid coin" });
    }
    path = `/default/predictions?coin=${encodeURIComponent(coin)}`;
  } else if (resource === "predictions_results") {
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing or invalid query" });
    }
    path = `/default/predictions_results?query=${encodeURIComponent(query)}`;
  } else {
    return res.status(400).json({ error: "Missing or invalid resource" });
  }

  const opts: aws4.Request = {
    host: apiHost,
    path,
    method: "GET",
    service: "execute-api",
    region,
    headers: { Host: apiHost },
  };

  aws4.sign(opts, {
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  });

  const reqOptions = {
    hostname: apiHost,
    path,
    method: "GET",
    headers: opts.headers,
  };

  console.log("REQ", reqOptions);

  const proxyReq = https.request(reqOptions, (proxyRes) => {
    let data = "";
    proxyRes.on("data", (chunk) => (data += chunk));
    proxyRes.on("end", () => {
      try {
        res.status(proxyRes.statusCode || 200).json(JSON.parse(data));
      } catch (e) {
        console.error("[ERROR] JSON parse failed:", e);
        res.status(500).json({ error: "Invalid JSON response", raw: data });
      }
    });
  });

  proxyReq.on("error", (error) => {
    console.error("[ERROR] Request failed:", error);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  });

  proxyReq.end();
}
