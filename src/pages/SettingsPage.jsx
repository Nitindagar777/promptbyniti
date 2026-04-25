/* SettingsPage — Account and app settings */
import { useApp } from '../context/AppContext';
import { Shield, Bell, CreditCard, User, Moon, Lock, LogOut } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
  const { state, logout, isPremium } = useApp();

  return (
    <div className="settings-page" id="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>

        <div className="settings-grid">
          {/* Tabs Sidebar */}
          <div className="settings-sidebar">
            <button className="settings-tab settings-tab--active">
              <User size={20} className="icon-profile" />
              <span>Edit Profile</span>
            </button>
            <button className="settings-tab">
              <Shield size={20} className="icon-security" />
              <span>Account Security</span>
            </button>
            <button className="settings-tab">
              <CreditCard size={20} className="icon-billing" />
              <span>Subscription</span>
            </button>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* Profile Section */}
            <section className="settings-section card">
              <h3 className="settings-section-title">
                <User size={22} className="text-orange" /> 
                <span className="text-orange">Public Profile</span>
              </h3>
              
              <div className="profile-upload-container" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: 'var(--space-lg)' }}>
                <div className="profile-avatar-preview" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {state.user?.avatar ? (
                    <img src={state.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} className="text-muted" />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Change Picture</button>
                  <p className="text-xs text-muted">JPG, GIF or PNG. Max size 2MB</p>
                </div>
              </div>

              <div className="settings-field">
                <label>Display Name</label>
                <input type="text" className="input" placeholder="Your Name" defaultValue={state.user?.name} />
              </div>

              <div className="settings-field">
                <label>Short Bio</label>
                <textarea 
                  className="textarea" 
                  placeholder="Tell the world about your prompt engineering skills..." 
                  defaultValue={state.user?.bio}
                  maxLength={200}
                  style={{ minHeight: '100px' }}
                ></textarea>
                <p className="text-xs text-muted" style={{ textAlign: 'right', marginTop: '4px' }}>0/200</p>
              </div>

              <div className="settings-field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="settings-field">
                  <label>Website</label>
                  <input type="url" className="input" placeholder="https://yourlink.com" />
                </div>
                <div className="settings-field">
                  <label>X (Twitter) Handle</label>
                  <input type="text" className="input" placeholder="@username" />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-md)' }}>
                <button className="btn btn-primary btn-sm" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Update Profile</button>
              </div>
            </section>

            {/* Email Section */}
            <section className="settings-section card">
              <h3 className="settings-section-title">
                <Shield size={22} className="text-purple" /> 
                <span className="text-purple">Account Email</span>
              </h3>
              <div className="settings-field">
                <label>Email Address</label>
                <input type="email" className="input" defaultValue={state.user?.email} disabled />
                <p className="text-xs text-muted" style={{ marginTop: '8px' }}>Verified through {state.user?.provider === 'google' ? 'Google' : 'Email'}</p>
              </div>
            </section>

            {/* Account Actions */}
            <div className="settings-actions">
              <button className="btn btn-ghost text-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-pink)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }} onClick={logout}>
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
