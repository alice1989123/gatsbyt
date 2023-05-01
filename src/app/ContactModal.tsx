import React from 'react';
import './ContactModal.css';
import { FaTwitter , FaLinkedin, FaEnvelope } from 'react-icons/fa'; // Import Font Awesome icons

const ContactModal = ({ onClose }) => {
    return (
      <div className="modal-background" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>X</button>
          <h2>Contact Information</h2>
          <p>
          Feel free to contact me if you're interested in promoting decentralized and open artificial intelligence.          </p>
          <a href="https://www.linkedin.com/in/jazm%C3%ADn-alicia-basilio-vel%C3%A1zquez-aa9804205/" target="_blank" rel="noopener noreferrer">
  <FaLinkedin />
</a>
            <a href="mailto:aliciabasilo.ab@gmail.com">            <FaEnvelope /> 
 </a>
        </div>
      </div>
    );
  };

export default ContactModal;
