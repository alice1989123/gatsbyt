import type { NextApiRequest, NextApiResponse } from "next";

type Tokens = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // ---- Basic request info ----
  console.log("[exchange-code] incoming request", {
    method: req.method,
    url: req.url,
    query: req.query,
  });

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.query.code;
  if (!code || typeof code !== "string") {
    console.log("[exchange-code] missing code param");
    return res.status(400).json({ error: "Missing code" });
  }

  // ---- Env snapshot (no secrets printed) ----
  const domain = process.env.COGNITO_DOMAIN!;
  const clientId = process.env.COGNITO_CLIENT_ID!;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const redirectUri = process.env.COGNITO_REDIRECT_URI!;

  console.log("[exchange-code] env snapshot", {
    NODE_ENV: process.env.NODE_ENV,
    COGNITO_DOMAIN: domain,
    COGNITO_CLIENT_ID: clientId,
    COGNITO_REDIRECT_URI: redirectUri,
    HAS_CLIENT_SECRET: !!clientSecret,
  });

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
  }

  const tokenUrl = `${domain}/oauth2/token`;

  console.log("[exchange-code] token request", {
    tokenUrl,
    body: body.toString(),
    headers: {
      ...headers,
      // don’t log actual auth header
      Authorization: headers.Authorization ? "[Basic ***]" : undefined,
    },
  });

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body,
    });

    console.log("[exchange-code] token response status", {
      status: tokenRes.status,
      statusText: tokenRes.statusText,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("[auth] token error:", tokenRes.status, text);
      return res
        .status(500)
        .json({ error: "Token exchange failed", details: text });
    }

    const tokens = (await tokenRes.json()) as Tokens;

    // Log only minimal info about tokens (no secrets)
    console.log("[exchange-code] token response OK", {
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      has_refresh_token: !!tokens.refresh_token,
      id_token_len: tokens.id_token?.length,
      access_token_len: tokens.access_token?.length,
    });

    // --- Very simple cookie-based session (improve later) ---
    const baseCookie = [
      "HttpOnly",
      "Path=/",
      "SameSite=Lax",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    const accessMaxAge = `Max-Age=${tokens.expires_in}`;

    const cookies: string[] = [
      `id_token=${tokens.id_token}; ${baseCookie}; ${accessMaxAge}`,
      `access_token=${tokens.access_token}; ${baseCookie}; ${accessMaxAge}`,
    ];

    if (tokens.refresh_token) {
      const refreshMaxAge = `Max-Age=${7 * 24 * 60 * 60}`;
      cookies.push(
        `refresh_token=${tokens.refresh_token}; ${baseCookie}; ${refreshMaxAge}`,
      );
    }

    console.log("[exchange-code] setting cookies", {
      cookieCount: cookies.length,
    });

    res.setHeader("Set-Cookie", cookies);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[auth] unexpected error", err);
    return res.status(500).json({ error: "Token exchange failed" });
  }
}
