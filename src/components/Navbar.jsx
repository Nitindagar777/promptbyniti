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
          <img src="/image.png" alt="Prompt by Niti" className="navbar__logo-img" />
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
            <Link to="/templates" className={`navbar__link ${isActive('/templates') ? 'navbar__link--active' : ''}`}>Store</Link>
          </li>
          <li>
            <Link to="/sell" className={`navbar__link ${isActive('/sell') ? 'navbar__link--active' : ''}`}>Sell</Link>
          </li>
          <li>
            <Link to="/library" className={`navbar__link ${isActive('/library') ? 'navbar__link--active' : ''}`}>Free</Link>
          </li>
          <li>
            <Link to="/pricing" className={`navbar__link ${isActive('/pricing') ? 'navbar__link--active' : ''}`}>Pricing</Link>
          </li>
        </ul>

        <div className="navbar__actions">
          {state?.user ? (
            <>
              <div className="navbar__credits" title="Remaining Credits">
                <Zap size={16} fill="currentColor" />
                <span>{state?.credits ?? 0}</span>
              </div>
              <Link to="/settings" className="navbar__avatar" title="Settings">
                {state.user?.avatar ? (
                  <img 
                    src={state.user.avatar} 
                    alt="User" 
                    className="navbar__avatar-img" 
                  />
                ) : (
                  <User size={20} />
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-blue" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', marginLeft: '6px' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

    </nav>
  );
}
