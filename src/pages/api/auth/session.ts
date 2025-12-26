import type { NextApiRequest, NextApiResponse } from "next";

function readCookie(req: NextApiRequest, name: string) {
  // If you already use cookie-parser, req.cookies will exist.
  // Next.js usually parses cookies for API routes, so this works:
  return req.cookies?.[name];
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];

    // base64url -> base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const idToken = readCookie(req, "id_token");
  const accessToken = readCookie(req, "access_token");

  if (!idToken || !accessToken) {
    return res.status(200).json({ authenticated: false });
  }

  const payload = decodeJwtPayload(idToken);

  return res.status(200).json({
    authenticated: true,
    user: {
      email: payload?.email,
      name: payload?.name,
      sub: payload?.sub,
      username: payload?.["cognito:username"],
    },
  });
}
