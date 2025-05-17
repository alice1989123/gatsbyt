import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ContactModal from '../app/ContactModal';
import './Header.css';

const Header = () => {
  const pathname = usePathname();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Left: Logo + Nav */}
          <div className="header-left">
            <div className="header-logo">Gatsbyt</div>

            <nav className="header-nav desktop-only">
              <Link href="/" className={`header-link ${pathname === '/' ? 'active' : ''}`}>Forecast</Link>
              <Link href="/signals" className={`header-link ${pathname === '/signals' ? 'active' : ''}`}>Signals</Link>
              <Link href="/performance" className={`header-link ${pathname === '/performance' ? 'active' : ''}`}>Performance</Link>        
              <Link href="/onchain" className={`header-link ${pathname === '/onchain' ? 'active' : ''}`}>On-Chain</Link>
              <Link href="/news" className={`header-link ${pathname === '/news' ? 'active' : ''}`}>News</Link>

            </nav>
          </div>

          {/* Right: Contact + Hamburger */}
          <div className="header-right">
            <button onClick={() => setIsContactModalOpen(true)} className="header-contact">Contact</button>
            <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="20" y1="30" x2="80" y2="30" />
                <line x1="20" y1="50" x2="80" y2="50" />
                <line x1="20" y1="70" x2="80" y2="70" />
              </svg>
          </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={`header-nav-wrapper ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="header-nav">
            <Link href="/" className="header-link" onClick={closeMobileMenu}>Forecast</Link>
            <Link href="/signals" className="header-link" onClick={closeMobileMenu}>Signals</Link>
            <Link href="/performance" className="header-link" onClick={closeMobileMenu}>Performance</Link>         
            <Link href="/onchain" className="header-link" onClick={closeMobileMenu}>On-Chain</Link>
            <Link href="/news" className="header-link" onClick={closeMobileMenu}>News</Link>

            <button onClick={() => { setIsContactModalOpen(true); closeMobileMenu(); }} className="header-contact">Contact</button>
          </nav>
        </div>
      </header>

      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
    </>
  );
};

export default Header;
