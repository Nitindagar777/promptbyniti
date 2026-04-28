/* ============================================================
   APP CONTEXT — Global state for user, credits, prompts
   ============================================================ */

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const AppContext = createContext();

const STORAGE_KEY = 'promptbyniti_state';
const TOKEN_KEY = 'promptbyniti_token';

/* Default state */
const defaultState = {
  user: null,
  credits: 2,
  maxCredits: 2,
  plan: 'free', // free | pro | unlimited
  prompts: [],
  favorites: [],
  isPrivateMode: false,
  darkMode: true,
};

/* Load persisted state */
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (e) {
    // ignore
  }
  return defaultState;
}

/* Actions */
const actions = {
  SET_USER: 'SET_USER',
  USE_CREDIT: 'USE_CREDIT',
  ADD_PROMPT: 'ADD_PROMPT',
  DELETE_PROMPT: 'DELETE_PROMPT',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  SET_PLAN: 'SET_PLAN',
  SET_PRIVATE_MODE: 'SET_PRIVATE_MODE',
  RESET_CREDITS: 'RESET_CREDITS',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

/* Reducer */
function appReducer(state, action) {
  switch (action.type) {
    case actions.SET_USER:
      return { ...state, user: action.payload };

    case actions.USE_CREDIT:
      if (state.plan === 'unlimited') return state;
      const amount = action.payload || 1;
      return { ...state, credits: Math.max(0, state.credits - amount) };

    case actions.ADD_PROMPT:
      return {
        ...state,
        prompts: [action.payload, ...state.prompts],
      };

    case actions.DELETE_PROMPT:
      return {
        ...state,
        prompts: state.prompts.filter(p => p.id !== action.payload),
        favorites: state.favorites.filter(id => id !== action.payload),
      };

    case actions.TOGGLE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };

    case actions.SET_PLAN: {
      const planCredits = {
        free: 2,
        pro: 25,
        unlimited: 80,
      };
      return {
        ...state,
        plan: action.payload,
        credits: planCredits[action.payload] || 2,
        maxCredits: planCredits[action.payload] || 2,
        isPrivateMode: action.payload !== 'free',
      };
    }

    case actions.SET_PRIVATE_MODE:
      return { ...state, isPrivateMode: action.payload };

    case actions.RESET_CREDITS: {
      const planCredits = { free: 2, pro: 25, unlimited: 80 };
      return { ...state, credits: planCredits[state.plan] || 2 };
    }

    case actions.LOGIN:
      return {
        ...state,
        user: action.payload,
        credits: action.payload.credits ?? state.credits,
        plan: action.payload.plan ?? state.plan,
      };

    case actions.LOGOUT:
      return {
        ...defaultState,
        prompts: state.prompts,
      };

    default:
      return state;
  }
}

/* Provider */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);
  const [showBanModal, setShowBanModal] = useState(false);

  /* Persist to localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* Validate User Session on Mount */
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || !state.user) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            const data = await res.json();
            // Token invalid or user banned
            localStorage.removeItem(TOKEN_KEY);
            dispatch({ type: actions.LOGOUT });
            if (data.message && data.message.toLowerCase().includes('banned')) {
              setShowBanModal(true);
            }
          }
          return;
        }

        const data = await res.json();
        if (data.success) {
          // Optionally update user data
          dispatch({ type: actions.LOGIN, payload: data.user });
        }
      } catch (err) {
        console.error('Session validation error:', err);
      }
    };

    validateSession();
  }, []);

  const value = {
    state,
    dispatch,
    /* Convenience helpers */
    useCredit: (amount = 1) => dispatch({ type: actions.USE_CREDIT, payload: amount }),
    addPrompt: (prompt) => dispatch({ type: actions.ADD_PROMPT, payload: prompt }),
    deletePrompt: (id) => dispatch({ type: actions.DELETE_PROMPT, payload: id }),
    toggleFavorite: (id) => dispatch({ type: actions.TOGGLE_FAVORITE, payload: id }),
    setPlan: (plan) => dispatch({ type: actions.SET_PLAN, payload: plan }),
    login: (user, token) => {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      dispatch({ type: actions.LOGIN, payload: user });
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: actions.LOGOUT });
    },
    canGenerate: state.plan === 'unlimited' || state.credits > 0,
    isPremium: state.plan !== 'free',
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {showBanModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #ef4444',
            padding: '40px', borderRadius: '24px', maxWidth: '400px', width: '90%',
            textAlign: 'center', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#ef4444', fontSize: '2rem', marginBottom: '12px' }}>Account Suspended</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Your account has been banned due to a violation of our terms of service. You have been logged out.
            </p>
            <button 
              onClick={() => setShowBanModal(false)}
              style={{
                background: '#ef4444', color: 'white', border: 'none', padding: '12px 32px',
                borderRadius: '12px', fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                cursor: 'pointer', transition: 'all 0.2s', width: '100%'
              }}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

/* Hook */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
