"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaUserCircle } from "react-icons/fa";
import ContactModal from "./ContactModal";
import "./Header.css";

type SessionResponse = {
  authenticated: boolean;
  user?: { email?: string; name?: string };
};

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // user dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // auth session
  const [session, setSession] = useState<SessionResponse>({ authenticated: false });
  const [sessionLoading, setSessionLoading] = useState(true);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);
  const closeUserMenu = () => setUserMenuOpen(false);

  // close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) closeUserMenu();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // load session (because HttpOnly cookies can't be read by JS)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setSessionLoading(true);
        const r = await fetch("/api/auth/session", { credentials: "include" });
        const data: SessionResponse = r.ok ? await r.json() : { authenticated: false };
        if (alive) setSession(data);
      } catch {
        if (alive) setSession({ authenticated: false });
      } finally {
        if (alive) setSessionLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Login: send user to hosted UI via your server endpoint (recommended)
  function login() {
    const qs = searchParams?.toString();
    const next = pathname + (qs ? `?${qs}` : "");
    window.location.href = `/api/auth/login?next=${encodeURIComponent(next)}`;
  }

  async function logout() {
    // Clear cookies server-side first
    await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

    // Then logout from Hosted UI session (optional but good)
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const logoutUri = encodeURIComponent(window.location.origin + "/");

    window.location.href =
      `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${logoutUri}`;
  }

  const showAuthedUI = session.authenticated && !sessionLoading;

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Left */}
          <div className="header-left">
           <Link href="/" className="header-logo" aria-label="Go to home">
            <Image
              src="/gatsbyt_logo_header_transparent_tight.png"
              alt="gatsbyt"
              width={180}
              height={58}
              priority
              style={{ height: 58, width: "auto" }}
            />
          </Link>
            <nav className="header-nav desktop-only">
              <Link href="/predictions" className={`header-link ${pathname === "/predictions" ? "active" : ""}`}>
                Forecast
              </Link>
              <Link href="/signals" className={`header-link ${pathname === "/signals" ? "active" : ""}`}>Signals</Link>
              <Link href="/performance" className={`header-link ${pathname === "/performance" ? "active" : ""}`}>Performance</Link>
              <Link href="/onchain" className={`header-link ${pathname === "/onchain" ? "active" : ""}`}>On-Chain</Link>
              <Link href="/news" className={`header-link ${pathname === "/news" ? "active" : ""}`}>News</Link>
            </nav>
          </div>

          {/* Right */}
          <div className="header-right">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="icon-btn"
              aria-label="Contact"
              title="Contact"
            >
              <FaEnvelope />
              <span className="icon-btn-label">Contact</span>
            </button>

            {/* Account / Sign in */}
            <div className="user-menu" ref={userMenuRef}>
              {showAuthedUI ? (
                <>
                  <button
                    className="icon-btn"
                    onClick={toggleUserMenu}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    aria-label="Account"
                    title="Account"
                  >
                    <FaUserCircle />
                    <span className="icon-btn-label">Account</span>
                    <span className="chev">▾</span>
                  </button>

                  {userMenuOpen && (
                    <div className="user-menu-dropdown" role="menu">
                      <Link className="user-menu-item link" href="/account" onClick={closeUserMenu}>
                        Profile
                      </Link>
                      <button className="user-menu-item danger" onClick={logout}>
                        Log out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="icon-btn"
                  onClick={login}
                  aria-label="Sign in"
                  title="Sign in"
                  disabled={sessionLoading}
                >
                  <FaUserCircle />
                  <span className="icon-btn-label">{sessionLoading ? "…" : "Sign in"}</span>
                </button>
              )}
            </div>

            <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="20" y1="30" x2="80" y2="30" />
                <line x1="20" y1="50" x2="80" y2="50" />
                <line x1="20" y1="70" x2="80" y2="70" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`header-nav-wrapper ${mobileMenuOpen ? "open" : ""}`}>
          <nav className="header-nav">
            <Link href="/predictions" className="header-link" onClick={closeMobileMenu}>Forecast</Link>
            <Link href="/signals" className="header-link" onClick={closeMobileMenu}>Signals</Link>
            <Link href="/performance" className="header-link" onClick={closeMobileMenu}>Performance</Link>
            <Link href="/onchain" className="header-link" onClick={closeMobileMenu}>On-Chain</Link>
            <Link href="/news" className="header-link" onClick={closeMobileMenu}>News</Link>

            <button onClick={() => { setIsContactModalOpen(true); closeMobileMenu(); }} className="header-contact">
              Contact
            </button>

            {showAuthedUI ? (
              <button onClick={logout} className="header-contact" style={{ marginTop: 8 }}>
                Log out
              </button>
            ) : (
              <button onClick={login} className="header-contact" style={{ marginTop: 8 }} disabled={sessionLoading}>
                {sessionLoading ? "…" : "Sign in"}
              </button>
            )}
          </nav>
        </div>
      </header>

      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
    </>
  );
};

export default Header;
