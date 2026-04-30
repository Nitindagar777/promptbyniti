import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const openLightbox = (media, index) => {
    setFullScreenMedia(media);
    setCurrentMediaIndex(index);
  };

  const navigateLightbox = (direction) => {
    if (!selectedPrompt?.samples) return;
    let nextIndex = currentMediaIndex + direction;
    if (nextIndex < 0) nextIndex = selectedPrompt.samples.length - 1;
    if (nextIndex >= selectedPrompt.samples.length) nextIndex = 0;
    setCurrentMediaIndex(nextIndex);
    setFullScreenMedia(selectedPrompt.samples[nextIndex].output);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) setStats(json.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = tab === 'verification' ? 'prompts' : tab;
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) {
        const resultData = json[endpoint] || json.data || [];
        setData(resultData);
      } else {
        setError(json.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab !== 'overview') {
      fetchData(activeTab);
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/prompts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({ status })
      });
      const json = await response.json();
      if (json.success) {
        setData(data.map(item => item._id === id ? { ...item, status } : item));
        fetchStats();
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleUserBan = async (id, currentStatus) => {
    try {
      const isBanned = !currentStatus;
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/users/${id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({ isBanned })
      });
      const json = await response.json();
      if (json.success) {
        setData(data.map(item => item._id === id ? { ...item, isBanned } : item));
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error('Ban error:', err);
    }
  };
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleWithdrawalStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({ status })
      });
      const json = await response.json();
      if (json.success) {
        setData(data.map(item => item._id === id ? { ...item, status } : item));
        fetchStats();
      }
    } catch (err) {
      console.error('Withdrawal update error:', err);
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats?.usersCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
        </div>
        <div className="stat-card highlight">
          <h3>Pending Prompts</h3>
          <p className="stat-value">{stats?.pendingPrompts || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Prompts</h3>
          <p className="stat-value">{stats?.promptsCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats?.salesCount || 0}</p>
        </div>
        <div className="stat-card highlight">
          <h3>Pending Withdrawals</h3>
          <p className="stat-value">{stats?.pendingWithdrawals || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Credits</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.credits}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${user.isBanned ? 'rejected' : 'approved'}`}>
                  {user.isBanned ? 'Banned' : 'Active'}
                </span>
              </td>
              <td className="actions">
                {user.email !== 'nitindagar0800@gmail.com' && (
                  <button
                    className={user.isBanned ? 'approve-btn' : 'reject-btn'}
                    onClick={() => handleUserBan(user._id, user.isBanned)}
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPrompts = (isVerification) => {
    const filteredData = data.filter(prompt => {
      if (!prompt.status) return isVerification; // Show in verification if status is missing
      const status = prompt.status.toLowerCase();
      return isVerification ? status === 'pending' : status !== 'pending';
    });

    return (
      <div className="admin-table-container">
        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No {isVerification ? 'pending' : ''} prompts found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Status</th>
                <th>Details</th>
                {isVerification && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(prompt => (
                <tr key={prompt._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                      <img 
                        src={prompt.thumbnail || (prompt.samples && prompt.samples.length > 0 ? (prompt.samples[0].output || prompt.samples[0]) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60')} 
                        alt={prompt.name}
                        style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 'bold' }}>{prompt.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9ca3af)' }}>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td>{prompt.seller?.name || 'Unknown'}</td>
                  <td>{prompt.tokens || 5} Tokens</td>
                  <td>
                    <span className={`status-badge ${prompt.status}`}>
                      {prompt.status}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedPrompt(prompt)}>View Details</button>
                  </td>
                  {isVerification && (
                    <td className="actions">
                      {prompt.status === 'pending' && (
                        <>
                          <button className="approve-btn" onClick={() => handleStatusUpdate(prompt._id, 'approved')}>Approve</button>
                          <button className="reject-btn" onClick={() => handleStatusUpdate(prompt._id, 'rejected')}>Reject</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderTransactions = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(tx => (
            <tr key={tx._id}>
              <td className="mono">{tx.orderId}</td>
              <td>{tx.planId}</td>
              <td>₹{tx.amount}</td>
              <td>
                <span className={`status-badge ${tx.status}`}>
                  {tx.status}
                </span>
              </td>
              <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="admin-table-container">
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No withdrawal requests found.
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Payout Value</th>
              <th>Method</th>
              <th>Payment Details</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(w => {
              const user = w.sellerId;
              const pm = user?.paymentMethod;
              const payoutUSD = w.amount === 70 ? '$29.00' : w.amount === 20 ? '$10.00' : `${w.amount} tokens`;
              
              let paymentInfo = 'Not set';
              if (pm) {
                if (pm.type === 'UPI' && pm.upiId) paymentInfo = `UPI: ${pm.upiId}`;
                else if (pm.type === 'BANK' && pm.accountNumber) paymentInfo = `Bank: ${pm.bankName || 'N/A'} | Acc: ${pm.accountNumber} | IFSC: ${pm.ifscCode || 'N/A'} | Name: ${pm.accountHolder || 'N/A'}`;
                else if (pm.type === 'INTL' && pm.paypalEmail) paymentInfo = `PayPal: ${pm.paypalEmail}${pm.swiftCode ? ' | SWIFT: ' + pm.swiftCode : ''}`;
                else if (pm.upiId) paymentInfo = `UPI: ${pm.upiId}`;
                else if (pm.paypalEmail) paymentInfo = `PayPal: ${pm.paypalEmail}`;
                else if (pm.accountNumber) paymentInfo = `Bank: ${pm.accountNumber}`;
              }

              return (
                <tr key={w._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user?.avatar && <img src={user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold' }}>{user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #9ca3af)' }}>{user?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{w.amount} Tokens</td>
                  <td style={{ color: 'var(--color-green, #22c55e)', fontWeight: 'bold' }}>{payoutUSD}</td>
                  <td>{w.method}</td>
                  <td>
                    <div style={{ maxWidth: '250px', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-cyan, #06b6d4)' }}>
                      {paymentInfo}
                      {pm?.note && <div style={{ marginTop: '4px', color: 'var(--text-secondary, #9ca3af)', fontStyle: 'italic' }}>Note: {pm.note}</div>}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`status-badge ${w.status}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="actions">
                    {w.status === 'pending' && (
                      <>
                        <button className="approve-btn" onClick={() => handleWithdrawalStatus(w._id, 'completed')}>Approve & Pay</button>
                        <button className="reject-btn" onClick={() => handleWithdrawalStatus(w._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {w.status === 'completed' && (
                      <span style={{ color: 'var(--color-green, #22c55e)', fontSize: '0.85rem', fontWeight: '600' }}>✓ Paid</span>
                    )}
                    {w.status === 'rejected' && (
                      <span style={{ color: 'var(--color-red, #ef4444)', fontSize: '0.85rem', fontWeight: '600' }}>✗ Rejected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Center</h1>
        <div className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'verification' ? 'active' : ''} onClick={() => setActiveTab('verification')}>
            Verification {stats?.pendingPrompts > 0 && <span className="tab-badge">{stats.pendingPrompts}</span>}
          </button>
          <button className={activeTab === 'prompts' ? 'active' : ''} onClick={() => setActiveTab('prompts')}>All Prompts</button>
          <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>Transactions</button>
          <button className={activeTab === 'withdrawals' ? 'active' : ''} onClick={() => setActiveTab('withdrawals')}>
            Withdrawals {stats?.pendingWithdrawals > 0 && <span className="tab-badge">{stats.pendingWithdrawals}</span>}
          </button>
          <button className="refresh-btn" onClick={() => { fetchStats(); if(activeTab !== 'overview') fetchData(activeTab); }} title="Refresh Data">
            <span style={{ fontSize: '1.2rem' }}>↻</span>
          </button>
        </div>
      </div>

      {selectedPrompt && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPrompt(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prompt Details: {selectedPrompt.name}</h2>
              <button className="close-modal" onClick={() => setSelectedPrompt(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Info</h4>
                <div className="detail-grid">
                  <div><strong>Model:</strong> {selectedPrompt.model}</div>
                  <div><strong>Type:</strong> {selectedPrompt.generateType}</div>
                  <div><strong>Price:</strong> {selectedPrompt.tokens} Tokens</div>
                  <div><strong>Seller:</strong> {selectedPrompt.seller?.name} ({selectedPrompt.seller?.email})</div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <strong>Description:</strong>
                  <p className="text-secondary">{selectedPrompt.description}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>Prompt Template</h4>
                <div className="prompt-template-wrapper">
                  <button className={`copy-btn-floating ${copyStatus ? 'success' : ''}`} onClick={() => handleCopy(selectedPrompt.template)}>
                    {copyStatus ? '✓ Copied' : 'Copy Template'}
                  </button>
                  <pre className="code-block">{selectedPrompt.template}</pre>
                </div>
              </div>

              {selectedPrompt.instructions && (
                <div className="detail-section">
                  <h4>Prompt Instructions</h4>
                  <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{selectedPrompt.instructions}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>Keywords</h4>
                <div className="keywords-flex">
                  {selectedPrompt.keywords?.map(kw => <span key={kw} className="keyword-tag active">{kw}</span>)}
                </div>
              </div>

              <div className="detail-section">
                <h4>Proof of Concept (3 Samples)</h4>
                <div className="samples-grid">
                  {selectedPrompt.samples?.map((s, i) => (
                    <div key={i} className="admin-sample-card">
                      <h5>Sample #{i + 1}</h5>
                      <div className="sample-media" onClick={() => openLightbox(s.output, i)} title="Click to view full screen">
                        {selectedPrompt.generateType === 'text' ? (
                          <div className="text-sample">{s.output}</div>
                        ) : selectedPrompt.generateType === 'video' ? (
                          <video src={s.output} muted style={{ width: '100%', cursor: 'zoom-in' }} />
                        ) : (
                          <img src={s.output} alt={`Sample ${i+1}`} style={{ width: '100%', cursor: 'zoom-in' }} />
                        )}
                      </div>
                      <div className="sample-input">
                        <strong>Input Prompt:</strong>
                        <p>{s.input}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedPrompt.status === 'pending' && (
              <div className="modal-footer">
                <button className="approve-btn" onClick={() => { handleStatusUpdate(selectedPrompt._id, 'approved'); setSelectedPrompt(null); }}>Approve Prompt</button>
                <button className="reject-btn" onClick={() => { handleStatusUpdate(selectedPrompt._id, 'rejected'); setSelectedPrompt(null); }}>Reject Prompt</button>
              </div>
            )}
          </div>
        </div>
      )}

      {fullScreenMedia && (
        <div className="lightbox-overlay" style={{ zIndex: 9999999 }} onClick={() => setFullScreenMedia(null)}>
          <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>&lsaquo;</button>
          
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="close-lightbox" onClick={() => setFullScreenMedia(null)}>&times;</button>
            {fullScreenMedia.includes('video') || fullScreenMedia.includes('.mp4') ? (
              <video src={fullScreenMedia} controls autoPlay />
            ) : (
              <img src={fullScreenMedia} alt="Full screen preview" />
            )}
            <div className="lightbox-caption">Sample #{currentMediaIndex + 1} of {selectedPrompt?.samples?.length}</div>
          </div>

          <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>&rsaquo;</button>
        </div>
      )}
      
      <div className="admin-content">
        {loading && activeTab !== 'overview' ? (
          <div className="admin-loader">Loading control data...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'verification' && renderPrompts(true)}
            {activeTab === 'prompts' && renderPrompts(false)}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'withdrawals' && renderWithdrawals()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
