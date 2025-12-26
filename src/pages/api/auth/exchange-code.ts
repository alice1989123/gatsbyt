import type { NextApiRequest, NextApiResponse } from "next";

function getCookie(req: NextApiRequest, name: string) {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map(s => s.trim());
  const found = parts.find(p => p.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const code = req.query.code;
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Missing code" });

  const verifier = getCookie(req, "pkce_verifier");
  if (!verifier) return res.status(400).json({ error: "Missing PKCE verifier cookie" });

  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;         // SPA client id (NO secret)
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const tokenRes = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await tokenRes.text();
  if (!tokenRes.ok) {
    return res.status(500).json({ error: "Token exchange failed", details: text });
  }

  const tokens = JSON.parse(text);

  // store tokens (simple cookie session; improve later)
  const isProd = process.env.NODE_ENV === "production";
  const baseCookie = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : "",
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", [
    `id_token=${tokens.id_token}; ${baseCookie}; Max-Age=${tokens.expires_in}`,
    `access_token=${tokens.access_token}; ${baseCookie}; Max-Age=${tokens.expires_in}`,
  ]);

  return res.status(200).json({ ok: true });
}
