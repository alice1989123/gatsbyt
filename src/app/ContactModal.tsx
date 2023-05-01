import React from 'react';
import './ContactModal.css';
import { FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'; // Import Font Awesome icons

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal = (props: ContactModalProps) => {
  return (
    <div className="modal-background" onClick={props.onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={props.onClose}>
          X
        </button>
        <h2>Contact Information</h2>
        <p>
          Feel free to contact me if you are interested in promoting
          decentralized finance and open artificial intelligence.
        </p>
        <div className="facontainer">
          <a
            href="https://www.linkedin.com/in/jazm%C3%ADn-alicia-basilio-vel%C3%A1zquez-aa9804205/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a href="mailto:aliciabasilo.ab@gmail.com">
            <FaEnvelope />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
