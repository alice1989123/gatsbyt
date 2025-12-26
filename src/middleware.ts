// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/callback",
  "/login",
  "/predictions",
  "/",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;

  if (
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts")
  ) return true;

  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/html")) return NextResponse.next();

  const idToken = req.cookies.get("id_token")?.value;
  if (idToken) return NextResponse.next();

  // ✅ Redirect to YOUR login starter (sets pkce_verifier cookie)
  const originalPath = pathname + (search || "");
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/api/auth/login";
  loginUrl.searchParams.set("next", originalPath || "/");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|favicon.ico).*)"],
};
