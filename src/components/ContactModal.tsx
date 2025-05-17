import React from 'react';
import './ContactModal.css';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'; // Import Font Awesome icons

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
     <div className='modal-header'>

            
            <h2>Contact Information</h2>
      </div>
        <p>
          Feel free to contact us if you are interested in promoting
          decentralized finance and open artificial intelligence.
        </p>
        <div className="modal-icons">
          <div>
              <a
                href="https://www.linkedin.com/in/jazm%C3%ADn-alicia-basilio-vel%C3%A1zquez-aa9804205/"
                target="_blank"
                rel="noopener noreferrer"
              >
            <FaLinkedin size={32} className="envelope-icon" />
          </a>
          </div>

          <div >
              <a href="mailto:aliciabasilo.ab@gmail.com">
                <FaEnvelope size={32}  className="envelope-icon" />
              </a>
          </div>
          <div >
              <a href="https://github.com/alice1989123">
                <FaGithub size={32}  className="envelope-icon" />
              </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
