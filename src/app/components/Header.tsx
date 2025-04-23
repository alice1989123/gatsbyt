"use client"
import React, { useState } from 'react';
import './Header.css';
import ContactModal from '../ContactModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ✅ Correct import for App Router

const Header: React.FC = () => {
  const pathname = usePathname(); // ✅ Works in app/ directory
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">Gatsbyt</div>
        <nav className="header-nav">
        <Link href="/" className={`header-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link href="/onchain" className={`header-link ${pathname === '/onchain' ? 'active' : ''}`}>On-Chain</Link>
          <Link href="/news" className={`header-link ${pathname === '/news' ? 'active' : ''}`}>News</Link>
        </nav>
      </div>
      <button onClick={handleContactClick} className="header-contact">Contact</button>
      {isContactModalOpen && <ContactModal onClose={handleCloseModal} />}
    </header>
  );
};

export default Header;
