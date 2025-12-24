import type { NextApiRequest, NextApiResponse } from "next";

function clear(name: string, opts: { domain?: string; secure?: boolean }) {
  const parts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proto = req.headers["x-forwarded-proto"];
  const isHttps = proto === "https";

  // If in prod you set Domain=gatsbyt.com, put it here.
  // For localhost, leave AUTH_COOKIE_DOMAIN undefined.
  const domain = process.env.AUTH_COOKIE_DOMAIN; // e.g. "gatsbyt.com"

  const cookieNames = ["id_token", "access_token", "refresh_token"];

  const toSet: string[] = [];
  for (const n of cookieNames) {
    // clear host-only cookie
    toSet.push(clear(n, { secure: isHttps }));

    // clear domain cookie too (if configured)
    if (domain) toSet.push(clear(n, { domain, secure: isHttps }));
  }

  res.setHeader("Set-Cookie", toSet);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true });
}
