import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, CreditCard, User, Moon, Lock, LogOut, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import './SettingsPage.css';

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';

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

  const [activeTab, setActiveTab] = useState('profile');

  // ... (keep handleImageChange and handleUpdateProfile)

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
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} className="icon-profile" />
              <span>Edit Profile</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={20} className="icon-security" />
              <span>Account Security</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'subscription' ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <CreditCard size={20} className="icon-billing" />
              <span>Subscription</span>
            </button>
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
                        {(preview || formData.avatar) ? (
                          <img src={preview || formData.avatar} alt="Avatar" />
                        ) : (
                          <User size={40} className="text-muted" />
                        )}
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
                
                <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', background: 'rgba(168, 85, 247, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-purple)' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Password</h4>
                  <p className="text-sm text-muted">To change your password or security settings, please use the secure link sent to your verified email.</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '16px', padding: '10px 20px' }}>Request Reset Link</button>
                </div>
              </section>
            )}

            {activeTab === 'subscription' && (
              <section className="settings-section card">
                <h3 className="settings-section-title">
                  <CreditCard size={22} className="text-cyan" /> 
                  <span className="text-cyan">Subscription Plan</span>
                </h3>
                
                <div className="plan-card" style={{ background: 'var(--bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="section-tag" style={{ background: state.plan === 'free' ? 'var(--text-muted)' : 'var(--color-orange)' }}>
                      {state.plan.toUpperCase()} PLAN
                    </span>
                    <h2 style={{ fontSize: '2rem', margin: '8px 0' }}>{state.plan === 'free' ? 'Standard Access' : 'Pro Creator'}</h2>
                    <p className="text-muted">You have <span className="text-cyan">{state.credits === -1 ? 'Unlimited' : state.credits}</span> generations remaining.</p>
                  </div>
                  {state.plan === 'free' && (
                    <button className="btn btn-primary">Upgrade Now</button>
                  )}
                </div>

                <div style={{ marginTop: 'var(--space-xl)' }}>
                  <h4 style={{ marginBottom: 'var(--space-md)' }}>Billing History</h4>
                  <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-xl)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    No recent transactions found.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
