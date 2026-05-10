/* Footer — Minimalist Human Design Version */
import { Link } from 'react-router-dom';
import { Mail, Sparkles, Globe, Play, Camera, MessageCircle, MessageSquare } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-primary" id="main-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/image.png" alt="Prompt by Niti" className="footer__logo-img" />
            <span className="footer__logo-text">
              Prompt <span className="text-secondary" style={{ fontSize: '0.8em' }}>by</span> <span className="text-orange">Niti</span>
            </span>
          </div>
          <p className="footer__tagline">
            Get <span className="text-orange">Tokens</span>, generate studio-quality <span className="text-cyan">Prompts</span>, and <span className="text-pink">Sell</span> your creations in seconds.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social-link" title="YouTube"><Play size={20} /></a>
            <a href="#" className="footer__social-link" title="Instagram"><Camera size={20} /></a>
            <a href="#" className="footer__social-link" title="X (Twitter)"><MessageCircle size={20} /></a>
            <a href="#" className="footer__social-link" title="Email"><Mail size={20} /></a>
            <a href="#" className="footer__social-link" title="Discord"><MessageSquare size={20} /></a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <h4 className="text-cyan">Platform</h4>
            <Link to="/generate">Prompt Generator</Link>
            <Link to="/templates">Marketplace</Link>
            <Link to="/library">Free Library</Link>
            <Link to="/pricing">Pricing</Link>
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
