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
  credits: 0,
  maxCredits: 0,
  plan: 'free', // free | pro | unlimited
  prompts: [],
  marketplace: [],
  library: [],
  buyerStats: null,
  favorites: [],
  isPrivateMode: false,
  darkMode: true,
  scrollPositions: {}, // { '/path': scrollY }
  sellerStats: null,
  adminStats: null,
  adminSettings: null,
  adminPrompts: [],
  adminUsers: [],
  adminTransactions: [],
  adminWithdrawals: [],
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
  USE_FREE_PROMPT: 'USE_FREE_PROMPT',
  ADD_PROMPT: 'ADD_PROMPT',
  DELETE_PROMPT: 'DELETE_PROMPT',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  SET_PLAN: 'SET_PLAN',
  SET_PRIVATE_MODE: 'SET_PRIVATE_MODE',
  RESET_CREDITS: 'RESET_CREDITS',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ADD_PURCHASE: 'ADD_PURCHASE',
  SET_SCROLL: 'SET_SCROLL',
  PRELOAD_DATA: 'PRELOAD_DATA',
};

/* Reducer */
function appReducer(state, action) {
  switch (action.type) {
    case actions.SET_USER: {
      const updatedUser = action.payload;
      const updatedMarketplace = (state.marketplace || []).map(p => {
        const sellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        const userId = updatedUser?._id?.toString() || updatedUser?.id?.toString();
        if (userId && sellerId === userId) {
          const updatedSeller = typeof p.seller === 'object' && p.seller !== null
            ? { ...p.seller, socialLinks: updatedUser.socialLinks || {} }
            : p.seller;
          return {
            ...p,
            socialLinks: updatedUser.socialLinks || {},
            seller: updatedSeller
          };
        }
        return p;
      });
      const updatedPrompts = (state.prompts || []).map(p => {
        const sellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        const userId = updatedUser?._id?.toString() || updatedUser?.id?.toString();
        if (userId && sellerId === userId) {
          const updatedSeller = typeof p.seller === 'object' && p.seller !== null
            ? { ...p.seller, socialLinks: updatedUser.socialLinks || {} }
            : p.seller;
          return {
            ...p,
            socialLinks: updatedUser.socialLinks || {},
            seller: updatedSeller
          };
        }
        return p;
      });
      return { ...state, user: updatedUser, marketplace: updatedMarketplace, prompts: updatedPrompts };
    }

    case actions.USE_CREDIT:
      if (state.plan === 'unlimited') return state;
      const deductionAmount = action.payload || 1;
      return { ...state, credits: Math.max(0, state.credits - deductionAmount) };

    case actions.USE_FREE_PROMPT:
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          hasUsedFreePrompt: true
        }
      };

    case actions.ADD_PURCHASE:
      if (!state.user) return state;
      const currentPurchases = state.user.purchasedPrompts || [];
      if (currentPurchases.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          purchasedPrompts: [...currentPurchases, action.payload]
        }
      };

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
        free: 0,
        pro: 25,
        unlimited: 80,
      };
      return {
        ...state,
        plan: action.payload,
        credits: planCredits[action.payload] || 0,
        maxCredits: planCredits[action.payload] || 0,
        isPrivateMode: action.payload !== 'free',
      };
    }

    case actions.SET_PRIVATE_MODE:
      return { ...state, isPrivateMode: action.payload };

    case actions.RESET_CREDITS: {
      const planCredits = { free: 0, pro: 25, unlimited: 80 };
      return { ...state, credits: planCredits[state.plan] || 0 };
    }

    case actions.LOGIN: {
      const loggedInUser = action.payload;
      const updatedMarketplace = (state.marketplace || []).map(p => {
        const sellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        const userId = loggedInUser?._id?.toString() || loggedInUser?.id?.toString();
        if (userId && sellerId === userId) {
          const updatedSeller = typeof p.seller === 'object' && p.seller !== null
            ? { ...p.seller, socialLinks: loggedInUser.socialLinks || {} }
            : p.seller;
          return {
            ...p,
            socialLinks: loggedInUser.socialLinks || {},
            seller: updatedSeller
          };
        }
        return p;
      });
      const updatedPrompts = (state.prompts || []).map(p => {
        const sellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        const userId = loggedInUser?._id?.toString() || loggedInUser?.id?.toString();
        if (userId && sellerId === userId) {
          const updatedSeller = typeof p.seller === 'object' && p.seller !== null
            ? { ...p.seller, socialLinks: loggedInUser.socialLinks || {} }
            : p.seller;
          return {
            ...p,
            socialLinks: loggedInUser.socialLinks || {},
            seller: updatedSeller
          };
        }
        return p;
      });
      return {
        ...state,
        user: loggedInUser,
        credits: loggedInUser.credits ?? state.credits,
        plan: loggedInUser.plan ?? state.plan,
        marketplace: updatedMarketplace,
        prompts: updatedPrompts
      };
    }

    case 'UPDATE_MARKETPLACE_PROMPT': {
      const updatedPrompt = action.payload;
      const updatedMarketplace = (state.marketplace || []).map(p => {
        const pId = p._id?.toString() || p.id?.toString();
        const uId = updatedPrompt._id?.toString() || updatedPrompt.id?.toString();
        if (pId && uId && pId === uId) {
          return updatedPrompt;
        }
        return p;
      });
      return {
        ...state,
        marketplace: updatedMarketplace
      };
    }

    case 'UPDATE_CREATOR_FOLLOWERS': {
      const { creatorId, followersCount, currentUserId, isFollowing } = action.payload;
      
      const updateSellerFollowers = (seller) => {
        if (!seller) return seller;
        const sId = seller._id?.toString() || seller.id?.toString() || seller.toString();
        if (sId === creatorId) {
          let followers = seller.followers || [];
          if (isFollowing) {
            if (!followers.some(id => (id._id || id).toString() === currentUserId)) {
              followers = [...followers, currentUserId];
            }
          } else {
            followers = followers.filter(id => (id._id || id).toString() !== currentUserId);
          }
          return {
            ...seller,
            followers
          };
        }
        return seller;
      };

      const updatedMarketplace = (state.marketplace || []).map(p => {
        const pSellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        if (pSellerId === creatorId) {
          return {
            ...p,
            seller: typeof p.seller === 'object' && p.seller !== null ? updateSellerFollowers(p.seller) : p.seller
          };
        }
        return p;
      });

      const updatedPrompts = (state.prompts || []).map(p => {
        const pSellerId = p.seller?._id?.toString() || p.seller?.id?.toString() || p.seller?.toString();
        if (pSellerId === creatorId) {
          return {
            ...p,
            seller: typeof p.seller === 'object' && p.seller !== null ? updateSellerFollowers(p.seller) : p.seller
          };
        }
        return p;
      });

      return {
        ...state,
        marketplace: updatedMarketplace,
        prompts: updatedPrompts
      };
    }


    case actions.LOGOUT:
      return {
        ...defaultState,
        prompts: state.prompts,
      };

    case actions.SET_SCROLL:
      return {
        ...state,
        scrollPositions: {
          ...state.scrollPositions,
          [action.payload.path]: action.payload.pos
        }
      };

    case actions.PRELOAD_DATA:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

/* Provider */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);
  const [showBanModal, setShowBanModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [cache, setCache] = useState({}); // Transient API cache

  /* Persist specific parts of state to localStorage (Exclude heavy marketplace/library/prompts) */
  useEffect(() => {
    const { marketplace, library, buyerStats, sellerStats, adminPrompts, adminUsers, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [state]);

  /* Validate User Session on Mount */
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setAuthLoading(false);
        return;
      }

      console.log('🔄 Validating session with token:', 'Exists');
      try {
        const res = await fetch(`/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        if (!res.ok) {
          console.error('❌ Session validation failed:', res.status, res.statusText);
          if (res.status === 401 || res.status === 403) {
            const data = await res.json();
            console.warn('⚠️ Session invalid, logging out:', data.message);
            localStorage.removeItem(TOKEN_KEY);
            dispatch({ type: actions.LOGOUT });
            if (data.message && data.message.toLowerCase().includes('banned')) {
              setShowBanModal(true);
            }
          }
          setAuthLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success) {
          console.log('✅ Session verified successfully');
          dispatch({ type: actions.LOGIN, payload: data.user });
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    validateSession();
  }, []);



  /* Background Data Preloading (Marketplace & Stats) */
  useEffect(() => {
    const preload = async () => {
      const API_BASE = '/api';
      const token = localStorage.getItem(TOKEN_KEY);

      // 1. Preload Marketplace (Public)
      try {
        const mRes = await fetch(`${API_BASE}/prompts`);
        if (mRes.ok) {
          const mData = await mRes.json();
          dispatch({ 
            type: actions.PRELOAD_DATA, 
            payload: { marketplace: mData.prompts || [] } 
          });
        }
      } catch (err) {
        console.warn('Marketplace preload failed:', err);
      }

      // 2. Preload Buyer & Seller Stats (Authenticated)
      if (token) {
        try {
          const [bRes, sRes] = await Promise.all([
            fetch(`${API_BASE}/buyer/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/seller/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);
          
          let preloadPayload = {};

          if (bRes.ok) {
            const bData = await bRes.json();
            preloadPayload.library = bData.stats?.library || [];
            preloadPayload.buyerStats = bData.stats;
          }

          if (sRes.ok) {
            const sData = await sRes.json();
            preloadPayload.sellerStats = sData.stats;
          }

          if (Object.keys(preloadPayload).length > 0) {
            dispatch({ type: actions.PRELOAD_DATA, payload: preloadPayload });
          }
        } catch (err) {
          console.warn('Authenticated data preload failed:', err);
        }
      }
    };

    preload();
  }, [state.user?.id, state.user?.email]);

  /* 3. Preload Admin Data (Specific Admin only) - Dedicated Effect */
  useEffect(() => {
    const preloadAdmin = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const adminEmail = 'nitindagar0800@gmail.com';
      const isSystemAdmin = state.user?.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();

      if (token && isSystemAdmin) {
        const API_BASE = '/api';
        try {
          // Fetch all critical admin data in parallel for speed
          const [sRes, setRes, pRes, uRes, tRes, wRes] = await Promise.all([
            fetch(`${API_BASE}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/admin/prompts`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/admin/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/admin/withdrawals`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (sRes.ok) {
            const sData = await sRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminStats: sData.stats } });
          }
          if (setRes.ok) {
            const setData = await setRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminSettings: setData.settings } });
          }
          if (pRes.ok) {
            const pData = await pRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminPrompts: pData.prompts || [] } });
          }
          if (uRes.ok) {
            const uData = await uRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminUsers: uData.users || [] } });
          }
          if (tRes.ok) {
            const tData = await tRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminTransactions: tData.transactions || tData.data || [] } });
          }
          if (wRes.ok) {
            const wData = await wRes.json();
            dispatch({ type: actions.PRELOAD_DATA, payload: { adminWithdrawals: wData.withdrawals || wData.data || [] } });
          }
        } catch (err) {
          console.warn('Admin background preload failed:', err);
        }
      }
    };

    preloadAdmin();
  }, [state.user?.id, state.user?.email]);


  const value = {
    state,
    dispatch,
    /* Convenience helpers */
    useCredit: async (amount = 1, templateId = null, isFreePrompt = false) => {
      if (isFreePrompt) {
        dispatch({ type: actions.USE_FREE_PROMPT });
      } else {
        dispatch({ type: actions.USE_CREDIT, payload: amount });
      }
      if (templateId) {
        dispatch({ type: actions.ADD_PURCHASE, payload: templateId });
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await fetch(`/api/auth/use-credits`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, templateId, isFreePrompt })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            // Revert optimistic updates on failure
            console.error('Credit deduction failed:', data.message);
            // Re-fetch user to get accurate state
            try {
              const meRes = await fetch(`/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const meData = await meRes.json();
              if (meData.success) {
                dispatch({ type: actions.LOGIN, payload: meData.user });
              }
            } catch (e) { /* ignore */ }
            throw new Error(data.message || 'Transaction failed');
          }
          // Sync credits with server response
          if (data.credits !== undefined) {
            dispatch({ type: actions.SET_USER, payload: { ...state.user, credits: data.credits } });
          }
        } catch (err) {
          console.error('Failed to sync credits:', err);
          throw err; // Re-throw so calling code can handle it
        }
      }
    },
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
    authLoading,
    /* Caching & Scroll helpers */
    cache,
    setCachedData: (key, data) => setCache(prev => ({ ...prev, [key]: data })),
    setScroll: (path, pos) => dispatch({ type: actions.SET_SCROLL, payload: { path, pos } }),
    getScroll: (path) => state.scrollPositions[path] || 0
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
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
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
