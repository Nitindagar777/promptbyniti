/* AuthPage — Login & Signup with Google OAuth */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';
import './AuthPage.css';

const API_URL = '/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthPage() {
  // State managed by path and toggle
  const location = useLocation();
  const navigate = useNavigate();
  const { state, login } = useApp();

  // Auth guard: if already logged in, redirect to home
  useEffect(() => {
    if (state?.user) {
      navigate('/', { replace: true });
    }
  }, [state?.user, navigate]);

  // Derive mode from path or toggle state
  const pathMode = location.pathname === '/signup' ? 'signup' : 'login';
  const [isToggled, setIsToggled] = useState(false);
  const mode = isToggled ? (pathMode === 'login' ? 'signup' : 'login') : pathMode;

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // email | otp | password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsToggled(!isToggled);
    setIsForgotMode(false);
    setError('');
    setIsVerifying(false);
  };

  const toggleForgot = () => {
    setIsForgotMode(!isForgotMode);
    setResetStep('email');
    setError('');
    setIsVerifying(false);
  };

  // Auto-hide errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Google credential response
  const handleGoogleResponse = useCallback(async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (data.success) {
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          credits: data.user.credits,
          plan: data.user.plan,
          hasUsedFreePrompt: data.user.hasUsedFreePrompt
        }, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const data = await res.json();

      if (data.success) {
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          credits: data.user.credits,
          plan: data.user.plan,
          hasUsedFreePrompt: data.user.hasUsedFreePrompt
        }, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setError('New code sent to your email!');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Store the callback in a ref so useEffect doesn't depend on it
  const googleCallbackRef = useRef(handleGoogleResponse);
  googleCallbackRef.current = handleGoogleResponse;

  // Initialize Google Sign-In — only runs ONCE (module-level guard)
  useEffect(() => {
    const initGoogle = () => {
      if (window.__googleInitialized) return;

      if (window.google?.accounts?.id) {
        window.__googleInitialized = true;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => googleCallbackRef.current(response),
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.prompt(); // Auto-show One Tap
        renderGoogleButton();
      }
    };

    const renderGoogleButton = () => {
      const container = document.getElementById('google-btn-container');
      if (container && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with'
        });
      }
    };

    // Try immediately, or wait for the script to load
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(checkInterval);
        }
      }, 100);

      const timeoutId = setTimeout(() => clearInterval(checkInterval), 5000);
      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
      };
    }
  }, []); // Empty deps — runs only once

  // Trigger Google Sign-In (Manual Fallback removed, handled by native button)

  // Handle Forgot Password Flow
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (resetStep === 'email') {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();
        if (data.success) {
          setResetStep('otp');
        } else {
          setError(data.message || 'Error sending reset code');
        }
      } else if (resetStep === 'otp') {
        const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp })
        });
        const data = await res.json();
        if (data.success) {
          setResetStep('password');
        } else {
          setError(data.message || 'Invalid verification code');
        }
      } else if (resetStep === 'password') {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp, password: newPassword })
        });
        const data = await res.json();
        if (data.success) {
          login(data.user, data.token);
          navigate('/');
        } else {
          setError(data.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isForgotMode) return handleForgotPassword(e);
    if (isVerifying) return handleVerifyOTP(e);

    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        if (data.step === 'verify') {
          setIsVerifying(true);
          setError('');
        } else {
          login({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar,
            credits: data.user.credits,
            plan: data.user.plan,
            hasUsedFreePrompt: data.user.hasUsedFreePrompt
          }, data.token);
          navigate('/');
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error. Make sure the backend is running on port 8845.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEOHead title={isForgotMode ? "Reset Password" : mode === 'login' ? "Login" : "Sign Up"} noIndex={true} />
      <div className="auth-container">
        <div className={`auth-card ${mode === 'signup' ? 'auth-card--signup' : ''}`}>
          
          <div className="auth-header">
            <h1 className="auth-title">
              {isForgotMode ? (
                <>Reset <span style={{ color: 'var(--color-orange)' }}>Password</span></>
              ) : mode === 'login' ? (
                <>Welcome <span style={{ color: 'var(--color-cyan)' }}>Back</span></>
              ) : (
                <>Create <span style={{ color: 'var(--color-orange)' }}>Account</span></>
              )}
            </h1>
            <p className="auth-subtitle">
              {isForgotMode 
                ? 'Follow the steps to regain access to your account.'
                : mode === 'login' 
                  ? 'Sign in to access your prompts and tokens.'
                  : 'Join the ultimate AI prompt marketplace today.'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isForgotMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {resetStep === 'email' && (
                  <div className="auth-input-group">
                    <div className="auth-input-icon"><Mail size={18} /></div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="auth-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}
                
                {resetStep === 'otp' && (
                  <>
                    <div className="auth-input-group">
                      <div className="auth-input-icon"><Sparkles size={18} /></div>
                      <input
                        type="text"
                        placeholder="4-digit code"
                        required
                        maxLength={4}
                        className="auth-input auth-input--otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted" style={{ textAlign: 'center' }}>Enter code sent to {formData.email}</p>
                  </>
                )}

                {resetStep === 'password' && (
                  <div className="auth-input-group">
                    <div className="auth-input-icon"><Lock size={18} /></div>
                    <input
                      type="password"
                      placeholder="New Password"
                      required
                      minLength={6}
                      className="auth-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="btn auth-submit auth-submit--login" disabled={loading}>
                  {loading ? 'Processing...' : resetStep === 'email' ? 'Send Reset Code' : resetStep === 'otp' ? 'Verify Code' : 'Set New Password'}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <button type="button" className="auth-toggle" style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }} onClick={toggleForgot}>
                  ← Back to Login
                </button>
              </div>
            ) : isVerifying ? (
              <>
                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <Sparkles size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="0000"
                    required
                    maxLength={4}
                    className="auth-input auth-input--otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
                  Enter the code sent to {formData.email}
                </p>

                <button
                  type="submit"
                  className={`btn auth-submit ${mode === 'signup' ? 'auth-submit--signup' : 'auth-submit--login'}`}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <div className="auth-input-group">
                    <div className="auth-input-icon">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      className="auth-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="auth-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    className="auth-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {mode === 'login' && (
                  <div className="auth-forgot">
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); toggleForgot(); }}>Forgot password?</a>
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn auth-submit ${mode === 'signup' ? 'auth-submit--signup' : 'auth-submit--login'}`}
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </>
            )}

            {!isForgotMode && isVerifying && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="auth-toggle" 
                  style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', fontSize: '0.9rem', fontWeight: '600' }}
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Didn't get a code? Resend
                </button>
                <button 
                  type="button" 
                  className="auth-toggle" 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                  onClick={() => setIsVerifying(false)}
                >
                  ← Back to {mode === 'login' ? 'Login' : 'Signup'}
                </button>
              </div>
            )}
          </form>

          {!isForgotMode && (
            <>
              <div className="auth-divider">
                <span>Or continue with</span>
              </div>

              <div className="auth-social">
                <div id="google-btn-container"></div>
              </div>

              <div className="auth-footer">
                {mode === 'login' ? (
                  <p>Don't have an account? <span onClick={toggleMode} className="auth-toggle" style={{ color: 'var(--color-orange)' }}>Sign up</span></p>
                ) : (
                  <p>Already have an account? <span onClick={toggleMode} className="auth-toggle" style={{ color: 'var(--color-cyan)' }}>Log in</span></p>
                )}
              </div>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
}
