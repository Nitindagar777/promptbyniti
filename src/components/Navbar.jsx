/* Navbar Component — Premium Human Design */
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { state } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" id="nav-logo">
          <span className="navbar__logo-text">
            Prompt <span className="text-secondary" style={{ fontSize: '0.8em' }}>by</span> <span className="text-orange">Niti</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__nav">
          <li>
            <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>Home</Link>
          </li>
          <li>
            <Link to="/generate" className={`navbar__link ${isActive('/generate') ? 'navbar__link--active' : ''}`}>Generate</Link>
          </li>
          <li>
            <Link to="/templates" className={`navbar__link ${isActive('/templates') ? 'navbar__link--active' : ''}`}>Templates</Link>
          </li>
          <li>
            <Link to="/library" className={`navbar__link ${isActive('/library') ? 'navbar__link--active' : ''}`}>Library</Link>
          </li>
          <li>
            <Link to="/pricing" className={`navbar__link ${isActive('/pricing') ? 'navbar__link--active' : ''}`}>Pricing</Link>
          </li>
        </ul>

        <div className="navbar__actions">
          <div className="navbar__credits" title="Remaining Credits">
            <Zap size={16} fill="currentColor" />
            <span>{state?.credits ?? 0}</span>
          </div>
          <Link to="/settings" className="navbar__avatar">
            <User size={20} />
          </Link>
        </div>
      </div>

    </nav>
  );
}
