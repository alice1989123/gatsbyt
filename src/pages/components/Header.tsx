import React from 'react';
import './Header.css';
import ContactModal from './ContactModal';
import { useState } from 'react';
const Header: React.FC = () => {

const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };
  return (
    <header className="header">
      <div className="header-logo">Gatsbyt</div>
      <button onClick={handleContactClick} className="header-contact">Contact</button>
      {isContactModalOpen && <ContactModal onClose={handleCloseModal} />}
    </header>
  );
};

export default Header;
