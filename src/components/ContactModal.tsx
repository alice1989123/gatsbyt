import React, { useEffect } from "react";
import "./ContactModal.css";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal = ({ onClose }: ContactModalProps) => {
  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="contact-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="contact-card" onClick={(e) => e.stopPropagation()}>
        <div className="contact-top">
          <div>
            <h2 className="contact-title">Contact</h2>
            <p className="contact-subtitle">
              Let’s connect — partnerships, feedback, or collaboration.
            </p>
          </div>

          <button className="contact-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="contact-actions">
          <a
            className="contact-icon-btn"
            href="https://www.linkedin.com/in/jazm%C3%ADn-alicia-basilio-vel%C3%A1zquez-aa9804205/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <a
            className="contact-icon-btn"
            href="mailto:aliciabasilo.ab@gmail.com"
            aria-label="Email"
            title="Email"
          >
            <FaEnvelope />
          </a>

          <a
            className="contact-icon-btn"
            href="https://github.com/alice1989123"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <FaGithub />
          </a>
        </div>

        <div className="contact-footer">
          <span className="contact-hint">Tip:</span> Press <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
