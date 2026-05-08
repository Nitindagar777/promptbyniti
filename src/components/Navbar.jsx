/* Navbar Component — Premium Human Design */
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, User, Menu, X, FlaskConical } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const ADMIN_EMAIL = 'nitindagar0800@gmail.com';

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
  const isAdmin = state?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

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
          {isAdmin && (
            <li>
              <Link to="/admin-lab" className={`navbar__link navbar__link--admin ${isActive('/admin-lab') ? 'navbar__link--active' : ''}`}>
                <FlaskConical size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Test Lab
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar__actions">
          {state?.user ? (
            <>
              <div className="navbar__credits" title="Remaining Credits">
                <Zap size={16} fill="currentColor" />
                <span>{Math.floor(state?.credits ?? 0)}</span>
              </div>
              <Link to="/settings" className="navbar__avatar" title="Settings">
                <img 
                  src={state.user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60'} 
                  alt="User" 
                  className="navbar__avatar-img" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60' }}
                />
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
