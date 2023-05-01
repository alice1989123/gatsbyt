import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-logo">Gatsbyt</div>
      <button className="header-contact">Contact</button>
    </header>
  );
};

export default Header;
