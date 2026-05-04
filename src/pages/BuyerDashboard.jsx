import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Zap, Clock, Search, Filter,
  Copy, Eye, ChevronRight, Layout, ArrowLeft,
  Sparkles, Download, Heart, Play, Image, Type
} from 'lucide-react';
import { useState, useEffect } from 'react';
import PromptThumbnail from '../components/PromptThumbnail';
import './BuyerDashboard.css';

export default function BuyerDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalPurchased: 0,
    totalSpent: 0,
    library: [],
    credits: 0
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const token = localStorage.getItem('promptbyniti_token');
        const API_BASE = import.meta.env.VITE_API_URL ||
          (window.location.hostname.includes('oopsverse.cloud')
            ? 'https://oopsverse.cloud/api'
            : 'http://localhost:8845/api');

        const res = await fetch(`${API_BASE}/buyer/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Buyer fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyerData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Prompt copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="dash-loading-v2">
        <div className="premium-loader"></div>
        <p>Connecting to Prompt by Niti...</p>
      </div>
    );
  }

  const filteredLibrary = stats.library.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="buyer-dashboard" id="buyer-dashboard">
      {/* Toast */}
      {toast && (
        <div className={`dash-toast animate-slide-up ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      )}

      <div className="container">
        {/* Header */}
        <header className="dash-header">
          <div className="dash-user-profile">
            <div className="dash-avatar-main">
              <img
                src={state.user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60'}
                alt="Avatar"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60' }}
              />
            </div>
            <div className="dash-user-info">
              <h1>{state.user?.name || 'Buyer Hub'}</h1>
              <p className="dash-user-email">{state.user?.email}</p>
              {state.user?.bio && state.user.bio.trim() !== '' && (
                <p className="dash-user-bio">
                  "{state.user.bio}"
                </p>
              )}
              <p className="dash-user-subtext" style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '10px' }}>
                Managing {stats.totalPurchased} Unlocked Prompts
              </p>
            </div>
          </div>
          <div className="dash-header-actions">
            <Link to="/templates" className="btn btn-secondary btn-glow">
              <ShoppingBag size={18} /> Marketplace
            </Link>
            <button onClick={() => navigate(-1)} className="btn btn-back-premium">
              <ArrowLeft size={18} /> <span>Back</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid-premium mb-xl">
          <div className="stat-card-new theme-purple">
            <div className="stat-icon-circle purple-bg"><ShoppingBag size={24} /></div>
            <div className="stat-data">
              <span className="stat-label">Total Unlocked</span>
              <h2 className="stat-value">{stats.totalPurchased}</h2>
            </div>
          </div>
          <div className="stat-card-new theme-green">
            <div className="stat-icon-circle green-bg"><Zap size={24} /></div>
            <div className="stat-data">
              <span className="stat-label">Tokens Spent</span>
              <h2 className="stat-value">{Math.floor(stats.totalSpent || 0)}</h2>
            </div>
          </div>
          <div className="stat-card-new theme-cyan">
            <div className="stat-icon-circle cyan-bg"><Clock size={24} /></div>
            <div className="stat-data">
              <span className="stat-label">Available Balance</span>
              <h2 className="stat-value">{Math.floor(state.credits || 0)} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Tokens</span></h2>
            </div>
          </div>
        </div>

        {/* Library Section */}
        <div className="library-section card premium-card">
          <div className="section-header-row mb-lg">
            <div className="header-with-icon">
              <Layout size={20} className="text-purple" />
              <h3>My Purchased Prompts</h3>
            </div>
            <div className="dash-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="purchased-grid">
            {filteredLibrary.length > 0 ? (
              filteredLibrary.map(prompt => (
                <div key={prompt._id} className="purchase-card animate-fade-in">
                  <div className="purchase-thumb">
                    <PromptThumbnail
                      src={prompt.thumbnail || prompt.video || (prompt.samples?.[0]?.output || prompt.samples?.[0])}
                      alt={prompt.name}
                      type={prompt.generateType}
                      samples={prompt.samples}
                    />
                    <div className="purchase-type-badge">
                      {prompt.generateType === 'video' ? <><Play size={12} fill="currentColor" /> Video</> : 
                       (prompt.generateType === 'text' || !prompt.thumbnail) ? <><Type size={12} /> Text</> :
                       <><Image size={12} /> Image</>}
                    </div>
                    <div className="purchase-overlay">
                      <button className="btn-icon-glass" onClick={() => window.open(`/purchase-success/${prompt._id}`, '_blank')} title="View Secret Details">
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="purchase-details">
                    <div className="purchase-meta">
                      <span className="category-tag">{prompt.category}</span>
                      <span className="seller-name">by {prompt.seller?.name}</span>
                    </div>
                    <h4>{prompt.name}</h4>
                    <div className="purchase-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button className="btn-copy-prompt" onClick={() => handleCopy(prompt.template)}>
                        <Copy size={16} /> Copy Secret Prompt
                      </button>
                      <button
                        className="btn-view-access"
                        onClick={() => window.open(`/purchase-success/${prompt._id}`, '_blank')}
                        style={{
                          width: '100%',
                          background: 'rgba(168, 85, 247, 0.1)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                          color: 'var(--color-purple)',
                          padding: '10px',
                          borderRadius: '12px',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Eye size={16} /> View Full Instructions
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-library">
                <ShoppingBag size={48} />
                <p>Your library is empty</p>
                <span>Unlock your first pro prompt in the marketplace</span>
                <Link to="/templates" className="btn btn-primary mt-md">Explore Marketplace</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
