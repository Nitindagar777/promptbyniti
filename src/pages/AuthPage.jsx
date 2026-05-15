/* AuthPage — Login & Signup with Google OAuth */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
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
          plan: data.user.plan
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
          plan: data.user.plan
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
      }
    };

    const renderGoogleButton = () => {
      // Native button rendering removed as per user request for a custom "small" button
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

  // Trigger Google Sign-In (Manual Fallback)
  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Last resort: manual popup
          const width = 500, height = 600;
          const left = window.screenX + (window.innerWidth - width) / 2;
          const top = window.screenY + (window.innerHeight - height) / 2;
          const redirectUri = encodeURIComponent(window.location.origin);
          const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token+id_token&scope=openid+email+profile&nonce=${Date.now()}`;
          const popup = window.open(url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);
          
          const checkPopup = setInterval(() => {
            try {
              if (popup.closed) {
                clearInterval(checkPopup);
                return;
              }
              if (popup.location.origin === window.location.origin) {
                const hash = popup.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const idToken = params.get('id_token');
                popup.close();
                clearInterval(checkPopup);
                if (idToken) {
                  handleGoogleResponse({ credential: idToken });
                }
              }
            } catch (e) {}
          }, 500);
        }
      });
    } else {
      setError('Google sign-in is loading. Please try again in a moment.');
    }
  };

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
            plan: data.user.plan
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
                <button className="auth-social-btn" onClick={handleGoogleClick} disabled={loading}>
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <div id="google-btn-container" style={{ display: 'none' }}></div>
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
