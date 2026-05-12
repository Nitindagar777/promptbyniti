import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiModels } from '../data/promptData';
import { Shield, CreditCard, User, Moon, Lock, LogOut, Camera, Check, AlertCircle, Loader2, LayoutGrid, ShoppingBag, TrendingUp, Bookmark, Trash2, Eye, ChevronLeft, Sparkles, Copy, Tag } from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import './SettingsPage.css';

/* ── Saved Prompts Tab Component ── */
function SavedPromptsTab() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_prompts') || '[]');
      setPrompts(saved);
    } catch { setPrompts([]); }
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const updated = prompts.filter(p => p.id !== deleteId);
    setPrompts(updated);
    localStorage.setItem('saved_prompts', JSON.stringify(updated));
    if (selected?.id === deleteId) setSelected(null);
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleSell = (p) => {
    const modelEntry = aiModels.find(m => m.id === p.model);
    const sellData = {
      name: p.title || '',
      description: p.description || '',
      generateType: p.promptType || 'image',
      model: p.model || '',
      modelLabel: modelEntry ? modelEntry.label : p.model,
      template: p.promptTemplate || p.mainPrompt || '',
      instructions: p.instructions || '',
      keywords: p.keywords || [],
      mainPrompt: p.mainPrompt || '',
      negativePrompt: p.negativePrompt || '',
      imageAnalysis: p.imageAnalysis || '',
      samples: (p.samples || []).map((s) => ({
        input: s || '',
        output: null
      }))
    };
    navigate('/sell', { state: { fromGenerator: true, promptData: sellData } });
  };

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Detail View
  if (selected) {
    const p = selected;
    return (
      <section className="settings-section card">
        <button
          onClick={() => setSelected(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', marginBottom: '16px', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}
        >
          <ChevronLeft size={18} /> Back to Saved Prompts
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
          {p.characterImage && (
            <img src={p.characterImage} alt="Ref" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(0,224,255,0.2)' }} />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>{p.title || 'Untitled'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{p.description || ''}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', background: 'rgba(249,115,22,0.1)', color: 'var(--color-orange)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{p.promptType || 'image'}</span>
              <span style={{ padding: '3px 10px', background: 'rgba(168,85,247,0.1)', color: 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{p.model || 'midjourney'}</span>
              <span style={{ padding: '3px 10px', background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', borderRadius: '20px', fontSize: '0.75rem' }}>{new Date(p.savedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => handleSell(p)}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '12px', padding: '10px 24px', gap: '8px', fontSize: '1rem', background: 'var(--color-orange)', border: 'none' }}
            >
              <ShoppingBag size={18} /> Sell
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="btn btn-secondary-outline btn-sm"
              style={{ borderRadius: '12px', padding: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
              title="Delete Saved Prompt"
            >
              <Trash2 size={18} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Prompt fields */}
        {[
          { label: 'Main Prompt', value: p.mainPrompt, key: 'main' },
          { label: 'Prompt Template', value: p.promptTemplate, key: 'template' },
          { label: 'Negative Prompt', value: p.negativePrompt, key: 'negative' },
          { label: 'Image Analysis', value: p.imageAnalysis, key: 'analysis' },
          { label: 'Instructions', value: p.instructions, key: 'instructions' },
        ].filter(f => f.value).map(f => (
          <div key={f.key} style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <button
                onClick={() => copyText(f.value, f.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: copiedField === f.key ? 'var(--color-green)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {copiedField === f.key ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'monospace', margin: 0, lineHeight: 1.6 }}>{f.value}</pre>
          </div>
        ))}

        {/* Samples */}
        {p.samples && p.samples.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--color-orange)', marginBottom: '12px', fontSize: '0.95rem' }}>
              <Sparkles size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
              Sample Variations
            </h4>
            {p.samples.map((s, i) => (
              <div key={i} style={{ marginBottom: '10px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sample {String.fromCharCode(65 + i)}</span>
                  <button
                    onClick={() => copyText(s, `sample-${i}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: copiedField === `sample-${i}` ? 'var(--color-green)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    {copiedField === `sample-${i}` ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem', fontFamily: 'monospace', margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{s}</pre>
              </div>
            ))}
          </div>
        )}

        {/* Keywords */}
        {p.keywords && p.keywords.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            {p.keywords.map((kw, i) => (
              <span key={i} style={{ padding: '4px 12px', background: 'rgba(168,85,247,0.08)', color: 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid rgba(168,85,247,0.15)' }}>{kw}</span>
            ))}
          </div>
        )}
      </section>
    );
  }

  // List View
  return (
    <section className="settings-section card">
      <h3 className="settings-section-title">
        <Bookmark size={22} className="text-cyan" />
        <span className="text-cyan">Saved Prompts</span>
      </h3>
      <p className="text-muted mb-6">Your prompts from the generator. These are stored in your browser.</p>
      <br></br>
      {prompts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <Bookmark size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No saved prompts yet.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>Generate a prompt and click "Save Prompt" to store it here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {prompts.map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              className="saved-prompt-card"
              onClick={() => setSelected(p)}
            >
              {/* Cover / Thumbnail */}
              <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,224,255,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.characterImage ? (
                  <img src={p.characterImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Sparkles size={32} style={{ color: 'var(--accent-primary)', opacity: 0.4 }} />
                )}
              </div>
              {/* Info */}
              <div style={{ padding: '14px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'Untitled'}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description || p.userDescription || 'No description'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(p.savedAt).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSell(p); }}
                      style={{ background: 'rgba(6, 182, 212, 0.1)', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ShoppingBag size={12} /> Sell
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '400px', padding: '32px',
            textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(239, 68, 68, 0.1)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'white', fontFamily: 'var(--font-display)' }}>Delete Prompt?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.5 }}>
              Are you sure you want to remove this prompt from your saved library? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary w-full"
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, height: '48px', borderRadius: '12px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={confirmDelete}
                style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#ef4444', border: 'none' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
re         </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const { state, dispatch, logout } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Logout and redirect to home
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Form State
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    bio: state.user?.bio || '',
    avatar: state.user?.avatar || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState(null);

  // Sync state with formData when user data loads
  useEffect(() => {
    if (state.user) {
      setFormData({
        name: state.user.name || '',
        bio: state.user.bio || '',
        avatar: state.user.avatar || '',
      });
    }
  }, [state.user]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_USER', payload: data.user });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setPreview(null); // Clear preview since we have the new real URL
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  // Sync activeTab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);
  const [securityStep, setSecurityStep] = useState('start'); // start | otp | password
  const [securityOtp, setSecurityOtp] = useState('');
  const [securityNewPassword, setSecurityNewPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'token-history') {
      const fetchTransactions = async () => {
        setTxLoading(true);
        try {
          const token = localStorage.getItem('promptbyniti_token');
          const res = await fetch(`${API_URL}/payment/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setTransactions(data.transactions);
          }
        } catch (err) {
          console.error('Failed to fetch transactions:', err);
        } finally {
          setTxLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [activeTab]);

  // Admin Session State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const isAdminEmail = state.user?.email === 'nitindagar0800@gmail.com';

  useEffect(() => {
    // Check for existing valid admin session
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const { timestamp } = JSON.parse(adminSession);
      const now = Date.now();
      // 12 hours in ms: 12 * 60 * 60 * 1000 = 43,200,000
      if (now - timestamp < 43200000) {
        setIsAdminAuth(true);
      } else {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminInput === '@Nitin800') {
      setIsAdminAuth(true);
      setShowAdminModal(false);
      setAdminInput('');
      setAdminError('');
      localStorage.setItem('admin_session', JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
      }));
      setActiveTab('admin');
    } else {
      setAdminError('Incorrect Password');
    }
  };

  // Handle Security Flow
  const handleSecurityFlow = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (securityStep === 'start') {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.user.email })
        });
        const data = await res.json();
        if (data.success) {
          setSecurityStep('otp');
          setMessage({ type: 'success', text: 'Verification code sent to your email!' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Error sending code' });
        }
      } else if (securityStep === 'otp') {
        const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.user.email, otp: securityOtp })
        });
        const data = await res.json();
        if (data.success) {
          setSecurityStep('password');
        } else {
          setMessage({ type: 'error', text: data.message || 'Invalid verification code' });
        }
      } else if (securityStep === 'password') {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.user.email, otp: securityOtp, password: securityNewPassword })
        });
        const data = await res.json();
        if (data.success) {
          setSecurityStep('start');
          setSecurityOtp('');
          setSecurityNewPassword('');
          setMessage({ type: 'success', text: 'Password updated successfully!' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to update password' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="settings-page" id="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>

        {message.text && (
          <div className={`alert-toast ${message.type === 'success' ? 'alert-toast--success' : 'alert-toast--error'}`}>
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-grid">
          {/* Tabs Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'profile' ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <User size={20} className="icon-profile" />
              <span>Edit Profile</span>
            </button>
            <button
              className={`settings-tab ${activeTab === 'security' ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <Shield size={20} className="icon-security" />
              <span>Account Security</span>
            </button>
            <button
              className={`settings-tab ${activeTab === 'token-history' ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange('token-history')}
            >
              <CreditCard size={20} className="icon-billing" />
              <span>Token History</span>
            </button>
            <button
              className={`settings-tab ${activeTab === 'dashboards' ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange('dashboards')}
            >
              <LayoutGrid size={20} className="icon-dashboards" />
              <span>Dashboards</span>
            </button>
            <button
              className={`settings-tab ${activeTab === 'saved' ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              <Bookmark size={20} className="icon-saved" />
              <span>Saved Prompts</span>
            </button>
            {isAdminEmail && (
              <button
                className={`settings-tab ${activeTab === 'admin' ? 'settings-tab--active' : ''}`}
                onClick={() => {
                  if (!isAdminAuth) {
                    setShowAdminModal(true);
                  } else {
                    handleTabChange('admin');
                  }
                }}
              >
                <Lock size={20} className="icon-admin" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {activeTab === 'profile' && (
              <>
                {/* Profile Section */}
                <form className="settings-section card" onSubmit={handleUpdateProfile}>
                  <h3 className="settings-section-title">
                    <User size={22} className="text-orange" />
                    <span className="text-orange">Public Profile</span>
                  </h3>

                  <div className="profile-upload-container">
                    <div className="profile-avatar-wrapper">
                      <div className="profile-avatar-preview">
                        <img
                          src={preview || formData.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60'}
                          alt="Avatar"
                        />
                      </div>
                      <button
                        type="button"
                        className="avatar-edit-btn"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="profile-upload-info">
                      <h4>Profile Picture</h4>
                      <p>Fast update and visible in navbar instantly.</p>
                      <p className="text-xs text-muted">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="settings-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="settings-field">
                    <label>Short Bio</label>
                    <textarea
                      className="textarea"
                      placeholder="Tell the world about your prompt engineering skills..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      maxLength={200}
                      style={{ minHeight: '100px' }}
                    ></textarea>
                    <p className="text-xs text-muted" style={{ textAlign: 'right', marginTop: '4px' }}>
                      {formData.bio.length}/200
                    </p>
                  </div>

                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '12px 32px', fontSize: '1.1rem' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Updating...
                        </>
                      ) : 'Update Profile'}
                    </button>
                  </div>
                </form>

                {/* Danger Zone Section (kept in profile as requested) */}
                <section className="settings-section settings-section--danger card">
                  <h3 className="settings-section-title">
                    <LogOut size={22} className="text-pink" />
                    <span className="text-pink">Danger Zone</span>
                  </h3>
                  <div className="danger-box">
                    <div className="danger-text">
                      <h4>Sign Out</h4>
                      <p>Logout from your account on this device.</p>
                    </div>
                    <button
                      type="button"
                      className="btn danger-btn"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'security' && (
              <section className="settings-section card">
                <h3 className="settings-section-title">
                  <Shield size={22} className="text-purple" />
                  <span className="text-purple">Account Security</span>
                </h3>
                <div className="settings-field">
                  <label>Email Address</label>
                  <input type="email" className="input" defaultValue={state.user?.email} disabled />
                  <p className="text-sm text-muted" style={{ marginTop: '12px' }}>
                    Your account is secured via {state.user?.provider === 'google' ? 'Google OAuth' : 'Email Verification'}.
                  </p>
                </div>

                <form
                  onSubmit={handleSecurityFlow}
                  style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', background: 'rgba(168, 85, 247, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-purple)' }}
                >
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Password</h4>

                  {securityStep === 'start' && (
                    <>
                      <p className="text-sm text-muted">To change your password or security settings, please use the secure link sent to your verified email.</p>
                      <button
                        type="submit"
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '16px', padding: '10px 20px' }}
                        disabled={securityLoading}
                      >
                        {securityLoading ? 'Sending...' : 'Request Reset Link'}
                      </button>
                    </>
                  )}

                  {securityStep === 'otp' && (
                    <div style={{ marginTop: '12px' }}>
                      <p className="text-sm text-muted">Enter the 4-digit code sent to your email.</p>
                      <input
                        type="text"
                        className="input"
                        placeholder="0000"
                        maxLength={4}
                        value={securityOtp}
                        onChange={(e) => setSecurityOtp(e.target.value)}
                        required
                        style={{ maxWidth: '120px', textAlign: 'center', fontSize: '1.2rem', marginTop: '12px' }}
                      />
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={securityLoading}
                        >
                          {securityLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSecurityStep('start')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {securityStep === 'password' && (
                    <div style={{ marginTop: '12px' }}>
                      <p className="text-sm text-muted">Enter your new password below.</p>
                      <input
                        type="password"
                        className="input"
                        placeholder="New Password"
                        minLength={6}
                        value={securityNewPassword}
                        onChange={(e) => setSecurityNewPassword(e.target.value)}
                        required
                        style={{ marginTop: '12px' }}
                      />
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={securityLoading}
                        >
                          {securityLoading ? 'Updating...' : 'Set New Password'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSecurityStep('start')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </section>
            )}

            {activeTab === 'dashboards' && (
              <section className="settings-section card">
                <h3 className="settings-section-title">
                  <LayoutGrid size={22} className="text-cyan" />
                  <span className="text-cyan">Account Dashboards</span>
                </h3>
                <p className="text-muted mb-6">Switch between your selling performance and your personal acquisition hub.</p>

                <div className="dashboards-selector-grid">
                  <div className="dashboard-option-card" onClick={() => navigate('/dashboard')}>
                    <div className="option-icon-box seller-bg">
                      <TrendingUp size={32} />
                    </div>
                    <div className="option-info">
                      <h4>Seller Dashboard</h4>
                      <p>Track earnings, manage products, and view sales analytics.</p>
                      <span className="option-link">Access Marketplace Stats →</span>
                    </div>
                  </div>

                  <div className="dashboard-option-card" onClick={() => navigate('/buyer-dashboard')}>
                    <div className="option-icon-box buyer-bg">
                      <ShoppingBag size={32} />
                    </div>
                    <div className="option-info">
                      <h4>Buyer Dashboard</h4>
                      <p>View purchased prompts, manage favorites, and track history.</p>
                      <span className="option-link">Access My Library →</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'token-history' && (
              <section className="settings-section card">
                <h3 className="settings-section-title">
                  <CreditCard size={22} className="text-cyan" />
                  <span className="text-cyan">Account & Packs</span>
                </h3>

                <div className="plan-card" style={{ background: 'var(--bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="section-tag" style={{ background: 'rgba(0, 224, 255, 0.1)', color: 'var(--color-cyan)', fontWeight: 700 }}>
                      ACCOUNT BALANCE
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '12px 0', fontFamily: 'var(--font-display)', color: 'white' }}>
                      {Math.floor(state.credits)} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Tokens</span>
                    </h2>
                    <p className="text-muted">Use tokens to generate and purchase premium prompts.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/pricing')} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                    Buy Tokens
                  </button>
                </div>

                <div style={{ marginTop: 'var(--space-xl)' }}>
                  <h4 style={{ marginBottom: 'var(--space-md)' }}>Recent Transactions</h4>
                  {txLoading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>Loading history...</div>
                  ) : transactions.length > 0 ? (
                    <div className="table-responsive" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <tr>
                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Date</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pack / Plan</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order ID</th>
                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(tx => (
                            <tr key={tx._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                              <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--color-cyan)', textTransform: 'capitalize' }}>{tx.planId} Pack</td>
                              <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>₹{tx.amount}</td>
                              <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tx.orderId}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                  {tx.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-xl)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      You haven't purchased any token packs yet.
                    </p>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'saved' && (
              <SavedPromptsTab />
            )}

            {activeTab === 'admin' && isAdminAuth && (
              <section className="settings-section card no-padding">
                <AdminDashboard />
              </section>
            )}
          </div>
        </div>
      </div>
      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-container card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Admin Access</h3>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleAdminSubmit}>
              <p className="text-muted mb-4">Please enter the security password to access the Admin Panel.</p>
              <div className="settings-field">
                <label>Admin Password</label>
                <input
                  type="password"
                  className={`input ${adminError ? 'input--error' : ''}`}
                  placeholder="••••••••"
                  value={adminInput}
                  onChange={(e) => {
                    setAdminInput(e.target.value);
                    setAdminError('');
                  }}
                  autoFocus
                  required
                />
                {adminError && <p className="text-xs text-pink mt-2">{adminError}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdminModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Verify & Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
