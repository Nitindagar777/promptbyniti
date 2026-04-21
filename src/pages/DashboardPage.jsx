/* DashboardPage — User control center */
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { User, Zap, Crown, Settings, Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state, isPremium, deletePrompt } = useApp();
  const [copied, setCopied] = useState(null);

  const copyPrompt = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-user">
            <div className="dashboard-avatar">
              <User size={32} />
            </div>
            <div>
              <h1 className="dashboard-title">Welcome Back</h1>
              <p className="text-secondary">Manage your prompts and account</p>
            </div>
          </div>
          <Link to="/settings" className="btn btn-secondary">
            <Settings size={16} /> Settings
          </Link>
        </div>

        <div className="dashboard-grid">
          {/* Sidebar / Stats */}
          <div className="dashboard-sidebar">
            <div className="card dashboard-stat-card">
              <div className="stat-header">
                <h3>Your Plan</h3>
                {isPremium ? (
                 <span className="badge badge-warning"><Crown size={12}/> Premium</span>
                ) : (
                 <span className="badge badge-primary">Free Tier</span>
                )}
              </div>
              <div className="stat-value">
                {state.plan === 'unlimited' ? 'Studio' : state.plan === 'pro' ? 'Creator' : 'Starter'}
              </div>
              {!isPremium && (
                <Link to="/pricing" className="btn btn-primary btn-sm full-width mt-4">
                  Upgrade Plan
                </Link>
              )}
            </div>

            <div className="card dashboard-stat-card">
              <div className="stat-header">
                <h3>Available Credits</h3>
                <Zap size={16} className="text-accent" />
              </div>
              <div className="stat-value">
                {state.plan === 'unlimited' ? '∞' : state.credits}
              </div>
              <div className="progress-bar mt-sm">
                <div 
                  className="progress-fill" 
                  style={{ width: `${state.plan === 'unlimited' ? 100 : (state.credits / state.maxCredits) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Content / Prompts */}
          <div className="dashboard-content">
            <div className="content-header">
              <h2>Your Generated Prompts</h2>
              <span className="badge badge-primary">{state.prompts.length} total</span>
            </div>

            <div className="dashboard-prompts">
              {state.prompts.length === 0 ? (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <Zap size={32} />
                  </div>
                  <h3>No Prompts Yet</h3>
                  <p>Head to the generator to create your first masterpiece.</p>
                  <Link to="/generate" className="btn btn-primary mt-4">
                    Go to Generator
                  </Link>
                </div>
              ) : (
                state.prompts.map((prompt) => (
                  <div key={prompt.id} className="prompt-item card">
                    <div className="prompt-item__header">
                      <div className="prompt-item__meta">
                        <span className="badge">{prompt.structured?.subject || 'Prompt'}</span>
                        <span className="text-sm text-muted">
                          {new Date(prompt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <button 
                        className="btn-icon text-danger" 
                        onClick={() => deletePrompt(prompt.id)}
                        title="Delete Prompt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="prompt-item__body">
                      <p className="prompt-item__text">{prompt.mainPrompt}</p>
                    </div>

                    <div className="prompt-item__footer">
                      <span className="text-sm text-secondary">
                        Model: <strong className="text-primary">{prompt.model}</strong>
                      </span>
                      <button 
                        className={`btn ${copied === prompt.id ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        onClick={() => copyPrompt(prompt.mainPrompt, prompt.id)}
                      >
                        {copied === prompt.id ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy Prompt</>}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
