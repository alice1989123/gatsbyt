"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaUserCircle } from "react-icons/fa";
import styles from "./Header.module.css";

type SessionResponse = {
  authenticated: boolean;
  user?: { email?: string; name?: string };
};

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [session, setSession] = useState<SessionResponse>({ authenticated: false });
  const [sessionLoading, setSessionLoading] = useState(true);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);
  const closeUserMenu = () => setUserMenuOpen(false);

  const fetchSession = async () => {
  try {
    setSessionLoading(true);
    const r = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    const data: SessionResponse = r.ok ? await r.json() : { authenticated: false };
    setSession(data);
  } catch {
    setSession({ authenticated: false });
  } finally {
    setSessionLoading(false);
  }
};


  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) closeUserMenu();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

useEffect(() => {
  fetchSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pathname, searchParams?.toString()]);


  function login() {
    const qs = searchParams?.toString();
    const next = pathname + (qs ? `?${qs}` : "");
    window.location.href = `/api/auth/login?next=${encodeURIComponent(next)}`;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const logoutUri = encodeURIComponent(window.location.origin + "/");

    window.location.href =
      `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${logoutUri}`;
  }

  const showAuthedUI = session.authenticated && !sessionLoading;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.headerLogo} aria-label="Go to home">
            <Image
              src="/gatsbyt_logo_header_transparent_tight.png"
              alt="gatsbyt"
              width={180}
              height={58}
              priority
              style={{ height: 58, width: "auto" }}
            />
          </Link>

          <nav className={`${styles.headerNav} ${styles.desktopOnly}`}>
            <Link
              href="/predictions"
              className={`${styles.headerLink} ${pathname === "/predictions" ? styles.active : ""}`}
            >
              Forecast
            </Link>
            <Link
              href="/signals"
              className={`${styles.headerLink} ${pathname === "/signals" ? styles.active : ""}`}
            >
              Signals
            </Link>
            <Link
              href="/performance"
              className={`${styles.headerLink} ${pathname === "/performance" ? styles.active : ""}`}
            >
              Performance
            </Link>
            <Link
              href="/onchain"
              className={`${styles.headerLink} ${pathname === "/onchain" ? styles.active : ""}`}
            >
              On-Chain
            </Link>
            <Link
              href="/news"
              className={`${styles.headerLink} ${pathname === "/news" ? styles.active : ""}`}
            >
              News
            </Link>
          </nav>
        </div>

        <div className={styles.headerRight}>
          <Link href="/contact" className={styles.iconBtn} aria-label="Contact" title="Contact">
            <FaEnvelope />
            <span className={styles.iconBtnLabel}>Contact</span>
          </Link>

          <div className={styles.userMenu} ref={userMenuRef}>
            {showAuthedUI ? (
              <>
                <button
                  className={styles.iconBtn}
                  onClick={toggleUserMenu}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Account"
                  title="Account"
                >
                  <FaUserCircle />
                  <span className={styles.iconBtnLabel}>Account</span>
                  <span className={styles.chev}>▾</span>
                </button>

                {userMenuOpen && (
                  <div className={styles.userMenuDropdown} role="menu">
                    <Link className={`${styles.userMenuItem} ${styles.link}`} href="/account" onClick={closeUserMenu}>
                      Profile
                    </Link>
                    <button className={`${styles.userMenuItem} ${styles.danger}`} onClick={logout}>
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={login}
                aria-label="Sign in"
                title="Sign in"
                disabled={sessionLoading}
              >
                <FaUserCircle />
                <span className={styles.iconBtnLabel}>{sessionLoading ? "…" : "Sign in"}</span>
              </button>
            )}
          </div>

          <button className={styles.menuToggle} onClick={toggleMobileMenu} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="20" y1="30" x2="80" y2="30" />
              <line x1="20" y1="50" x2="80" y2="50" />
              <line x1="20" y1="70" x2="80" y2="70" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`${styles.headerNavWrapper} ${mobileMenuOpen ? styles.open : ""}`}>
        <nav className={styles.headerNav}>
          <Link href="/predictions" className={styles.headerLink} onClick={closeMobileMenu}>Forecast</Link>
          <Link href="/signals" className={styles.headerLink} onClick={closeMobileMenu}>Signals</Link>
          <Link href="/performance" className={styles.headerLink} onClick={closeMobileMenu}>Performance</Link>
          <Link href="/onchain" className={styles.headerLink} onClick={closeMobileMenu}>On-Chain</Link>
          <Link href="/news" className={styles.headerLink} onClick={closeMobileMenu}>News</Link>
          <Link href="/contact" className={styles.headerLink} onClick={closeMobileMenu}>Contact</Link>

          {showAuthedUI ? (
            <button onClick={logout} className={styles.headerContact} style={{ marginTop: 8 }}>
              Log out
            </button>
          ) : (
            <button onClick={login} className={styles.headerContact} style={{ marginTop: 8 }} disabled={sessionLoading}>
              {sessionLoading ? "…" : "Sign in"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
