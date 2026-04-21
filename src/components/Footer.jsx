/* Footer — Minimalist Human Design Version */
import { Link } from 'react-router-dom';
import { Mail, Sparkles, Globe } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-primary" id="main-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-text">
              Prompt <span className="text-secondary" style={{ fontSize: '0.8em' }}>by</span> <span className="text-orange">Niti</span>
            </span>
          </div>
          <p className="footer__tagline">
            Get <span className="text-orange">Tokens</span>, generate studio-quality <span className="text-cyan">Prompts</span>, and <span className="text-pink">Sell</span> your creations in seconds.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social-link"><Globe size={20} /></a>
            <a href="#" className="footer__social-link"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <h4 className="text-cyan">Platform</h4>
            <Link to="/generate">Generator</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/library">Library</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer__column">
            <h4 className="text-purple">Resources</h4>
            <a href="#">Docs</a>
            <a href="#">Blog</a>
            <a href="#">Tutorials</a>
            <a href="#">API</a>
          </div>
          <div className="footer__column">
            <h4 className="text-pink">Company</h4>
            <Link to="/settings">About</Link>
            <a href="#">Careers</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {currentYear} Prompt by <span className="text-orange">Niti</span>. All rights reserved.</p>
        <p>Made with ❤️ by <span className="text-orange">Niti</span></p>
      </div>
    </footer>
  );
}
