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
          <p className="text-secondary">Manage your account preferences and security</p>
        </div>

        <div className="settings-grid">
          {/* Tabs Sidebar */}
          <div className="settings-sidebar">
            <button className="settings-tab settings-tab--active">
              <User size={18} />
              <span>Profile</span>
            </button>
            <button className="settings-tab">
              <Shield size={18} />
              <span>Security</span>
            </button>
            <button className="settings-tab">
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button className="settings-tab">
              <CreditCard size={18} />
              <span>Billing</span>
            </button>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* Profile Section */}
            <section className="settings-section card">
              <h3 className="settings-section-title">Profile Information</h3>
              <div className="settings-field">
                <label>Display Name</label>
                <input type="text" className="input" defaultValue="Niti Creator" />
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <input type="email" className="input" defaultValue="niti@example.com" />
              </div>
              <button className="btn btn-primary btn-sm">Save Changes</button>
            </section>

            {/* Privacy Section */}
            <section className="settings-section card">
              <h3 className="settings-section-title">Privacy & Display</h3>
              <div className="settings-toggle-field">
                <div>
                  <h4>Private Mode</h4>
                  <p className="text-sm text-muted">Hide your prompts from the public gallery</p>
                </div>
                <div className={`toggle ${state.isPrivateMode ? 'toggle--active' : ''} ${!isPremium ? 'toggle--locked' : ''}`}>
                  <div className="toggle-handle"></div>
                </div>
              </div>
              {!isPremium && (
                <p className="text-accent text-sm mt-2">
                  <Lock size={12} /> Private mode is a premium feature.
                </p>
              )}
            </section>

            {/* Appearance Section */}
            <section className="settings-section card">
              <h3 className="settings-section-title">Preference</h3>
              <div className="settings-toggle-field">
                <div>
                  <h4>Dark Mode</h4>
                  <p className="text-sm text-muted">Toggle between dark and light themes</p>
                </div>
                <div className="toggle toggle--active">
                  <div className="toggle-handle"></div>
                </div>
              </div>
            </section>

            {/* Account Actions */}
            <div className="settings-actions">
              <button className="btn btn-ghost text-danger" onClick={logout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
