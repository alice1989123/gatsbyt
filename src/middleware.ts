// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/callback",
  "/login",
  "/predictions",
  "/", // keep if home is public; remove if home should be private
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;

  // common public static folders (if you use them)
  if (
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts")
  ) return true;

  // any file with extension: .png .jpg .css .js .map .ico etc.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 0) Let public/static requests pass
  if (isPublicPath(pathname)) return NextResponse.next();

  // (Optional but very useful) Only redirect “page navigations”
  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    // for fetch/image/etc, don't redirect to Hosted UI
    return NextResponse.next();
  }

  // 1) If token exists, allow
  const idToken = req.cookies.get("id_token")?.value;
  if (idToken) return NextResponse.next();

  // 2) Otherwise redirect to Cognito Hosted UI
  const domain = process.env.COGNITO_DOMAIN!;
  const clientId = process.env.COGNITO_CLIENT_ID!;
  const redirectUri = process.env.COGNITO_REDIRECT_URI!;
  const scopes = "openid email";

  const originalPath = pathname + (search || "");
  const state = encodeURIComponent(originalPath || "/");

  const authorizeUrl =
    `${domain}/oauth2/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  return NextResponse.redirect(authorizeUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico).*)",
  ],
};
