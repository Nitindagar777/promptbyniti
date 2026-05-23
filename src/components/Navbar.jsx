/* Navbar Component — Premium Human Design */
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, User, Menu, X, FlaskConical, Bell, ShoppingBag, Sparkles, AlertCircle, DollarSign, MessageSquare, Send, Users, Bot, Smile } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const ADMIN_EMAIL = 'nitindagar0800@gmail.com';

const SIMULATED_USERS = [
  { username: 'PromptWizard', color: '#38bdf8' },
  { username: 'SassQueen', color: '#ec4899' },
  { username: 'CodeCraft', color: '#10b981' },
  { username: 'AI_Innovator', color: '#f59e0b' },
  { username: 'DesignNinja', color: '#8b5cf6' },
  { username: 'Nitin_D', color: '#f97316' },
  { username: 'HyperText', color: '#06b6d4' }
];

const SIMULATED_PHRASES = [
  "Wow, that's clean! Just tested it in the Generate tab. 🔥",
  "Has anyone optimized prompts for Claude 3.5 Sonnet yet?",
  "Just sold another prompt template! This marketplace is awesome. 💎",
  "Try adding 'low contrast, photorealistic' to decrease AI artifacts.",
  "Highly recommend upgrading to the PRO tier for unlimited credits.",
  "Let's build a group prompt for generating React clean architecture!",
  "Is the midjourney v6 ratio command still --ar 16:9?",
  "Yes @DesignNinja, it is! Works perfectly.",
  "Welcome new joiners to the Prompt Lounge! 🤖☕",
  "Just earned 100 free credits from the seller stats page. Check it out!"
];


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

  // Chat Mascot & Lounge State
  const [chatNotificationsCount, setChatNotificationsCount] = useState(0);
  const [isMascotHovered, setIsMascotHovered] = useState(false);



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
    let baseTime = Date.now();
    
    // 1. Account / Plan Status
    if (state.user.plan !== 'free') {
      list.push({
        id: 'plan-active',
        type: 'system',
        text: `Your ${state.user.plan.toUpperCase()} plan is currently active.`,
        time: 'Active',
        icon: <Zap size={14} className="text-orange" />,
        rawTime: baseTime
      });
    } else {
      list.push({
        id: 'welcome',
        type: 'system',
        text: 'Welcome to Prompt by Niti! Explore the free library or upgrade for tokens.',
        time: 'System',
        icon: <Sparkles size={14} className="text-pink" />,
        rawTime: baseTime - 10000000
      });
    }

    // 2. Token / Credit Balance
    if (state.credits !== undefined || state.user.credits !== undefined) {
      const credits = Math.floor(state.credits || state.user.credits || 0);
      list.push({
        id: 'balance',
        type: 'system',
        text: `You currently have ${credits} tokens available in your account.`,
        time: 'Current Balance',
        icon: <ShoppingBag size={14} className="text-cyan" />,
        rawTime: baseTime - 500000
      });
    }
    
    // 3. Prompt generations
    if (state.prompts && state.prompts.length > 0) {
      state.prompts.slice(0, 5).forEach(p => {
        list.push({
          id: `p-${p.id}`,
          type: 'prompt',
          text: `Prompt "${p.title || p.name || 'Untitled'}" generated successfully.`,
          time: new Date(p.createdAt || Date.now()).toLocaleDateString(),
          icon: <Sparkles size={14} className="text-cyan" />,
          rawTime: new Date(p.createdAt || Date.now()).getTime()
        });
      });
    }

    // 4. Marketplace Purchases (Buy)
    if (state.user.purchasedPrompts && state.user.purchasedPrompts.length > 0) {
      state.user.purchasedPrompts.slice(0, 3).forEach((id, idx) => {
        list.push({
          id: `buy-${id}-${idx}`,
          type: 'payment',
          text: `You successfully purchased a new premium prompt!`,
          time: 'Recently',
          icon: <Zap size={14} className="text-orange" />,
          rawTime: baseTime - (idx * 3600000)
        });
      });
    }

    // 5. Seller Activity (Sale)
    if (state.sellerStats && state.sellerStats.recentActivity) {
      const sales = state.sellerStats.recentActivity.filter(a => a.type === 'sale');
      sales.slice(0, 3).forEach((sale, idx) => {
        list.push({
          id: sale.id || `sale-${idx}`,
          type: 'sale',
          text: `${sale.user} bought your prompt "${sale.prompt}"! You earned ${sale.price} tokens.`,
          time: sale.time || 'Recently',
          icon: <DollarSign size={14} className="text-green" />,
          rawTime: new Date(sale.timestamp).getTime() || (baseTime - (idx * 1800000))
        });
      });
    }

    // Sort by time (Newest at the top)
    const sorted = list.sort((a, b) => {
      const timeA = Number(a.rawTime) || 0;
      const timeB = Number(b.rawTime) || 0;
      return timeB - timeA;
    });
    setNotifications(sorted);

    // Red dot logic: if current count is more than what we saw last time
    if (sorted.length > lastCount && lastCount !== 0) {
      setHasUnread(true);
    } else if (lastCount === 0 && sorted.length > 0) {
      // First load, let's show the dot once
      setHasUnread(true);
    }
  }, [state.prompts, state.user?.purchasedPrompts, state.user, state.credits, state.sellerStats]);

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

  // Real-time unread messages count fetcher
  const fetchUnreadMessagesCount = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      if (!token) {
        setChatNotificationsCount(0);
        return;
      }
      const res = await fetch('/api/lounge/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChatNotificationsCount(data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (!state?.user) {
      setChatNotificationsCount(0);
      return;
    }
    fetchUnreadMessagesCount();
    const interval = setInterval(fetchUnreadMessagesCount, 4000);
    return () => clearInterval(interval);
  }, [state?.user, location.pathname]);


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
          <img ref={logoRef} src="/image1.png" alt="Prompt by Niti" className="navbar__logo-img" />
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
              {/* Animated Chat Mascot Widget (Available after login) */}
              <div className="navbar__mascot-wrapper">
                <Link
                  to="/lounge"
                  className="navbar__mascot-btn"
                  onMouseEnter={() => setIsMascotHovered(true)}
                  onMouseLeave={() => setIsMascotHovered(false)}
                  title="Group Discussion & Announcement"
                >
                  {/* Cute Custom Alien Mascot SVG */}
                  <svg 
                    width="38" 
                    height="38" 
                    viewBox="0 0 36 36" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`navbar__mascot-svg alien ${isMascotHovered ? 'hovered' : ''}`}
                  >
                    {/* Alien Head */}
                    <path 
                      d="M8 17 C 8 8, 28 8, 28 17 C 28 23, 23 27, 18 27 C 13 27, 8 23, 8 17 Z" 
                      fill="#10b981" 
                      stroke="#059669" 
                      strokeWidth="2" 
                    />
                    
                    {/* Antennas */}
                    <path d="M12 9 L 8 3" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" className="antenna-left" />
                    <circle cx="8" cy="2" r="2.5" fill="#fb923c" className="antenna-bulb-left" />
                    
                    <path d="M24 9 L 28 3" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" className="antenna-right" />
                    <circle cx="28" cy="2" r="2.5" fill="#fb923c" className="antenna-bulb-right" />
                    
                    {/* Cute Big Alien Eyes (Glossy/Interactive) */}
                    <ellipse cx="13.5" cy="15.5" rx="3.5" ry="5.5" fill="#0f172a" />
                    <ellipse cx="22.5" cy="15.5" rx="3.5" ry="5.5" fill="#0f172a" />
                    
                    {/* Eye shines */}
                    <circle cx="14.5" cy="13.5" r="1.2" fill="#ffffff" className="eye-shine" />
                    <circle cx="23.5" cy="13.5" r="1.2" fill="#ffffff" className="eye-shine" />
                    <circle cx="12.5" cy="17" r="0.6" fill="#ffffff" className="eye-shine-sub" />
                    <circle cx="21.5" cy="17" r="0.6" fill="#ffffff" className="eye-shine-sub" />
                    
                    {/* Smiling Mouth */}
                    <path d="M15 20.5 Q18 22.5 21 20.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" className="mouth" />
                    
                    {/* Rosy Cheeks */}
                    <ellipse cx="9.5" cy="18.5" rx="1.5" ry="1" fill="#ec4899" opacity="0.6" />
                    <ellipse cx="26.5" cy="18.5" rx="1.5" ry="1" fill="#ec4899" opacity="0.6" />

                    {/* Sparkles around Alien */}
                    <circle cx="5" cy="10" r="1" fill="#fb923c" className="sparkle spark-1" />
                    <circle cx="31" cy="10" r="1" fill="#38bdf8" className="sparkle spark-2" />
                  </svg>

                  {chatNotificationsCount > 0 && (
                    <span className="navbar__mascot-hollow-circle"></span>
                  )}
                </Link>
              </div>

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
