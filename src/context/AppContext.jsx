/* ============================================================
   APP CONTEXT — Global state for user, credits, prompts
   ============================================================ */

import { createContext, useContext, useReducer, useEffect } from 'react';

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
        const data = await res.json();
        
        if (!data.success) {
          // Token invalid or user banned
          localStorage.removeItem(TOKEN_KEY);
          dispatch({ type: actions.LOGOUT });
          if (data.message && data.message.toLowerCase().includes('banned')) {
            alert('Your account has been banned. You have been logged out.');
          }
        } else {
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* Hook */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
