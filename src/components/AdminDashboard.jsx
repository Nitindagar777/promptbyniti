import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DollarSign, Zap, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PromptThumbnail from './PromptThumbnail';
import './AdminDashboard.css';
const AdminDashboard = () => {
  const { state, dispatch } = useApp();
  const [stats, setStats] = useState(state.adminStats || null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('sub') || 'overview');
  
  // Initialize data with preloaded values if available
  const getInitialData = (tab) => {
    if (tab === 'verification' || tab === 'prompts') return state.adminPrompts || [];
    if (tab === 'users') return state.adminUsers || [];
    if (tab === 'transactions') return state.adminTransactions || [];
    if (tab === 'withdrawals') return state.adminWithdrawals || [];
    if (tab === 'api' || tab === 'rules') return state.adminSettings ? [state.adminSettings] : [];
    return [];
  };

  const [data, setData] = useState(getInitialData('overview'));
  const [loading, setLoading] = useState(!getInitialData('overview').length);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [rejectionModal, setRejectionModal] = useState({ show: false, id: null, reason: "", type: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, id: null });
  const [payModal, setPayModal] = useState(null); // stores the withdrawal object being paid
  const [systemSettings, setSystemSettings] = useState(state.adminSettings || { geminiApiKey: '', promptCreationRules: [] });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [newRule, setNewRule] = useState('');
  const [newRuleExample, setNewRuleExample] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkRules, setBulkRules] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const ruleFormRef = React.useRef(null);

  // Sync Global State to Local State when background fetches complete
  useEffect(() => {
    if (state.adminStats) setStats(state.adminStats);
  }, [state.adminStats]);

  useEffect(() => {
    if (state.adminSettings) setSystemSettings(state.adminSettings);
  }, [state.adminSettings]);

  useEffect(() => {
    const sub = searchParams.get('sub');
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
    }
  }, [searchParams]);

  useEffect(() => {
    const initialData = getInitialData(activeTab);
    if (initialData.length > 0) setData(initialData);
  }, [state.adminPrompts, state.adminUsers, state.adminTransactions, state.adminWithdrawals, state.adminSettings, activeTab]);

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
      const response = await fetch(`/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) {
        setStats(json.stats);
        dispatch({ type: 'PRELOAD_DATA', payload: { adminStats: json.stats } });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchData = async (tab, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const endpoint = tab === 'verification' ? 'prompts' : tab;
      const response = await fetch(`/api/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) {
        const resultData = json[endpoint] || json.data || [];
        setData(resultData);
        // Sync to global state
        if (tab === 'verification' || tab === 'prompts') {
          dispatch({ type: 'PRELOAD_DATA', payload: { adminPrompts: resultData } });
        } else if (tab === 'users') {
          dispatch({ type: 'PRELOAD_DATA', payload: { adminUsers: resultData } });
        } else if (tab === 'transactions') {
          dispatch({ type: 'PRELOAD_DATA', payload: { adminTransactions: resultData } });
        } else if (tab === 'withdrawals') {
          dispatch({ type: 'PRELOAD_DATA', payload: { adminWithdrawals: resultData } });
        }
      } else {
        setError(json.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data. Please check your connection.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'api' || activeTab === 'rules') {
      fetchSettings();
    } else if (activeTab !== 'overview') {
      const initialData = getInitialData(activeTab);
      let needsLoading = true;
      if (initialData && initialData.length > 0) {
        setData(initialData);
        setLoading(false);
        needsLoading = false;
      } else {
        setLoading(true);
      }
      fetchData(activeTab, needsLoading);
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch(`/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}` }
      });
      const json = await response.json();
      if (json.success) {
        setSystemSettings(json.settings);
        dispatch({ type: 'PRELOAD_DATA', payload: { adminSettings: json.settings } });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setSettingsLoading(false);
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updatedData) => {
    setSettingsLoading(true);
    setSettingsMessage(null);
    try {
      const response = await fetch(`/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify(updatedData)
      });
      const json = await response.json();
      if (json.success) {
        setSystemSettings(json.settings);
        setSettingsMessage({ type: 'success', text: 'Settings updated successfully!' });
        setTimeout(() => setSettingsMessage(null), 3000);
      } else {
        setSettingsMessage({ type: 'error', text: json.message || 'Failed to update' });
      }
    } catch (err) {
      setSettingsMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = "") => {
    if (status === 'rejected' && !reason) {
      setRejectionModal({ show: true, id, reason: "", type: 'prompt' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      const json = await response.json();
      if (json.success) {
        setData(data.map(item => item._id === id ? { ...item, status, rejectionReason: reason } : item));
        setRejectionModal({ show: false, id: null, reason: "", type: null });
        fetchStats();
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDeletePrompt = (id) => {
    setDeleteConfirmModal({ show: true, id });
  };

  const executeDeletePrompt = async () => {
    if (!deleteConfirmModal.id) return;
    try {
      const response = await fetch(`/api/admin/prompts/${deleteConfirmModal.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        }
      });
      const json = await response.json();
      if (json.success) {
        setData(data.filter(item => item._id !== deleteConfirmModal.id));
        setDeleteConfirmModal({ show: false, id: null });
        fetchStats();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUserBan = async (id, currentStatus) => {
    try {
      const isBanned = !currentStatus;
      const response = await fetch(`/api/admin/users/${id}/ban`, {
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

  const handleWithdrawalStatus = async (id, status, reason = "") => {
    if (status === 'rejected' && !reason) {
      setRejectionModal({ show: true, id, reason: "", type: 'withdrawal' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      const json = await response.json();
      if (json.success) {
        setData(data.map(item => item._id === id ? { ...item, status, rejectionReason: reason } : item));
        setRejectionModal({ show: false, id: null, reason: "", type: null });
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(prompt => (
                <tr key={prompt._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                      <PromptThumbnail 
                        src={prompt.thumbnail || (prompt.samples && prompt.samples.length > 0 ? (prompt.samples[0].output || prompt.samples[0]) : null)} 
                        alt={prompt.name}
                        type={prompt.generateType}
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
                  <td className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="view-btn" onClick={() => setSelectedPrompt(prompt)}>View Details</button>
                    {prompt.status !== 'rejected' && (
                      <button className="reject-btn" onClick={() => handleStatusUpdate(prompt._id, 'rejected')}>Reject</button>
                    )}
                    {prompt.status === 'pending' && (
                      <button className="approve-btn" onClick={() => handleStatusUpdate(prompt._id, 'approved')}>Approve</button>
                    )}
                    <button className="delete-btn" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleDeletePrompt(prompt._id)}>Delete</button>
                  </td>
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
    // ... (existing code remains same)
    <div className="admin-table-container">
      {/* (existing withdrawal table code) */}
    </div>
  );

  const renderApiSettings = () => (
    <div className="admin-settings-container card">
      <div className="settings-header-box">
        <Zap size={24} className="text-cyan" />
        <h2>API Configurations</h2>
      </div>
      <p className="text-secondary mb-6">Manage external AI service keys and parameters.</p>

      <div className="admin-field">
        <label>Free Gemini API Key</label>
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type={showApiKey ? "text" : "password"} 
              className="admin-input" 
              placeholder="Enter your Free Gemini API key..." 
              value={systemSettings.geminiApiKey || ''}
              onChange={(e) => setSystemSettings({...systemSettings, geminiApiKey: e.target.value})}
              style={{ width: '100%', paddingRight: '45px' }}
            />
            <button 
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
              }}
              title={showApiKey ? "Hide Key" : "Show Key"}
            >
              {showApiKey ? '👁️' : '🔒'}
            </button>
          </div>
          <button 
            className="approve-btn" 
            onClick={() => handleUpdateSettings({ geminiApiKey: systemSettings.geminiApiKey })}
            disabled={settingsLoading}
          >
            {settingsLoading ? 'Saving...' : 'Save Free Key'}
          </button>
        </div>
        {systemSettings.geminiApiKey && !showApiKey && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-cyan)', opacity: 0.8 }}>
            Current Key: {systemSettings.geminiApiKey.substring(0, 6)}...{systemSettings.geminiApiKey.slice(-4)}
          </p>
        )}
        <p className="text-xs text-muted mt-2">This is the primary key used for generation. Try to use a free tier key here.</p>
      </div>

      <div className="admin-field" style={{ marginTop: '20px' }}>
        <label>Paid Gemini API Key (Failover)</label>
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type={showApiKey ? "text" : "password"} 
              className="admin-input" 
              placeholder="Enter your Paid Gemini API key (optional)..." 
              value={systemSettings.paidGeminiApiKey || ''}
              onChange={(e) => setSystemSettings({...systemSettings, paidGeminiApiKey: e.target.value})}
              style={{ width: '100%', paddingRight: '45px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            />
            <button 
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
              }}
              title={showApiKey ? "Hide Key" : "Show Key"}
            >
              {showApiKey ? '👁️' : '🔒'}
            </button>
          </div>
          <button 
            className="approve-btn" 
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
            onClick={() => handleUpdateSettings({ paidGeminiApiKey: systemSettings.paidGeminiApiKey })}
            disabled={settingsLoading}
          >
            {settingsLoading ? 'Saving...' : 'Save Paid Key'}
          </button>
        </div>
        {systemSettings.paidGeminiApiKey && !showApiKey && (
          <p className="text-xs mt-2" style={{ color: '#ef4444', opacity: 0.8 }}>
            Current Key: {systemSettings.paidGeminiApiKey.substring(0, 6)}...{systemSettings.paidGeminiApiKey.slice(-4)}
          </p>
        )}
        <p className="text-xs text-muted mt-2">This key is ONLY used if the free key hits a rate limit or quota exhaustion. It ensures users never see a failure.</p>
      </div>

      <div className="admin-field" style={{ marginTop: '20px' }}>
        <label>Gemini Model</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="admin-input" 
            value={systemSettings.geminiModel || 'gemini-2.0-flash'}
            onChange={(e) => setSystemSettings({...systemSettings, geminiModel: e.target.value})}
            style={{ flex: 1 }}
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Stable)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Advanced)</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Experimental)</option>
            <option value="gemini-flash-latest">Gemini Flash Latest (Auto-update)</option>
          </select>
          <button 
            className="approve-btn" 
            onClick={() => handleUpdateSettings({ geminiModel: systemSettings.geminiModel })}
            disabled={settingsLoading}
          >
            Update Model
          </button>
        </div>
        <p className="text-xs text-muted mt-2">Switching models can improve prompt quality or reduce costs. "Latest" always points to the newest stable version.</p>
      </div>

      {settingsMessage && (
        <div className={`settings-status ${settingsMessage.type}`}>
          {settingsMessage.text}
        </div>
      )}
    </div>
  );

  const renderRules = () => {
    const addRule = () => {
      if (!newRule.trim()) return;
      const updatedRules = [...(systemSettings.promptCreationRules || []), { text: newRule.trim(), example: newRuleExample.trim() }];
      handleUpdateSettings({ promptCreationRules: updatedRules });
      setNewRule('');
      setNewRuleExample('');
    };

    const removeRule = (index) => {
      const updatedRules = (systemSettings.promptCreationRules || []).filter((_, i) => i !== index);
      handleUpdateSettings({ promptCreationRules: updatedRules });
    };

    const handleSaveBulkRules = () => {
      const parsed = bulkRules.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [text, example] = line.split('|').map(s => s.trim());
          return { text, example: example || '' };
        });
      handleUpdateSettings({ promptCreationRules: parsed });
      setIsBulkMode(false);
    };

    const scrollToForm = () => {
      if (ruleFormRef.current) {
        ruleFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const enterBulkMode = () => {
      const currentText = (systemSettings.promptCreationRules || []).map(r => {
        const t = typeof r === 'string' ? r : r.text;
        const e = typeof r === 'object' ? r.example : '';
        return e ? `${t} | ${e}` : t;
      }).join('\n');
      setBulkRules(currentText);
      setIsBulkMode(true);
    };

    return (
      <div className="admin-settings-container card">
        <div className="settings-header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} className="text-purple" />
            <h2 style={{ margin: 0 }}>Prompt Creation Rules</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isBulkMode && (
              <button 
                className="approve-btn" 
                onClick={scrollToForm}
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#22c55e' }}
              >
                + Add New Rule
              </button>
            )}
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={isBulkMode ? () => setIsBulkMode(false) : enterBulkMode}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {isBulkMode ? 'Cancel Bulk Edit' : 'Notepad Mode (Bulk Edit)'}
            </button>
          </div>
        </div>
        <p className="text-secondary mb-6">
          {isBulkMode 
            ? "Paste your rules here. Format: Rule Text | Example (optional). Each rule on a new line."
            : "Define the guidelines for sellers when creating new prompts."}
        </p>

        {isBulkMode ? (
          <div className="bulk-rules-editor">
            <textarea
              className="admin-input"
              style={{ width: '100%', minHeight: '300px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5', padding: '15px' }}
              placeholder={`Rule 1\nRule 2 | Example for Rule 2\nRule 3`}
              value={bulkRules}
              onChange={(e) => setBulkRules(e.target.value)}
            />
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setIsBulkMode(false)}>Discard</button>
              <button className="approve-btn" onClick={handleSaveBulkRules}>Save All Rules</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rules-list">
          {(systemSettings.promptCreationRules || []).map((ruleObj, index) => {
            const ruleText = typeof ruleObj === 'string' ? ruleObj : ruleObj.text;
            const ruleExample = typeof ruleObj === 'object' ? ruleObj.example : '';
            
            return (
              <div key={index} className="rule-item">
                <div className="rule-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="rule-number">{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p className="rule-text">{ruleText}</p>
                      {ruleExample && (
                        <p className="rule-example" style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginTop: '4px', fontStyle: 'italic' }}>
                          Example: {ruleExample}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button className="remove-rule-btn" onClick={() => removeRule(index)}>&times;</button>
              </div>
            );
          })}
        </div>

        <div ref={ruleFormRef} className="add-rule-box" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Rule Text</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="e.g. Include clear aspect ratios..." 
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRule()}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Example (Optional)</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="e.g. Use --ar 16:9 for cinematic shots" 
              value={newRuleExample}
              onChange={(e) => setNewRuleExample(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRule()}
              style={{ width: '100%' }}
            />
          </div>
          <button className="approve-btn" onClick={addRule} style={{ alignSelf: 'flex-end', marginTop: '5px' }}>Add Rule</button>
        </div>
      </>
    )}
  </div>
);
};

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Center</h1>
        <div className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setSearchParams({ tab: 'admin', sub: 'overview' }); }}>Overview</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => { setActiveTab('users'); setSearchParams({ tab: 'admin', sub: 'users' }); }}>Users</button>
          <button className={activeTab === 'verification' ? 'active' : ''} onClick={() => { setActiveTab('verification'); setSearchParams({ tab: 'admin', sub: 'verification' }); }}>
            Verification {stats?.pendingPrompts > 0 && <span className="tab-badge">{stats.pendingPrompts}</span>}
          </button>
          <button className={activeTab === 'prompts' ? 'active' : ''} onClick={() => { setActiveTab('prompts'); setSearchParams({ tab: 'admin', sub: 'prompts' }); }}>All Prompts</button>
          <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => { setActiveTab('transactions'); setSearchParams({ tab: 'admin', sub: 'transactions' }); }}>Transactions</button>
          <button className={activeTab === 'withdrawals' ? 'active' : ''} onClick={() => { setActiveTab('withdrawals'); setSearchParams({ tab: 'admin', sub: 'withdrawals' }); }}>
            Withdrawals {stats?.pendingWithdrawals > 0 && <span className="tab-badge">{stats.pendingWithdrawals}</span>}
          </button>
          <button className={activeTab === 'api' ? 'active' : ''} onClick={() => { setActiveTab('api'); setSearchParams({ tab: 'admin', sub: 'api' }); }}>API Settings</button>
          <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => { setActiveTab('rules'); setSearchParams({ tab: 'admin', sub: 'rules' }); }}>Rules</button>
          <button className="refresh-btn" onClick={() => { fetchStats(); if(activeTab !== 'overview' && activeTab !== 'api' && activeTab !== 'rules') fetchData(activeTab); else if(activeTab === 'api' || activeTab === 'rules') fetchSettings(); }} title="Refresh Data">
            <span style={{ fontSize: '1.2rem' }}>↻</span>
          </button>
        </div>
      </div>

      {/* Payment Verification Modal */}
      {payModal && (
        <div className="admin-modal-overlay" style={{ zIndex: 10001 }}>
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--color-green)' }}>Verify & Pay</h2>
              <button className="close-modal" onClick={() => setPayModal(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.1)', width: '60px', height: '60px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#22c55e'
              }}>
                <DollarSign size={32} />
              </div>
              
              <h3 style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{payModal.amount} Tokens</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>Total Payout: <strong>${(payModal.amount === 70 ? 29 : payModal.amount === 20 ? 10 : payModal.amount * 0.5).toFixed(2)}</strong></p>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px', borderRadius: '16px', textAlign: 'left', marginBottom: '25px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: 'var(--color-cyan)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>User Details</strong>
                  <p style={{ fontSize: '1rem', fontWeight: 'normal', color: 'white', fontFamily: 'sans-serif' }}>{payModal.userId?.name || 'User'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'sans-serif' }}>{payModal.userId?.email || ''}</p>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--color-cyan)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Payment Method ({payModal.method})</strong>
                  <p style={{ fontSize: '1.05rem', color: 'white', wordBreak: 'break-word', fontWeight: 'normal', fontFamily: 'sans-serif', lineHeight: '1.5' }}>{payModal.paymentInfo}</p>
                  {payModal.details?.note && <p style={{ marginTop: '10px', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>Note: {payModal.details.note}</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  className="approve-btn" 
                  style={{ flex: 2, padding: '15px', fontSize: '1.1rem' }}
                  onClick={() => {
                    handleWithdrawalStatus(payModal._id, 'completed');
                    setPayModal(null);
                  }}
                >
                  Done & Mark Paid
                </button>
                <button 
                  className="approve-btn" 
                  style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                  onClick={() => setPayModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.show && (
        <div className="admin-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="admin-modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>{rejectionModal.type === 'prompt' ? 'Reject Prompt' : 'Withdrawal Rejection'}</h2>
              <button className="close-modal" onClick={() => setRejectionModal({ show: false, id: null, reason: "", type: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
                Please provide a reason for rejecting this {rejectionModal.type === 'prompt' ? 'prompt' : 'withdrawal'}. This will be visible to the user.
              </p>
              <textarea 
                className="admin-textarea"
                style={{ 
                  width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontFamily: 'inherit', marginBottom: '20px', outline: 'none'
                }}
                placeholder={rejectionModal.type === 'prompt' ? "e.g., Inappropriate content, unclear instructions..." : "e.g., Invalid UPI ID, Suspicious activity, etc."}
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="reject-btn" 
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => {
                    if (rejectionModal.type === 'prompt') {
                      handleStatusUpdate(rejectionModal.id, 'rejected', rejectionModal.reason);
                    } else {
                      handleWithdrawalStatus(rejectionModal.id, 'rejected', rejectionModal.reason);
                    }
                  }}
                  disabled={!rejectionModal.reason.trim()}
                >
                  Confirm Rejection
                </button>
                <button 
                  className="approve-btn" 
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setRejectionModal({ show: false, id: null, reason: "", type: null })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="admin-modal-overlay" style={{ zIndex: 100000 }}>
          <div className="admin-modal" style={{ maxWidth: '400px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: '16px', padding: '30px' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Delete Prompt?</h2>
            <p style={{ marginBottom: '25px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Are you sure you want to completely delete this prompt from the platform? This action <strong>cannot be undone</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="delete-btn" 
                style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={executeDeletePrompt}
              >
                Yes, Delete It
              </button>
              <button 
                className="approve-btn" 
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setDeleteConfirmModal({ show: false, id: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="admin-content-area">
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
            {activeTab === 'api' && renderApiSettings()}
            {activeTab === 'rules' && renderRules()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
