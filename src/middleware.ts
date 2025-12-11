// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Si ya tenemos id_token en cookies, dejamos pasar
  const idToken = req.cookies.get("id_token")?.value;
  if (idToken) {
    return NextResponse.next();
  }

  // Si NO hay token, vamos a Cognito Hosted UI
  const domain = process.env.COGNITO_DOMAIN!;
  const clientId = process.env.COGNITO_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.COGNITO_REDIRECT_URI!);

  // scopes que quieres pedir
  const scopes = encodeURIComponent("openid email");

  // Guardamos a dónde quería ir originalmente el usuario
  const originalPath = req.nextUrl.pathname + req.nextUrl.search;
  const state = encodeURIComponent(originalPath || "/");

  const authorizeUrl =
    `${domain}/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;

  return NextResponse.redirect(authorizeUrl);
}

/**
 * Rutas donde se aplica el middleware.
 * Dejamos fuera estáticos, API y rutas de auth para que no entren en loop.
 */
export const config = {
  matcher: [
    // Todo menos:
    // - archivos estáticos de Next
    // - /api/*
    // - /auth/callback (vuelve de Cognito)
    // - /favicon.ico
    "/((?!_next/static|_next/image|api/|auth/callback|favicon.ico).*)",
  ],
};
