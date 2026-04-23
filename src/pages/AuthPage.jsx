/* AuthPage — Login & Signup */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Github, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AuthPage.css';

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useApp();

  useEffect(() => {
    if (location.pathname === '/login') setMode('login');
    if (location.pathname === '/signup') setMode('signup');
  }, [location.pathname]);

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login and redirect
    login({ name: 'User', email: 'user@example.com' });
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className={`auth-card ${mode === 'signup' ? 'auth-card--signup' : ''}`}>
          
          <div className="auth-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login' 
                ? 'Sign in to access your prompts and tokens.'
                : 'Join the ultimate AI prompt marketplace today.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <User size={18} />
                </div>
                <input type="text" placeholder="Full Name" required className="auth-input" />
              </div>
            )}

            <div className="auth-input-group">
              <div className="auth-input-icon">
                <Mail size={18} />
              </div>
              <input type="email" placeholder="Email Address" required className="auth-input" />
            </div>

            <div className="auth-input-group">
              <div className="auth-input-icon">
                <Lock size={18} />
              </div>
              <input type="password" placeholder="Password" required className="auth-input" />
            </div>

            {mode === 'login' && (
              <div className="auth-forgot">
                <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit">
              {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="auth-social">
            <button className="auth-social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="auth-social-btn">
              <Github size={20} />
              GitHub
            </button>
          </div>

          <div className="auth-footer">
            {mode === 'login' ? (
              <p>Don't have an account? <span onClick={toggleMode} className="auth-toggle">Sign up</span></p>
            ) : (
              <p>Already have an account? <span onClick={toggleMode} className="auth-toggle">Log in</span></p>
            )}
          </div>
          
        </div>
        
        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration--1"></div>
        <div className="auth-decoration auth-decoration--2"></div>
      </div>
    </div>
  );
}
