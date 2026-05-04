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
import PromptThumbnail from '../components/PromptThumbnail';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state, isPremium } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [copied, setCopied] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPayoutSettings, setShowPayoutSettings] = useState(false);
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);
  const [rejectionModalData, setRejectionModalData] = useState(null); // { id, reason, amount, method }
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutTab, setPayoutTab] = useState('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [payoutFormFilled, setPayoutFormFilled] = useState(false);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(null);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [payoutData, setPayoutData] = useState({
    upiId: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    paypalEmail: '',
    swiftCode: '',
    note: ''
  });
  // Wallet balance is exactly what's shown in the navbar
  const walletTokens = state.user?.credits || 0;
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const fetchPaymentMethod = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';
      const res = await fetch(`${API_BASE}/seller/payment-method`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.paymentMethod && data.paymentMethod.method) {
        setSavedPaymentMethod(data.paymentMethod);
        setPayoutTab(data.paymentMethod.method);
        setPayoutFormFilled(true);
        setPayoutData({
          upiId: data.paymentMethod.upiId || '',
          bankName: data.paymentMethod.bankName || '',
          accountHolder: data.paymentMethod.accountHolder || '',
          accountNumber: data.paymentMethod.accountNumber || '',
          ifscCode: data.paymentMethod.ifscCode || '',
          paypalEmail: data.paymentMethod.paypalEmail || '',
          swiftCode: data.paymentMethod.swiftCode || '',
          note: data.paymentMethod.note || ''
        });
        setIsEditingPayout(false);
      } else {
        setSavedPaymentMethod(null);
        setIsEditingPayout(true);
      }
    } catch {
      setSavedPaymentMethod(null);
      setIsEditingPayout(true);
    }
  };
  const [loading, setLoading] = useState(true);
  const [rejectionReasonModal, setRejectionReasonModal] = useState({ show: false, reason: "" });
  const [stats, setStats] = useState({
    totalEarnings: 0,
    walletBalance: 0,
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
          : 'http://localhost:8845/api');

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
        showToast(data.message || 'Failed to delete prompt', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleWithdraw = async (amount, method, details) => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const API_BASE = import.meta.env.VITE_API_URL ||
        (window.location.hostname.includes('oopsverse.cloud')
          ? 'https://oopsverse.cloud/api'
          : 'http://localhost:8845/api');

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
        showToast('✅ Withdrawal request submitted! It will be processed within 2-3 business days.', 'success');
        setShowPayoutHistory(false);
        // Refresh stats to show the new pending payout
        window.location.reload();
      } else {
        showToast(data.message || 'Failed to submit withdrawal request', 'error');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      showToast('Network error. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('promptbyniti_token');
        const API_BASE = import.meta.env.VITE_API_URL ||
          (window.location.hostname.includes('oopsverse.cloud')
            ? 'https://oopsverse.cloud/api'
            : 'http://localhost:8845/api');

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
    fetchPaymentMethod();
  }, []);


  if (loading) {
    return (
      <div className="dash-loading-v2">
        <div className="premium-loader"></div>
        <p>Connecting to Prompt by Niti...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page" id="seller-dashboard">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 99999,
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(6, 182, 212, 0.95))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
          color: '#fff', padding: '16px 24px', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontFamily: "'Chewy', cursive", fontSize: '0.95rem', letterSpacing: '0.3px',
          animation: 'slideInToast 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          maxWidth: '420px', cursor: 'pointer'
        }} onClick={() => setToast(null)}>
          <span style={{ fontSize: '1.3rem' }}>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}
      <style>{`
        @keyframes slideInToast {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="container">
        {/* Dashboard Header */}
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
              <h1>{state.user?.name || 'Creator'}</h1>
              <p className="dash-user-email">{state.user?.email}</p>
              {state.user?.bio && state.user.bio.trim() !== '' && (
                <p className="dash-user-bio" title={state.user.bio}>
                  {state.user.bio}
                </p>
              )}
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
          <button className={`dash-nav-link ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
            <Wallet size={18} /> Wallet
          </button>
        </nav>

        {/* Content Area */}
        <main className="dash-main">
          {activeTab === 'overview' && (
            <div className="dash-overview animate-fade-in">
              {/* Stats Grid */}
              <div className="stats-grid-premium" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div className="stat-card-new theme-green">
                  <div className="stat-icon-circle green-bg"><Zap size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Earnings</span>
                    <h2 className="stat-value">{Math.floor(walletTokens)} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tokens</span></h2>
                  </div>
                </div>
                <div className="stat-card-new theme-cyan">
                  <div className="stat-icon-circle cyan-bg"><ShoppingCart size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Sales</span>
                    <h2 className="stat-value">{stats.totalSales}</h2>
                  </div>
                </div>
                <div className="stat-card-new theme-orange">
                  <div className="stat-icon-circle orange-bg"><Layout size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">My Prompts</span>
                    <h2 className="stat-value">{stats.activePrompts}</h2>
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
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map(item => (
                        <div key={item.id} className="activity-item" style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="activity-user-av" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '18px' }}>
                            {item.type === 'sale' ? (item.user ? item.user[0].toUpperCase() : '👤') : item.type === 'withdrawal' ? '💰' : item.type === 'approved' ? '✅' : item.type === 'rejected' ? '❌' : '📤'}
                          </div>
                          <div className="activity-content" style={{ flex: 1 }}>
                            {item.type === 'sale' ? (
                              <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>@{item.user}</strong> purchased <span style={{ color: 'var(--color-cyan)' }}>{item.prompt}</span></p>
                            ) : item.type === 'withdrawal' ? (
                              <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Withdrawal</strong> request for <span style={{ color: 'var(--color-orange)' }}>{item.price} Tokens</span> ({item.status})</p>
                            ) : item.type === 'submitted' ? (
                              <p style={{ margin: 0, fontSize: '0.95rem' }}>You submitted <span style={{ color: 'var(--color-cyan)' }}>{item.prompt}</span> for review</p>
                            ) : item.type === 'approved' ? (
                              <p style={{ margin: 0, fontSize: '0.95rem' }}>System <strong>approved</strong> your prompt <span style={{ color: 'var(--color-cyan)' }}>{item.prompt}</span></p>
                            ) : item.type === 'rejected' ? (
                              <p style={{ margin: 0, fontSize: '0.95rem' }}>System <strong>rejected</strong> your prompt <span style={{ color: 'var(--color-cyan)' }}>{item.prompt}</span></p>
                            ) : null}
                            <span className="activity-time" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</span>
                          </div>
                          <div className={`activity-price ${item.type === 'sale' ? 'text-green' : item.type === 'withdrawal' ? 'text-orange' : item.type === 'rejected' ? 'text-red' : item.type === 'approved' ? 'text-green' : ''}`} style={{ fontWeight: 'bold' }}>
                            {item.type === 'sale' ? `+${item.price} Tokens` : item.type === 'withdrawal' ? `-${item.price} Tokens` : item.type.toUpperCase()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-activity">
                        <Clock size={32} />
                        <p>No activity yet</p>
                        <span>Your recent sales will appear here</span>
                      </div>
                    )}
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
                                <PromptThumbnail
                                  src={p.thumbnail || p.video || (p.samples && p.samples.length > 0 ? (p.samples[0].output || p.samples[0]) : null)}
                                  alt={p.name}
                                  type={p.generateType}
                                  samples={p.samples}
                                  style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                  <span className="prompt-title-small" style={{ fontWeight: 'bold' }}>{p.name}</span>
                                  <span className="prompt-date-small" style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Added: {new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span 
                                className={`status-pill status-${p.status}`} 
                                style={{ cursor: p.status === 'rejected' ? 'pointer' : 'default' }}
                                onClick={() => {
                                  if (p.status === 'rejected') {
                                    setRejectionReasonModal({ show: true, reason: p.rejectionReason || "No specific reason provided." });
                                  }
                                }}
                                title={p.status === 'rejected' ? "Click to see rejection reason" : ""}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td><div className="table-stat-box"><Eye size={14} /> {p.views || 0}</div></td>
                            <td><div className="table-stat-box"><ShoppingCart size={14} /> {p.sales || 0}</div></td>
                            <td>
                              <span className="table-price-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
                                <Zap size={14} fill="currentColor" /> {Math.floor(p.priceTokens || p.tokens || 5)} Tokens
                              </span>
                            </td>
                            <td>
                              <div className="table-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                                <Link to={`/prompt/${p._id}`} title="View Prompt" style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center' }}><Eye size={18} /></Link>
                                
                                {p.sales > 0 ? (
                                  <>
                                    <div title="Locked: Sold prompts cannot be edited" style={{ opacity: 0.3, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
                                      <Edit3 size={18} color="white" />
                                    </div>
                                    <div title="Locked: Sold prompts cannot be deleted" style={{ opacity: 0.3, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
                                      <Trash2 size={18} color="#ff4d4d" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => navigate(`/sell?edit=${p._id}`)} title="Edit Prompt" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(p._id)} title="Delete Prompt" style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}><Trash2 size={18} /></button>
                                  </>
                                )}
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
                    <span className="balance-label">Available Balance</span>
                    <h2 className="balance-value">
                      <Zap size={48} className="text-orange" fill="var(--color-orange)" style={{ marginRight: '15px' }} />
                      {Math.floor(walletTokens)}
                      <span className="balance-unit">Tokens</span>
                    </h2>
                    <p className="balance-approx">
                      {walletTokens >= 70 ? '≈ $29.00 USD (70 tokens)' :
                        walletTokens >= 20 ? '≈ $10.00 USD (20 tokens)' :
                          'Min. 20 tokens to withdraw'}
                    </p>
                  </div>
                  <div className="wallet-actions">
                    <button className="btn-withdraw-premium w-full" onClick={() => setShowPayoutHistory(true)}>Withdraw Funds</button>
                    <button
                      className="btn-text-only"
                      onClick={() => { fetchPaymentMethod(); setIsEditingPayout(false); setShowPayoutSettings(true); }}
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
                  <div className="history-list scroll-area" style={{ maxHeight: '335px', overflowY: 'auto' }}>
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
                            <span 
                              className="h-status-badge" 
                              onClick={() => p.status === 'rejected' && p.rejectionReason && setRejectionModalData({ id: p._id, reason: p.rejectionReason, amount: p.amount, method: p.method })}
                              style={{
                                background: p.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                color: p.status === 'completed' ? 'var(--color-green)' : p.status === 'rejected' ? '#ef4444' : 'var(--color-orange)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: p.status === 'rejected' && p.rejectionReason ? 'pointer' : 'default',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseOver={(e) => p.status === 'rejected' && (e.currentTarget.style.transform = 'scale(1.05)')}
                              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              {p.status}
                              {p.status === 'rejected' && p.rejectionReason && (
                                <span 
                                  style={{ 
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '16px', height: '16px', background: '#ef4444', color: 'white',
                                    borderRadius: '50%', fontSize: '10px', fontWeight: 'bold'
                                  }}
                                >
                                  !
                                </span>
                              )}
                            </span>
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

      {showPayoutSettings && (
        <div className="modal-overlay" onClick={() => { setShowPayoutSettings(false); setWithdrawAmount(0); }}>
          <div className="activity-modal card animate-modal-up payout-method-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-with-icon">
                <div className="card-icon-small">
                  <Layout size={20} />
                </div>
                <h2>{withdrawAmount > 0 ? `Withdraw ${withdrawAmount} Tokens` : 'Payout Method'}</h2>
              </div>
              <button className="btn-close-modal" onClick={() => { setShowPayoutSettings(false); setWithdrawAmount(0); }}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Withdrawal info banner */}
              {withdrawAmount > 0 && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Withdrawal Amount</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-green, #22c55e)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                    <Zap size={16} fill="var(--color-orange)" className="text-orange" style={{ marginRight: '4px' }} />
                    {withdrawAmount} Tokens → ${withdrawAmount === 70 ? '29.00' : '10.00'}
                  </span>
                </div>
              )}

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {withdrawAmount > 0 ? 'Confirm your payment details below, then click Next to submit.' : 'Manage your payout method.'}
              </p>

              {/* SAVED DATA VIEW — show when saved & not editing */}
              {savedPaymentMethod && !isEditingPayout ? (
                <div className="animate-fade-in">
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '16px', padding: '24px', position: 'relative'
                  }}>
                    {/* Checkmark badge */}
                    <div style={{
                      position: 'absolute', top: '-12px', right: '16px',
                      background: 'linear-gradient(135deg, #10b981, #06b6d4)', borderRadius: '20px',
                      padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}>
                      <Check size={14} /> Verified
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                      <span style={{
                        background: 'rgba(6, 182, 212, 0.15)', padding: '8px 16px', borderRadius: '8px',
                        fontWeight: 'bold', color: 'var(--color-cyan)', fontSize: '0.9rem'
                      }}>{savedPaymentMethod.method}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Payment Method</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {savedPaymentMethod.method === 'UPI' && savedPaymentMethod.upiId && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>UPI ID</span>
                          <span style={{ fontWeight: 'bold', color: '#fff' }}>
                            {savedPaymentMethod.upiId.split('@')[0].slice(0, 3)}xxxxxx@{savedPaymentMethod.upiId.split('@')[1] || 'upi'}
                          </span>
                        </div>
                      )}
                      {savedPaymentMethod.method === 'BANK' && (
                        <>
                          {savedPaymentMethod.bankName && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bank</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{savedPaymentMethod.bankName}</span></div>}
                          {savedPaymentMethod.accountHolder && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{savedPaymentMethod.accountHolder}</span></div>}
                          {savedPaymentMethod.accountNumber && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Account</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{'x'.repeat(savedPaymentMethod.accountNumber.length - 4)}{savedPaymentMethod.accountNumber.slice(-4)}</span></div>}
                          {savedPaymentMethod.ifscCode && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>IFSC</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{savedPaymentMethod.ifscCode.slice(0, 4)}xxxxxx</span></div>}
                        </>
                      )}
                      {savedPaymentMethod.method === 'INTL' && (
                        <>
                          {savedPaymentMethod.paypalEmail && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PayPal</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{savedPaymentMethod.paypalEmail.split('@')[0].slice(0, 3)}xxxxxx@{savedPaymentMethod.paypalEmail.split('@')[1] || 'paypal.com'}</span></div>}
                          {savedPaymentMethod.swiftCode && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>SWIFT</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{savedPaymentMethod.swiftCode.slice(0, 2)}xxxxxx</span></div>}
                        </>
                      )}
                      {savedPaymentMethod.note && (
                        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Note: </span>
                          <span style={{ color: '#fff', fontStyle: 'italic' }}>{savedPaymentMethod.note}</span>
                        </div>
                      )}
                    </div>

                    <button onClick={() => {
                      setIsEditingPayout(true);
                      setPayoutFormFilled(true);
                    }} style={{
                      marginTop: '18px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: 'var(--color-cyan)', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                      fontFamily: "'Chewy', cursive", fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s ease', width: '100%', justifyContent: 'center'
                    }}>
                      <Edit3 size={16} /> Change Payment Method
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <>
                  <div className="payout-tabs-container">
                    <div className="payout-tabs">
                      {['UPI', 'BANK', 'INTL'].map(tab => (
                        <button
                          key={tab}
                          className={`payout-tab ${payoutTab === tab ? 'active' : ''}`}
                          onClick={() => { setPayoutTab(tab); }}
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
                            <input
                              type="text"
                              placeholder="e.g. 9876543210@upi"
                              value={payoutData.upiId}
                              onChange={(e) => {
                                setPayoutData({ ...payoutData, upiId: e.target.value });
                                setPayoutFormFilled(e.target.value.trim().length > 0);
                              }}
                            />
                          </div>
                          <span className="input-hint">Supports: @upi, @okaxis, @ybl, @paytm, @sbi, @hdfcbank</span>
                        </div>
                        <div className="form-group-payout">
                          <label>UPI QR CODE</label>
                          <div className="qr-upload-area">
                            <ArrowUpRight size={24} />
                            <span>Upload QR Image</span>
                          </div>
                        </div>
                        <div className="form-group-payout">
                          <label>NOTE FOR ADMIN</label>
                          <textarea
                            placeholder="Any additional information..."
                            value={payoutData.note}
                            onChange={(e) => setPayoutData({ ...payoutData, note: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {payoutTab === 'BANK' && (
                      <div className="animate-fade-in">
                        <div className="form-grid-payout">
                          <div className="form-group-payout">
                            <label>BANK NAME</label>
                            <input
                              type="text"
                              placeholder="e.g. HDFC Bank"
                              value={payoutData.bankName}
                              onChange={(e) => setPayoutData({ ...payoutData, bankName: e.target.value })}
                            />
                          </div>
                          <div className="form-group-payout">
                            <label>ACCOUNT HOLDER NAME</label>
                            <input
                              type="text"
                              placeholder="Full name"
                              value={payoutData.accountHolder}
                              onChange={(e) => setPayoutData({ ...payoutData, accountHolder: e.target.value })}
                            />
                          </div>
                          <div className="form-group-payout">
                            <label>ACCOUNT NUMBER</label>
                            <input
                              type="text"
                              placeholder="Number"
                              value={payoutData.accountNumber}
                              onChange={(e) => {
                                setPayoutData({ ...payoutData, accountNumber: e.target.value });
                                setPayoutFormFilled(e.target.value.trim().length > 0);
                              }}
                            />
                          </div>
                          <div className="form-group-payout">
                            <label>IFSC CODE</label>
                            <input
                              type="text"
                              placeholder="e.g. SBIN0001234"
                              value={payoutData.ifscCode}
                              onChange={(e) => setPayoutData({ ...payoutData, ifscCode: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group-payout" style={{ marginTop: '15px' }}>
                          <label>NOTE FOR ADMIN</label>
                          <textarea
                            placeholder="Any additional information..."
                            value={payoutData.note}
                            onChange={(e) => setPayoutData({ ...payoutData, note: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {payoutTab === 'INTL' && (
                      <div className="animate-fade-in">
                        <div className="form-group-payout">
                          <label>PAYPAL EMAIL</label>
                          <input
                            type="email"
                            placeholder="your@paypal.com"
                            value={payoutData.paypalEmail}
                            onChange={(e) => {
                              setPayoutData({ ...payoutData, paypalEmail: e.target.value });
                              setPayoutFormFilled(e.target.value.trim().length > 0);
                            }}
                          />
                        </div>
                        <div className="form-group-payout">
                          <label>SWIFT/BIC CODE (FOR WIRE)</label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={payoutData.swiftCode}
                            onChange={(e) => setPayoutData({ ...payoutData, swiftCode: e.target.value })}
                          />
                        </div>
                        <div className="form-group-payout">
                          <label>NOTE FOR ADMIN</label>
                          <textarea
                            placeholder="Any additional information..."
                            value={payoutData.note}
                            onChange={(e) => setPayoutData({ ...payoutData, note: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="payout-modal-footer">
                <button className="btn-payout-cancel" onClick={() => { setShowPayoutSettings(false); setWithdrawAmount(0); }}>Cancel</button>

                {withdrawAmount === 0 && (
                  <button className="btn-payout-save" style={{ opacity: payoutFormFilled ? 1 : 0.4, pointerEvents: payoutFormFilled ? 'auto' : 'none' }} onClick={async () => {
                    try {
                      const token = localStorage.getItem('promptbyniti_token');
                      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';
                      const res = await fetch(`${API_BASE}/seller/payment-method`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ ...payoutData, type: payoutTab })
                      });
                      const data = await res.json();
                      if (data.success) {
                        showToast('✅ Payment method saved successfully!', 'success');
                        fetchPaymentMethod();
                        setShowPayoutSettings(false);
                      } else {
                        showToast(data.message || 'Failed to save payment method', 'error');
                      }
                    } catch (err) {
                      console.error('Save payment method error:', err);
                      showToast('Network error. Please try again.', 'error');
                    }
                  }}>
                    <Check size={20} />
                    <span>Save Method</span>
                  </button>
                )}

                {withdrawAmount > 0 && (payoutFormFilled || (savedPaymentMethod && !isEditingPayout)) && (
                  <button className="btn-payout-save" style={{ background: 'var(--color-green, #22c55e)', gap: '8px' }} onClick={async () => {
                    try {
                      const token = localStorage.getItem('promptbyniti_token');
                      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';
                      if (isEditingPayout) {
                        await fetch(`${API_BASE}/seller/payment-method`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ ...payoutData, type: payoutTab })
                        });
                      }
                      const currentType = isEditingPayout ? payoutTab : savedPaymentMethod.method;
                      const methodName = currentType === 'UPI' ? 'UPI' : currentType === 'BANK' ? 'Bank Transfer' : 'PayPal';
                      const detailStr = `Withdraw ${withdrawAmount} tokens for $${withdrawAmount === 70 ? '29' : '10'} via ${methodName}`;
                      await handleWithdraw(withdrawAmount, methodName, detailStr);
                      setWithdrawAmount(0);
                      setPayoutFormFilled(false);
                      setShowPayoutSettings(false);
                      setIsEditingPayout(false);
                      fetchPaymentMethod();
                    } catch (err) {
                      console.error('Withdrawal flow error:', err);
                      showToast('Network error. Please try again.', 'error');
                    }
                  }}>
                    <span>Next — Submit Withdrawal</span>
                    <ChevronRight size={20} />
                  </button>
                )}
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
                  {walletTokens} Tokens
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
                    background: walletTokens >= 20 ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${walletTokens >= 20 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    opacity: walletTokens >= 20 ? 1 : 0.4,
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
                    disabled={walletTokens < 20}
                    onClick={() => { setWithdrawAmount(20); setShowPayoutHistory(false); fetchPaymentMethod(); setIsEditingPayout(false); setShowPayoutSettings(true); }}
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
                    background: walletTokens >= 70 ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${walletTokens >= 70 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    opacity: walletTokens >= 70 ? 1 : 0.4,
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
                    disabled={walletTokens < 70}
                    onClick={() => { setWithdrawAmount(70); setShowPayoutHistory(false); fetchPaymentMethod(); setIsEditingPayout(false); setShowPayoutSettings(true); }}
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
                          {p.status === 'rejected' && p.rejectionReason && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', fontStyle: 'italic' }}>
                              Reason: {p.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-right">
                        <span className="h-amount-negative">-${p.amount === 70 ? '29.00' : p.amount === 20 ? '10.00' : (p.amount * 0.5).toFixed(2)}</span>
                        <span 
                          className="h-status-badge" 
                          onClick={() => p.status === 'rejected' && p.rejectionReason && setRejectionModalData({ id: p._id, reason: p.rejectionReason, amount: p.amount, method: p.method })}
                          style={{
                            background: p.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: p.status === 'completed' ? 'var(--color-green)' : p.status === 'rejected' ? '#ef4444' : 'var(--color-orange)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: p.status === 'rejected' && p.rejectionReason ? 'pointer' : 'default',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseOver={(e) => p.status === 'rejected' && (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          {p.status}
                          {p.status === 'rejected' && p.rejectionReason && (
                            <span 
                              style={{ 
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '16px', height: '16px', background: '#ef4444', color: 'white',
                                borderRadius: '50%', fontSize: '10px', fontWeight: 'bold'
                              }}
                            >
                              !
                            </span>
                          )}
                        </span>
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
      {/* Central Rejection Reason Modal */}
      {rejectionModalData && (
        <div className="modal-overlay-premium" style={{ zIndex: 100000 }}>
          <div className="modal-card-premium" style={{ maxWidth: '400px', padding: '30px' }}>
            <button className="modal-close-premium" onClick={() => setRejectionModalData(null)}>
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#ef4444'
              }}>
                <Zap size={30} fill="#ef4444" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '10px', color: '#ef4444' }}>Payout Rejected</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Your withdrawal of <strong>{rejectionModalData.amount} Tokens</strong> via <strong>{rejectionModalData.method}</strong> was declined.
              </p>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '15px', borderRadius: '12px', textAlign: 'left'
              }}>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Admin Message:</strong>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'white' }}>{rejectionModalData.reason}</p>
              </div>

              <button 
                className="btn btn-primary w-full" 
                style={{ marginTop: '25px', background: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => setRejectionModalData(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Rejection Reason Modal */}
      {rejectionReasonModal.show && (
        <div className="admin-modal-overlay" style={{ zIndex: 10000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal" style={{ maxWidth: '450px', background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Prompt Rejected</h2>
              <button onClick={() => setRejectionReasonModal({ show: false, reason: "" })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '24px', lineHeight: '1' }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Your prompt was rejected for the following reason:</p>
              <div 
                style={{ 
                  width: '100%', minHeight: '100px', padding: '15px', borderRadius: '8px',
                  background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)',
                  color: '#ffdddd', fontFamily: 'inherit', marginBottom: '20px', lineHeight: '1.5'
                }}
              >
                {rejectionReasonModal.reason}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary w-full" 
                  onClick={() => setRejectionReasonModal({ show: false, reason: "" })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
