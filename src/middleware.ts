// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/callback",
  "/login",
  "/predictions",
  "/",
  "/methodology",
  "/data-sources",
  "/terms",
  "/privacy",
  "/contact",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;

  // static folders you serve
  if (
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts")
  ) return true;

  // any file like /robots.txt, /sitemap.xml, /something.png, etc.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow public routes & assets
  if (isPublicPath(pathname)) return NextResponse.next();

  // If already authenticated, continue
  const idToken = req.cookies.get("id_token")?.value;
  if (idToken) return NextResponse.next();

  // Redirect ALL requests (including x-nextjs-data JSON route loads)
  // so client-side navigation can’t “enter” protected pages unauthenticated.
  const originalPath = pathname + (search || "");
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/api/auth/login";
  loginUrl.searchParams.set("next", originalPath || "/");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Keep excluding Next static assets + images + api routes
  matcher: ["/((?!_next/static|_next/image|api/|favicon.ico).*)"],
};
