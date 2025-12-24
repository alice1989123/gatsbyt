"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaUserCircle } from "react-icons/fa";
import ContactModal from "./ContactModal"; // ✅ fix path
import "./Header.css";

const Header = () => {
  const pathname = usePathname();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // user dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

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

async function logout() {
  await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const logoutUri = encodeURIComponent(window.location.origin + "/");

  window.location.href =
    `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${logoutUri}`;
}

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Left */}
          <div className="header-left">
            <div className="header-logo">Gatsbyt</div>

            <nav className="header-nav desktop-only">
              <Link href="/" className={`header-link ${pathname === "/" ? "active" : ""}`}>Forecast</Link>
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

            {/* ✅ User dropdown */}
            <div className="user-menu" ref={userMenuRef}>
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
            <Link href="/" className="header-link" onClick={closeMobileMenu}>Forecast</Link>
            <Link href="/signals" className="header-link" onClick={closeMobileMenu}>Signals</Link>
            <Link href="/performance" className="header-link" onClick={closeMobileMenu}>Performance</Link>
            <Link href="/onchain" className="header-link" onClick={closeMobileMenu}>On-Chain</Link>
            <Link href="/news" className="header-link" onClick={closeMobileMenu}>News</Link>

            <button onClick={() => { setIsContactModalOpen(true); closeMobileMenu(); }} className="header-contact">
              Contact
            </button>

            <button onClick={logout} className="header-contact" style={{ marginTop: 8 }}>
              Log out
            </button>
          </nav>
        </div>
      </header>

      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
    </>
  );
};

export default Header;
