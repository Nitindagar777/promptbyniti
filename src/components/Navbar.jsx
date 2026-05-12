/* Navbar Component — Premium Human Design */
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, User, Menu, X, FlaskConical, Bell, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const ADMIN_EMAIL = 'nitindagar0800@gmail.com';

export default function Navbar() {
  const { state } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Persist last seen count in localStorage
  const [lastCount, setLastCount] = useState(() => {
    const saved = localStorage.getItem('promptniti_notif_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Logo Animation Hooks
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const logoRef = useRef(null);
  const logoAngle = useRef(0);
  const logoVelocity = useRef(0);
  const logoAnimRef = useRef(null);

  useEffect(() => {
    const animateLogo = () => {
      if (isLogoHovered) {
        // Wind up like a fan
        logoVelocity.current = Math.min(logoVelocity.current + 0.5, 12);
      } else {
        // Wind down slowly like a real fan
        logoVelocity.current = Math.max(logoVelocity.current - 0.15, 0);
      }

      if (logoVelocity.current > 0) {
        logoAngle.current += logoVelocity.current;
        if (logoRef.current) {
          logoRef.current.style.transform = `rotate(${logoAngle.current}deg)`;
        }
      }

      logoAnimRef.current = requestAnimationFrame(animateLogo);
    };

    logoAnimRef.current = requestAnimationFrame(animateLogo);
    return () => cancelAnimationFrame(logoAnimRef.current);
  }, [isLogoHovered]);

  // Generate real notifications from app state
  useEffect(() => {
    if (!state.user) return;

    const list = [];
    
    // 1. Prompt generations
    if (state.prompts && state.prompts.length > 0) {
      state.prompts.slice(0, 5).forEach(p => {
        list.push({
          id: `p-${p.id}`,
          type: 'prompt',
          text: `Prompt "${p.title || p.name || 'Untitled'}" generated successfully.`,
          time: new Date(p.createdAt || Date.now()).toLocaleDateString(),
          icon: <Sparkles size={14} className="text-cyan" />,
          rawTime: p.createdAt || Date.now()
        });
      });
    }

    // 2. Marketplace Purchases
    if (state.user.purchasedPrompts && state.user.purchasedPrompts.length > 0) {
      state.user.purchasedPrompts.slice(0, 3).forEach((id, idx) => {
        list.push({
          id: `buy-${id}-${idx}`,
          type: 'payment',
          text: `You purchased a new prompt from the marketplace.`,
          time: 'Recently',
          icon: <Zap size={14} className="text-orange" />,
          rawTime: Date.now() - (idx * 3600000)
        });
      });
    }

    // Sort by time
    const sorted = list.sort((a, b) => b.rawTime - a.rawTime);
    setNotifications(sorted);

    // Red dot logic: if current count is more than what we saw last time
    if (sorted.length > lastCount && lastCount !== 0) {
      setHasUnread(true);
    } else if (lastCount === 0 && sorted.length > 0) {
      // First load, let's show the dot once
      setHasUnread(true);
    }
  }, [state.prompts, state.user?.purchasedPrompts, state.user]);

  const handleToggleNotifications = () => {
    const newShow = !showNotifications;
    setShowNotifications(newShow);
    if (newShow) {
      setHasUnread(false);
      const currentCount = notifications.length;
      setLastCount(currentCount);
      localStorage.setItem('promptniti_notif_count', currentCount.toString());
    }
  };

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
        <Link 
          to="/" 
          className="navbar__logo" 
          id="nav-logo"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <img ref={logoRef} src="/image.png" alt="Prompt by Niti" className="navbar__logo-img" />
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

              {/* Notification Bell */}
              <div className="navbar__notifications-wrapper">
                <button 
                  className={`navbar__action-btn ${showNotifications ? 'active' : ''}`} 
                  onClick={handleToggleNotifications}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {hasUnread && <span className="navbar__notification-dot"></span>}
                </button>

                {showNotifications && (
                  <div className="navbar__notifications-dropdown glass-effect">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notif => (
                        <div key={notif.id} className="notification-item">
                          <div className="notification-icon-box">
                            {notif.icon}
                          </div>
                          <div className="notification-content">
                            <p>{notif.text}</p>
                            <span>{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
