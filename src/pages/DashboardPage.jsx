/* DashboardPage — User control center */
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Zap, Crown, Settings, Trash2, Copy, Check,
  DollarSign, TrendingUp, BarChart3, Wallet, Plus,
  Eye, ShoppingCart, Clock, Activity, ArrowUpRight,
  Filter, MoreVertical, Edit3, ChevronRight, Layout,
  ArrowLeft, X, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state, isPremium } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('seller_dashboard_tab') || 'overview');

  useEffect(() => {
    localStorage.setItem('seller_dashboard_tab', activeTab);
  }, [activeTab]);
  const [copied, setCopied] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPayoutSettings, setShowPayoutSettings] = useState(false);
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsFilter, setAnalyticsFilter] = useState('daily');
  const [payoutTab, setPayoutTab] = useState('UPI');
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
    recentActivity: [],
    recentPayouts: []
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

  const handleWithdraw = async (amount, method, details) => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const API_BASE = import.meta.env.VITE_API_URL || 
        (window.location.hostname.includes('oopsverse.cloud') 
          ? 'https://oopsverse.cloud/api' 
          : 'http://localhost:8844/api');
          
      const res = await fetch(`${API_BASE}/seller/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, method, details })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Withdrawal request submitted! It will be processed within 2-3 business days.');
        setShowPayoutHistory(false);
        // Refresh stats to show the new pending payout
        window.location.reload();
      } else {
        alert(data.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
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

  const getChartData = () => {
    if (stats[analyticsFilter]) {
      const { labels, values } = stats[analyticsFilter];
      return labels.map((l, i) => ({ 
        label: l, 
        value: values[i],
        percentage: Math.max(10, (values[i] / Math.max(...values, 1)) * 100) 
      }));
    }
    return [];
  };

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
                  <div className="stat-icon-circle green-bg"><Zap size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Earnings</span>
                    <h2 className="stat-value">{stats.totalEarnings} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tokens</span></h2>
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
                        {(stats.performancePercentages || [10, 15, 25, 20, 35, 30, 45]).map((h, i) => (
                          <div key={i} className="bar-wrapper" title={`${stats.performanceViews?.[i] || 0} Views`}>
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
                <div className="filter-actions-premium">
                  <div className="dash-search-box">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search prompts..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="dash-filter-select">
                    <Filter size={16} />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
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
                    {stats.prompts
                      .filter(p => {
                        const matchesStatus = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus.toLowerCase();
                        const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesStatus && matchesSearch;
                      }).length > 0 ? (
                      stats.prompts
                        .filter(p => {
                          const matchesStatus = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus.toLowerCase();
                          const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesStatus && matchesSearch;
                        })
                        .map(p => (
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
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '60px 0' }}>
                          <div className="empty-prompts-state">
                            <Layout size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--text-muted)' }}>No prompts found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
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
                  <button className={`btn-pill ${analyticsFilter === 'daily' ? 'active' : ''}`} onClick={() => setAnalyticsFilter('daily')}>Daily</button>
                  <button className={`btn-pill ${analyticsFilter === 'weekly' ? 'active' : ''}`} onClick={() => setAnalyticsFilter('weekly')}>Weekly</button>
                  <button className={`btn-pill ${analyticsFilter === 'monthly' ? 'active' : ''}`} onClick={() => setAnalyticsFilter('monthly')}>Monthly</button>
                </div>
              </div>
              <div className="analytics-grid">
                <div className="card analytics-main-chart">
                  <h3>
                    {analyticsFilter === 'daily' ? 'Revenue Growth (Tokens)' : analyticsFilter === 'weekly' ? 'Weekly Token Earnings' : 'Monthly Performance (Tokens)'}
                  </h3>
                  <div className="chart-area-premium">
                    {getChartData().some(item => item.value > 0) ? (
                      getChartData().map((item, i) => (
                        <div key={i} className="chart-bar-container">
                          <div 
                            className="chart-bar" 
                            style={{ height: `${item.percentage}%`, transitionDelay: `${i * 0.05}s` }}
                            data-value={`${item.value} Tokens`}
                          ></div>
                          <span className="chart-label">{item.label}</span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-chart-state" style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '12px',
                        textAlign: 'center',
                        padding: '20px'
                      }}>
                        <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '8px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', margin: 0 }}>No sales yet</p>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', opacity: 0.6, maxWidth: '280px' }}>Your token revenue data will appear here once your prompts are purchased.</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card best-sellers-card">
                  <h3>Best Selling Prompts</h3>
                  <div className="mini-list">
                    {stats.prompts.length > 0 ? (
                      [...stats.prompts]
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map(p => (
                        <Link 
                          key={p._id} 
                          to={`/prompt/${p._id}`} 
                          className="mini-list-item"
                          style={{ textDecoration: 'none', transition: 'transform 0.2s ease, background 0.2s ease', cursor: 'pointer' }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateX(5px)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.thumbnail || (p.samples?.[0]?.output || p.samples?.[0])} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</span>
                          </div>
                          <span className="text-cyan font-bold">{p.sales || 0} Sold</span>
                        </Link>
                      ))
                    ) : (
                      <div className="empty-mini-list" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No prompts yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="dash-wallet animate-fade-in">
              <div className="wallet-grid">
                <div className="card wallet-main-card-premium">
                  <div className="wallet-card-overlay"></div>
                  <div className="wallet-header-top">
                    <div className="wallet-icon-box">
                      <Wallet size={24} />
                    </div>
                    <span>Niti Secure Wallet</span>
                  </div>
                  <div className="balance-display">
                    <span className="balance-label">Current Earnings</span>
                    <h2 className="balance-value">
                      <Zap size={48} className="text-orange" fill="var(--color-orange)" style={{ marginRight: '15px' }} />
                      {stats.totalEarnings || 0}
                      <span className="balance-unit">Tokens</span>
                    </h2>
                    <p className="balance-approx">
                      {(stats.totalEarnings || 0) >= 70 ? '≈ $29.00 USD (70 tokens)' :
                       (stats.totalEarnings || 0) >= 20 ? '≈ $10.00 USD (20 tokens)' :
                       'Min. 20 tokens to withdraw'}
                    </p>
                  </div>
                  <div className="wallet-actions">
                    <button className="btn-withdraw-premium w-full" onClick={() => setShowPayoutHistory(true)}>Withdraw Funds</button>
                    <button 
                      className="btn-text-only" 
                      onClick={() => setShowPayoutSettings(true)} 
                      style={{ 
                        marginTop: '10px', 
                        color: 'var(--color-cyan)', 
                        fontSize: '0.9rem', 
                        textAlign: 'center',
                        fontWeight: '600',
                        opacity: 0.8,
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                      + Add Payment Method
                    </button>
                  </div>
                </div>
                <div className="card payout-history-card">
                  <div className="payout-card-header">
                    <h3>Recent Payouts</h3>
                    <button className="btn-text-only" onClick={() => setShowPayoutHistory(true)} style={{ color: 'white', opacity: 1, fontWeight: '600' }}>View All</button>
                  </div>
                  <div className="history-list">
                    {stats.recentPayouts && stats.recentPayouts.length > 0 ? (
                      stats.recentPayouts.map((p, i) => (
                        <div key={p._id || i} className="history-item-premium">
                          <div className="h-left">
                            <div className={`h-icon-circle ${p.status}`}>
                              <ArrowUpRight size={16} />
                            </div>
                            <div className="h-details">
                              <span className="h-method">Withdrawal to {p.method}</span>
                              <span className="h-date">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="h-right">
                            <span className="h-amount-negative">-${p.amount === 70 ? '29.00' : p.amount === 20 ? '10.00' : (p.amount * 0.5).toFixed(2)}</span>
                            <span className="h-status-badge" style={{ 
                              background: p.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                              color: p.status === 'completed' ? 'var(--color-green)' : 'var(--color-orange)'
                            }}>{p.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        minHeight: '200px',
                        width: '100%',
                        opacity: 0.5,
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem'
                      }}>
                        No payouts yet.
                      </div>
                    )}
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
                {[...stats.recentActivity].length > 0 ? (
                   [...stats.recentActivity, ...stats.recentActivity].map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="activity-item">
                      <div className="activity-user-av">{item.user[0].toUpperCase()}</div>
                      <div className="activity-content">
                        <p><strong>@{item.user}</strong> purchased <span>{item.prompt}</span></p>
                        <span className="activity-time">{item.time}</span>
                      </div>
                      <div className="activity-price text-green">+${item.price}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    No activity recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Settings Modal (Withdrawal Methods) */}
      {showPayoutSettings && (
        <div className="modal-overlay" onClick={() => setShowPayoutSettings(false)}>
          <div className="activity-modal card animate-modal-up payout-method-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-with-icon">
                <div className="card-icon-small">
                  <Layout size={20} />
                </div>
                <h2>Payout Method</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setShowPayoutSettings(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Tab Navigation */}
              <div className="payout-tabs-container">
                <div className="payout-tabs">
                  {['UPI', 'BANK', 'INTL'].map(tab => (
                    <button 
                      key={tab} 
                      className={`payout-tab ${payoutTab === tab ? 'active' : ''}`}
                      onClick={() => setPayoutTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="payout-form-content">
                {payoutTab === 'UPI' && (
                  <div className="animate-fade-in">
                    <div className="form-group-payout">
                      <label>UPI ID *</label>
                      <div className="input-with-icon">
                        <div className="input-icon-left"><Activity size={18} /></div>
                        <input type="text" placeholder="e.g. 9876543210@upi" />
                      </div>
                      <span className="input-hint">Supports: @upi, @okaxis, @ybl, @paytm, @sbi, @hdfcbank</span>
                    </div>
                    
                    <div className="form-group-payout">
                      <label>UPI QR CODE *</label>
                      <div className="qr-upload-area">
                        <ArrowUpRight size={24} />
                        <span>Upload QR Image</span>
                      </div>
                    </div>

                    <div className="form-group-payout">
                      <label>NOTE FOR ADMIN *</label>
                      <textarea placeholder="Any additional information..."></textarea>
                    </div>
                  </div>
                )}

                {payoutTab === 'BANK' && (
                  <div className="animate-fade-in">
                    <div className="form-grid-payout">
                      <div className="form-group-payout">
                        <label>BANK NAME</label>
                        <input type="text" placeholder="e.g. HDFC Bank" />
                      </div>
                      <div className="form-group-payout">
                        <label>ACCOUNT HOLDER NAME</label>
                        <input type="text" placeholder="Full name as per records" />
                      </div>
                      <div className="form-group-payout">
                        <label>ACCOUNT NUMBER</label>
                        <input type="text" placeholder="Bank account number" />
                      </div>
                      <div className="form-group-payout">
                        <label>IFSC CODE</label>
                        <input type="text" placeholder="e.g. SBIN0001234" />
                      </div>
                    </div>
                    <div className="form-group-payout" style={{ marginTop: '15px' }}>
                      <label>NOTE FOR ADMIN</label>
                      <textarea placeholder="Any additional information..."></textarea>
                    </div>
                  </div>
                )}

                {payoutTab === 'INTL' && (
                  <div className="animate-fade-in">
                    <div className="form-group-payout">
                      <label>PAYPAL EMAIL</label>
                      <input type="email" placeholder="your@paypal.com" />
                    </div>
                    <div className="form-group-payout">
                      <label>SWIFT/BIC CODE (FOR WIRE)</label>
                      <input type="text" placeholder="Optional" />
                    </div>
                    <div className="form-group-payout">
                      <label>NOTE FOR ADMIN</label>
                      <textarea placeholder="Any additional information..."></textarea>
                    </div>
                  </div>
                )}
              </div>

              <div className="payout-modal-footer">
                <button className="btn-payout-cancel" onClick={() => setShowPayoutSettings(false)}>Cancel</button>
                <button className="btn-payout-save" onClick={() => {
                  alert('Payout method saved successfully!');
                  setShowPayoutSettings(false);
                }}>
                  <Check size={20} />
                  <span>Save Method</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout History Modal */}
      {showPayoutHistory && (
        <div className="modal-overlay" onClick={() => setShowPayoutHistory(false)}>
          <div className="activity-modal card animate-modal-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-with-icon">
                <Activity size={24} className="text-cyan" />
                <h2>Payout History & Withdraw</h2>
              </div>
              <button className="btn-close-modal" onClick={() => setShowPayoutHistory(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ 
                background: 'rgba(0, 255, 255, 0.03)', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '30px',
                border: '1px solid rgba(0, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available for Withdrawal</span>
                <h3 style={{ fontSize: '1.8rem', marginTop: '5px' }}>
                  <Zap size={24} className="text-orange" fill="var(--color-orange)" style={{ marginRight: '8px' }} />
                  {stats.totalEarnings || 0} Tokens
                </h3>
              </div>

              <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Choose Withdrawal Option</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {/* Option 1: 20 tokens → $10 */}
                <div 
                  className="withdraw-option-card" 
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px', borderRadius: '16px',
                    background: (stats.totalEarnings || 0) >= 20 ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${(stats.totalEarnings || 0) >= 20 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    opacity: (stats.totalEarnings || 0) >= 20 ? 1 : 0.4,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      <Zap size={18} className="text-orange" fill="var(--color-orange)" style={{ marginRight: '6px' }} />
                      20 Tokens → $10.00
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard withdrawal</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={(stats.totalEarnings || 0) < 20}
                    onClick={() => handleWithdraw(20, 'PayPal', 'Withdraw 20 tokens for $10')}
                    style={{ minWidth: '120px' }}
                  >
                    Withdraw
                  </button>
                </div>

                {/* Option 2: 70 tokens → $29 */}
                <div 
                  className="withdraw-option-card" 
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px', borderRadius: '16px',
                    background: (stats.totalEarnings || 0) >= 70 ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${(stats.totalEarnings || 0) >= 70 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    opacity: (stats.totalEarnings || 0) >= 70 ? 1 : 0.4,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      <Zap size={18} className="text-purple" fill="var(--color-purple)" style={{ marginRight: '6px' }} />
                      70 Tokens → $29.00
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Premium withdrawal</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={(stats.totalEarnings || 0) < 70}
                    onClick={() => handleWithdraw(70, 'PayPal', 'Withdraw 70 tokens for $29')}
                    style={{ minWidth: '120px' }}
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Transaction Logs</h3>
              <div className="history-list scroll-area" style={{ maxHeight: '400px' }}>
                {stats.recentPayouts && stats.recentPayouts.length > 0 ? (
                  stats.recentPayouts.map((p, i) => (
                    <div key={p._id || i} className="history-item-premium">
                      <div className="h-left">
                        <div className={`h-icon-circle ${p.status}`}>
                          <ArrowUpRight size={16} />
                        </div>
                        <div className="h-details">
                          <span className="h-method">Withdrawal to {p.method}</span>
                          <span className="h-date">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="h-right">
                        <span className="h-amount-negative">-${p.amount === 70 ? '29.00' : p.amount === 20 ? '10.00' : (p.amount * 0.5).toFixed(2)}</span>
                        <span className="h-status-badge" style={{ 
                          background: p.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: p.status === 'completed' ? 'var(--color-green)' : 'var(--color-orange)'
                        }}>{p.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    No payout history found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
