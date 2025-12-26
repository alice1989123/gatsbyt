import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;          // https://login.gatsbyt.com
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;     // SPA client id (NO secret)
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!; // http://localhost:3000/auth/callback
  const next = (req.query.next as string) || "/";

  console.log("[login] redirecting to Cognito Hosted UI");
  console.log(domain, clientId, redirectUri);
  // PKCE
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());

  // store verifier + next in cookies (host-only, same site)
  const isProd = process.env.NEXT_PUBLIC_ENV === "prod";
  const cookieBase = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : "",
    "Max-Age=300",
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", [
    `pkce_verifier=${verifier}; ${cookieBase}`,
    `post_login_redirect=${encodeURIComponent(next)}; ${cookieBase}`,
  ]);

  const authUrl =
    `${domain}/oauth2/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: redirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();

  res.redirect(authUrl);
}
