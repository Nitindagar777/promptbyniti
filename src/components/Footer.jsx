/* Footer — Minimalist Human Design Version */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { state } = useApp();
  const currentYear = new Date().getFullYear();
  const [isHovered, setIsHovered] = useState(false);
  const logoRef = useRef(null);
  const currentAngle = useRef(0);
  const velocity = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      if (isHovered) {
        // Wind up like a fan
        velocity.current = Math.min(velocity.current + 0.5, 12);
      } else {
        // Wind down slowly like a real fan
        velocity.current = Math.max(velocity.current - 0.15, 0);
      }

      if (velocity.current > 0) {
        currentAngle.current += velocity.current;
        if (logoRef.current) {
          logoRef.current.style.transform = `rotate(${currentAngle.current}deg)`;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isHovered]);

  return (
    <footer className="footer bg-primary" id="main-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div 
            className="footer__logo"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img ref={logoRef} src="/image1.png" alt="Prompt by Niti" className="footer__logo-img" />
            <span className="footer__logo-text">
              Prompt <span className="text-secondary" style={{ fontSize: '0.8em' }}>by</span> <span className="text-orange">Niti</span>
            </span>
          </div>
          <p className="footer__tagline">
            Discover, save, and generate studio-quality <span className="text-cyan">Prompts</span> from our community-driven <span className="text-pink">Pinterest-style feed</span>.
          </p>
          <div className="footer__socials">
            <a href="https://www.youtube.com/@promptbyniti" className="footer__social-link youtube" title="YouTube" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
            <a href="https://www.instagram.com/prompt_by_niti/" className="footer__social-link instagram" title="Instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://x.com/ndoot_official" className="footer__social-link x-twitter" title="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.309 17.41z" /></svg>
            </a>
            <a href="mailto:ndootweb@gmail.com" className="footer__social-link email" title="Email" target="_blank" rel="noopener noreferrer">
              <Mail size={20} />
            </a>
            <a href="https://discord.gg/vMSfcpQDpu" className="footer__social-link discord" title="Discord" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 1 .375-.292.071.071 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.071.071 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.946-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
            </a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <h4 className="text-cyan">Platform</h4>
            <Link to={state?.user ? "/generate" : "/login"}>Prompt Generator</Link>
            <Link to="/templates">Explore Feed</Link>
            {state?.user && <Link to="/pricing">Pricing</Link>}
          </div>
          <div className="footer__column">
            <h4 className="text-purple">Resources</h4>
            <Link to="/help">Help Center</Link>
          </div>
          <div className="footer__column">
            <h4 className="text-pink">Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {currentYear} Prompt by <span className="text-orange">Niti</span>. All rights reserved.</p>
        <p>Made with ❤️ by <span className="text-orange">Nitin</span></p>
      </div>
    </footer>
  );
}
