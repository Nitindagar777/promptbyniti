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
            <span className="footer__logo-text">Prompt by Niti</span>
          </div>
          <p className="footer__tagline">
            Professional AI prompt engineering platform.
            Generate studio-quality prompts for any AI model in seconds.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social-link"><Globe size={20} /></a>
            <a href="#" className="footer__social-link"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <h4>Platform</h4>
            <Link to="/generate">Generator</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/library">Library</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer__column">
            <h4>Resources</h4>
            <a href="#">Docs</a>
            <a href="#">Blog</a>
            <a href="#">Tutorials</a>
            <a href="#">API</a>
          </div>
          <div className="footer__column">
            <h4>Company</h4>
            <Link to="/settings">About</Link>
            <a href="#">Careers</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {currentYear} Prompt by Niti. All rights reserved.</p>
        <p>Made with ❤️ by Niti</p>
      </div>
    </footer>
  );
}
