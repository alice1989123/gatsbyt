// pages/login.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

const LoginPage = () => {
  const router = useRouter();
  const reasonParam = router.query.reason;
  const reason = typeof reasonParam === "string" ? reasonParam : undefined;

  // Mensaje según motivo de redirección
  const message = useMemo(() => {
    switch (reason) {
      case "unauthenticated":
        return "Necesitas iniciar sesión para ver esa página.";
      case "expired":
        return "Tu sesión ha expirado, vuelve a iniciar sesión.";
      default:
        return "Inicia sesión para continuar.";
    }
  }, [reason]);

  // Log de variables de entorno (solo en dev)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[login] env snapshot (pages router)", {
        NEXT_PUBLIC_COGNITO_DOMAIN:
          process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "(missing)",
        NEXT_PUBLIC_COGNITO_CLIENT_ID:
          process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "(missing)",
        NEXT_PUBLIC_COGNITO_REDIRECT_URI:
          process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? "(missing)",
      });
    }
  }, []);

  const handleLogin = () => {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

    // Validación básica de configuración
    if (!domain || !clientId || !redirectUri) {
      console.error("[login] Missing Cognito env variables", {
        domain,
        clientId,
        redirectUri,
      });
      alert(
        "Error de configuración: faltan variables NEXT_PUBLIC_COGNITO_*. Revisa .env.local y reinicia `npm run dev`.",
      );
      return;
    }

    const scopes = encodeURIComponent("openid email");

    const authorizeUrl =
      `${domain}/oauth2/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    if (process.env.NODE_ENV === "development") {
      console.log("[login] redirecting to", authorizeUrl);
    }

    window.location.href = authorizeUrl;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #0ff2, #020015)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          padding: "2.5rem 3rem",
          borderRadius: "1.25rem",
          background: "rgba(0, 0, 0, 0.65)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          maxWidth: 420,
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Gatsbyt</h1>
        <p style={{ opacity: 0.8, marginBottom: "1.5rem" }}>{message}</p>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "0.85rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600,
            background:
              "linear-gradient(135deg, #00f5ff 0%, #2f6bff 40%, #9b5cff 100%)",
            color: "#050614",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          Iniciar sesión con Cognito
        </button>

        {process.env.NODE_ENV === "development" && (
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", opacity: 0.7 }}>
            DEV:{" "}
            {reason ? (
              <>
                reason=<code>{reason}</code>
              </>
            ) : (
              "sin reason"
            )}
          </p>
        )}
      </div>
    </main>
  );
};

export default LoginPage;
