/* DashboardPage — User control center */
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Zap, Crown, Settings, Trash2, Copy, Check,
  DollarSign, TrendingUp, BarChart3, Wallet, Plus,
  Eye, ShoppingCart, Clock, Activity, ArrowUpRight,
  Filter, MoreVertical, Edit3, ChevronRight, Layout,
  ArrowLeft, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state, isPremium } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    activePrompts: 0,
    pendingPrompts: 0,
    rejectedPrompts: 0,
    totalViews: 0,
    conversionRate: '0%',
    prompts: [],
    recentActivity: []
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const API_BASE = import.meta.env.VITE_API_URL || 
        (window.location.hostname.includes('oopsverse.cloud') 
          ? 'https://oopsverse.cloud/api' 
          : 'http://localhost:8844/api');
          
      const res = await fetch(`${API_BASE}/prompts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (data.success) {
        // Remove from UI
        setStats(prev => ({
          ...prev,
          prompts: prev.prompts.filter(p => p._id !== id),
          activePrompts: prev.activePrompts - 1
        }));
      } else {
        alert(data.message || 'Failed to delete prompt');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Please try again.');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('promptbyniti_token');
        const API_BASE = import.meta.env.VITE_API_URL || 
          (window.location.hostname.includes('oopsverse.cloud') 
            ? 'https://oopsverse.cloud/api' 
            : 'http://localhost:8844/api');
            
        console.log(`--- Dashboard Debug ---`);
        console.log(`Connecting to: ${API_BASE}/seller/stats`);
        
        const res = await fetch(`${API_BASE}/seller/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        console.log(`Server Response:`, data);
        
        if (data.success) {
          setStats(data.stats);
          console.log(`Successfully loaded ${data.stats?.prompts?.length || 0} prompts.`);
        }
      } catch (err) {
        console.error('Fetch stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading-v2">
        <div className="premium-loader"></div>
        <p>Connecting to World X Data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page" id="seller-dashboard">
      <div className="container">
        {/* Dashboard Header */}
        <header className="dash-header">
          <div className="dash-user-profile">
            <div className="dash-avatar-main">
              {state.user?.avatar ? (
                <img src={state.user.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{state.user?.name?.[0] || 'U'}</div>
              )}
            </div>
            <div className="dash-user-info">
              <h1>{state.user?.name || 'Creator'}</h1>
              <p className="dash-user-email">{state.user?.email}</p>
            </div>
          </div>
          <div className="dash-header-actions">
            <Link to="/sell" className="btn btn-primary btn-glow">
              <Plus size={18} /> Add New Prompt
            </Link>
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-back-premium" title="Go Back">
              <ArrowLeft size={18} /> <span>Back</span>
            </button>
          </div>
        </header>

        {/* Dash Navigation */}
        <nav className="dash-nav">
          <button className={`dash-nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Activity size={18} /> Overview
          </button>
          <button className={`dash-nav-link ${activeTab === 'prompts' ? 'active' : ''}`} onClick={() => setActiveTab('prompts')}>
            <Layout size={18} /> My Prompts
          </button>
          <button className={`dash-nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={18} /> Analytics
          </button>
          <button className={`dash-nav-link ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
            <Wallet size={18} /> Wallet
          </button>
        </nav>

        {/* Content Area */}
        <main className="dash-main">
          {activeTab === 'overview' && (
            <div className="dash-overview animate-fade-in">
              {/* Stats Grid */}
              <div className="stats-grid-premium">
                <div className="stat-card-new theme-green">
                  <div className="stat-icon-circle green-bg"><DollarSign size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Earnings</span>
                    <h2 className="stat-value">${stats.totalEarnings.toLocaleString()}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +{stats.earningGrowth || 0}%</span>
                  </div>
                </div>
                <div className="stat-card-new theme-cyan">
                  <div className="stat-icon-circle cyan-bg"><ShoppingCart size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Sales</span>
                    <h2 className="stat-value">{stats.totalSales}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +{stats.salesGrowth || 0}%</span>
                  </div>
                </div>
                <div className="stat-card-new theme-orange">
                  <div className="stat-icon-circle orange-bg"><Layout size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">My Prompts</span>
                    <h2 className="stat-value">{stats.activePrompts}</h2>
                    <span className="stat-subtext">Total Uploads</span>
                  </div>
                </div>
                <div className="stat-card-new theme-purple">
                  <div className="stat-icon-circle purple-bg"><TrendingUp size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Conv. Rate</span>
                    <h2 className="stat-value">{stats.conversionRate}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +{stats.convGrowth || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="overview-row mt-xl">
                <div className="activity-section card premium-card">
                  <div className="section-header-row">
                    <div className="header-with-icon">
                      <Clock size={20} className="text-cyan" />
                      <h3>Recent Activity</h3>
                    </div>
                    <button className="btn-view-all" onClick={() => setShowActivityModal(true)}>View All</button>
                  </div>
                  <div className="activity-list">
                    {stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map(item => (
                        <div key={item.id} className="activity-item">
                          <div className="activity-user-av">{item.user[0].toUpperCase()}</div>
                          <div className="activity-content">
                            <p><strong>@{item.user}</strong> purchased <span>{item.prompt}</span></p>
                            <span className="activity-time">{item.time}</span>
                          </div>
                          <div className="activity-price text-green">+${item.price}</div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-activity">
                        <Clock size={32} />
                        <p>No activity yet</p>
                        <span>Your recent sales and views will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mini-chart-section card premium-card">
                  <div className="header-with-icon mb-lg">
                    <TrendingUp size={20} className="text-orange" />
                    <h3>Performance Hub</h3>
                  </div>
                  <div className="performance-container">
                    <div className="performance-chart-grid">
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="fake-bar-chart">
                        {(stats.dailyViews || [10, 10, 10, 10, 10, 10, 10]).map((h, i) => (
                          <div key={i} className="bar-wrapper">
                            <div className="bar-fill" style={{ height: `${h}%`, transitionDelay: `${i * 0.1}s` }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="growth-insight-badge">
                      <span className="insight-text">Weekly performance is up by <span className="text-orange">{stats.performanceGrowth || 0}%</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="dash-prompts animate-fade-in">
              <div className="section-header-row mb-lg">
                <h2>My Uploaded Prompts</h2>
                <div className="filter-actions">
                  <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
                </div>
              </div>
              <div className="prompts-table-wrapper card">
                <table className="prompts-table">
                  <thead>
                    <tr>
                      <th>Prompt Details</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Sales</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.prompts.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-prompt-info" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                            <img 
                              src={p.thumbnail || (p.samples && p.samples.length > 0 ? (p.samples[0].output || p.samples[0]) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60')} 
                              alt={p.name}
                              style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span className="prompt-title-small" style={{ fontWeight: 'bold' }}>{p.name}</span>
                              <span className="prompt-date-small" style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Added: {new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill status-${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td><div className="table-stat-box"><Eye size={14} /> {p.views || 0}</div></td>
                        <td><div className="table-stat-box"><ShoppingCart size={14} /> 0</div></td>
                        <td>
                          <span className="table-price-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
                            <Zap size={14} fill="currentColor" /> 5 Tokens
                          </span>
                        </td>
                        <td>
                          <div className="table-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                            <Link to={`/prompt/${p._id}`} title="View Prompt" style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center' }}><Eye size={18} /></Link>
                            <button onClick={() => navigate(`/sell?edit=${p._id}`)} title="Edit Prompt" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete(p._id)} title="Delete Prompt" style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="dash-analytics animate-fade-in">
              <div className="analytics-header mb-lg">
                <h2>Marketplace Analytics</h2>
                <div className="date-selector">
                  <button className="btn-pill active">Daily</button>
                  <button className="btn-pill">Weekly</button>
                  <button className="btn-pill">Monthly</button>
                </div>
              </div>
              <div className="analytics-grid">
                <div className="card analytics-main-chart">
                  <h3>Revenue Growth (USD)</h3>
                  <div className="chart-area-placeholder">
                    <div className="wave-chart">
                      <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0,20 L0,10 Q25,18 50,10 T100,5 L100,20 Z" fill="url(#grad)" />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--color-cyan)', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: 'var(--color-cyan)', stopOpacity: 0 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="card best-sellers-card">
                  <h3>Best Selling Prompts</h3>
                  <div className="mini-list">
                    {myPrompts.slice(0, 3).map(p => (
                      <div key={p.id} className="mini-list-item">
                        <span>{p.title}</span>
                        <span className="text-cyan font-bold">{p.sales} Sold</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="dash-wallet animate-fade-in">
              <div className="wallet-grid">
                <div className="card wallet-main-card">
                  <div className="wallet-header-top">
                    <Wallet size={32} className="text-cyan" />
                    <span>Niti Secure Wallet</span>
                  </div>
                  <div className="balance-display">
                    <span className="balance-label">Available Balance</span>
                    <h2 className="balance-value">$845.20</h2>
                  </div>
                  <div className="wallet-actions">
                    <button className="btn btn-primary w-full">Withdraw Funds</button>
                    <button className="btn btn-secondary w-full">Payout Settings</button>
                  </div>
                </div>
                <div className="card payout-history-card">
                  <h3>Recent Payouts</h3>
                  <div className="history-list">
                    <div className="history-item">
                      <div className="h-info">
                        <Check size={14} className="text-green" />
                        <span>Withdrawal to PayPal</span>
                        <span className="h-date">22 Apr 2026</span>
                      </div>
                      <span className="h-amount">-$450.00</span>
                    </div>
                    <div className="history-item">
                      <div className="h-info">
                        <Check size={14} className="text-green" />
                        <span>Withdrawal to Bank</span>
                        <span className="h-date">10 Apr 2026</span>
                      </div>
                      <span className="h-amount">-$320.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="activity-modal card animate-modal-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-with-icon">
                <Clock size={24} className="text-cyan" />
                <h2>Full Activity History</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setShowActivityModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body scroll-area">
              <div className="activity-list">
                {[...stats.recentActivity, ...stats.recentActivity, ...stats.recentActivity].map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="activity-item">
                    <div className="activity-user-av">{item.user[0].toUpperCase()}</div>
                    <div className="activity-content">
                      <p><strong>@{item.user}</strong> purchased <span>{item.prompt}</span></p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                    <div className="activity-price text-green">+${item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
