/* DashboardPage — User control center */
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  User, Zap, Crown, Settings, Trash2, Copy, Check,
  DollarSign, TrendingUp, BarChart3, Wallet, Plus,
  Eye, ShoppingCart, Clock, Activity, ArrowUpRight,
  Filter, MoreVertical, Edit3, ChevronRight, Layout,
  ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state, isPremium } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(null);

  // Mock data for the seller experience
  const sellerStats = {
    totalEarnings: 1240.50,
    totalSales: 482,
    activePrompts: 12,
    conversionRate: '14.2%',
    recentActivity: [
      { id: 1, user: 'alex_flow', prompt: 'Vintage Cinematic Portraits', price: 15, time: '2 mins ago' },
      { id: 2, user: 'pixel_master', prompt: 'Cyberpunk Architecture', price: 12, time: '15 mins ago' },
      { id: 3, user: 'creative_ink', prompt: 'Minimalist Logo Generator', price: 20, time: '1 hour ago' },
      { id: 4, user: 'design_god', prompt: 'Ultra-Real Skin Texture', price: 25, time: '3 hours ago' },
    ]
  };

  const myPrompts = [
    { id: 101, title: 'Vintage Cinematic Portraits', status: 'approved', views: 1240, sales: 82, price: 15, date: '12 Apr 2026' },
    { id: 102, title: 'Cyberpunk Architecture Master', status: 'approved', views: 890, sales: 45, price: 12, date: '10 Apr 2026' },
    { id: 103, title: 'Surrealist Dreams Engine', status: 'pending', views: 0, sales: 0, price: 18, date: 'Today' },
    { id: 104, title: 'Ancient Ruins Explorer', status: 'rejected', views: 0, sales: 0, price: 10, date: 'Yesterday' },
  ];

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
                    <h2 className="stat-value">${sellerStats.totalEarnings.toLocaleString()}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +12.5%</span>
                  </div>
                </div>
                <div className="stat-card-new theme-cyan">
                  <div className="stat-icon-circle cyan-bg"><ShoppingCart size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Total Sales</span>
                    <h2 className="stat-value">{sellerStats.totalSales}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +8.2%</span>
                  </div>
                </div>
                <div className="stat-card-new theme-orange">
                  <div className="stat-icon-circle orange-bg"><Layout size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Active Prompts</span>
                    <h2 className="stat-value">{sellerStats.activePrompts}</h2>
                    <span className="stat-subtext">Standard Quality</span>
                  </div>
                </div>
                <div className="stat-card-new theme-purple">
                  <div className="stat-icon-circle purple-bg"><TrendingUp size={24} /></div>
                  <div className="stat-data">
                    <span className="stat-label">Conv. Rate</span>
                    <h2 className="stat-value">{sellerStats.conversionRate}</h2>
                    <span className="stat-trend trend-up"><ArrowUpRight size={14} /> +2.1%</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="overview-row mt-xl">
                <div className="activity-section card">
                  <div className="section-header-row">
                    <h3><Clock size={20} className="text-cyan" /> Recent Activity</h3>
                    <button className="btn-text">View All</button>
                  </div>
                  <div className="activity-list">
                    {sellerStats.recentActivity.map(item => (
                      <div key={item.id} className="activity-item">
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
                <div className="mini-chart-section card">
                  <h3><TrendingUp size={20} className="text-orange" /> Performance Hub</h3>
                  <div className="performance-placeholder">
                    <div className="fake-bar-chart">
                      {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                        <div key={i} className="bar-wrapper">
                          <div className="bar-fill" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted text-center mt-md">Weekly revenue growth is up by 15%</p>
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
                    {myPrompts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-prompt-info">
                            <span className="prompt-title-small">{p.title}</span>
                            <span className="prompt-date-small">Added: {p.date}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill status-${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td><div className="table-stat-box"><Eye size={14} /> {p.views}</div></td>
                        <td><div className="table-stat-box"><ShoppingCart size={14} /> {p.sales}</div></td>
                        <td><span className="table-price-tag">${p.price}</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon-sm" title="Edit"><Edit3 size={16} /></button>
                            <button className="btn-icon-sm text-danger" title="Delete"><Trash2 size={16} /></button>
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
    </div>
  );
}
