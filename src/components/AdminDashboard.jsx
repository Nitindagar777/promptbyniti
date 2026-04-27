import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/admin/${tab}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) {
        setData(json[tab] || []);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Failed to fetch data');
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
          <h3>Total Sales</h3>
          <p className="stat-value">{stats?.salesCount || 0}</p>
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
            <th>Tokens</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {data.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.tokens}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPrompts = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(prompt => (
            <tr key={prompt._id}>
              <td>{prompt.title}</td>
              <td>{prompt.seller?.name || 'Unknown'}</td>
              <td>₹{prompt.price}</td>
              <td>
                <span className={`status-badge ${prompt.status}`}>
                  {prompt.status}
                </span>
              </td>
              <td className="actions">
                {prompt.status === 'pending' && (
                  <>
                    <button className="approve-btn" onClick={() => handleStatusUpdate(prompt._id, 'approved')}>Approve</button>
                    <button className="reject-btn" onClick={() => handleStatusUpdate(prompt._id, 'rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Center</h1>
        <div className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'prompts' ? 'active' : ''} onClick={() => setActiveTab('prompts')}>Prompts</button>
          <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>Transactions</button>
        </div>
      </div>

      <div className="admin-content">
        {loading && activeTab !== 'overview' ? (
          <div className="admin-loader">Loading control data...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'prompts' && renderPrompts()}
            {activeTab === 'transactions' && renderTransactions()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
