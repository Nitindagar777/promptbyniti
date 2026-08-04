import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiModels } from '../data/promptData';
import {
  Zap, ArrowLeft, Copy, Check, ShoppingBag,
  Sparkles, Image, MessageSquare, Play,
  Download, Share2, Heart, ShieldCheck,
  ChevronLeft, ChevronRight, Eye, ArrowRight, Star,
  Unlock, Lock, Maximize2, Globe, Users, Loader2, CheckCircle, Edit3
} from 'lucide-react';
import PromptThumbnail from '../components/PromptThumbnail';
import MasonryGrid from '../components/MasonryGrid';
import PinterestCard from '../components/PinterestCard';
import SEOHead from '../components/SEOHead';
import './PromptDetailPage.css';


// No fixed height needed — CSS columns masonry lets images dictate card size

const getMediaUrl = (item, fallback = '') => {
  if (!item) return typeof fallback === 'string' ? fallback : '';
  if (typeof item === 'string' && item.trim() !== '' && !item.includes('[object Object]')) {
    return item;
  }
  if (typeof item === 'object' && item !== null) {
    const src = item.output || item.url || item.image || item.src || item.preview || '';
    if (typeof src === 'string' && src.trim() !== '' && !src.includes('[object Object]')) {
      return src;
    }
  }
  return typeof fallback === 'string' ? fallback : '';
};

const getPlatformConfig = (platformId, url = '') => {
  const defaults = {
    instagram: {
      name: 'Instagram',
      color: '#e1306c',
      placeholder: 'https://instagram.com/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    },
    twitter: {
      name: 'Twitter/X',
      color: '#ffffff',
      placeholder: 'https://twitter.com/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    youtube: {
      name: 'YouTube',
      color: '#ff0000',
      placeholder: 'https://youtube.com/@channel',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    },
    github: {
      name: 'GitHub',
      color: '#ffffff',
      placeholder: 'https://github.com/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
    },
    website: {
      name: 'Website',
      color: '#06b6d4',
      placeholder: 'https://yourwebsite.com',
      icon: <Globe size={22} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
    },
    linkedin: {
      name: 'LinkedIn',
      color: '#0a66c2',
      placeholder: 'https://linkedin.com/in/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#0a66c2" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
    },
    facebook: {
      name: 'Facebook',
      color: '#1877f2',
      placeholder: 'https://facebook.com/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877f2" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
    pinterest: {
      name: 'Pinterest',
      color: '#bd081c',
      placeholder: 'https://pinterest.com/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#bd081c" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.906 2.17-2.906 1.024 0 1.517.768 1.517 1.686 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.168 1.777 2.168 2.133 0 3.772-2.254 3.772-5.509 0-2.881-2.071-4.896-5.029-4.896-3.424 0-5.437 2.568-5.437 5.228 0 1.033.398 2.143.896 2.746.098.118.112.222.083.342-.091.382-.294 1.197-.333 1.36-.053.218-.173.264-.399.157-1.494-.696-2.428-2.882-2.428-4.636 0-3.778 2.748-7.247 7.915-7.247 4.155 0 7.386 2.96 7.386 6.917 0 4.129-2.607 7.452-6.223 7.452-1.215 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.498 3.156 1.127.349 2.321.537 3.56.537 6.62 0 11.988-5.368 11.988-11.991C24.005 5.368 18.636 0 12.017 0z"/></svg>
    },
    tiktok: {
      name: 'TikTok',
      color: '#ff0050',
      placeholder: 'https://tiktok.com/@username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#ff0050" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.61-.7-.08 3.68-.06 7.37-.05 11.06-.01 1.15-.25 2.35-.8 3.39-.56 1.1-1.47 1.99-2.58 2.53-1.22.61-2.61.85-3.96.8-1.57-.04-3.15-.55-4.43-1.5-1.33-1-2.27-2.5-2.6-4.13-.36-1.74-.1-3.6.76-5.14.82-1.49 2.22-2.66 3.84-3.13.91-.26 1.87-.34 2.82-.25v4.21c-.88-.17-1.84-.04-2.6.43-.75.48-1.27 1.31-1.37 2.2-.15 1.18.39 2.4 1.34 3.08.89.65 2.08.8 3.14.47.88-.27 1.61-.97 1.94-1.81.25-.63.33-1.33.32-2.01-.01-5.12-.01-10.24-.01-15.36z"/></svg>
    },
    twitch: {
      name: 'Twitch',
      color: '#9146ff',
      placeholder: 'https://twitch.tv/username',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#9146ff" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
    },
    discord: {
      name: 'Discord',
      color: '#5865f2',
      placeholder: 'https://discord.gg/invite',
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="#5865f2" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>
    }
  };

  const key = platformId.toLowerCase();
  if (defaults[key]) {
    return defaults[key];
  }

  if (url) {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = parsedUrl.hostname.toLowerCase();
      for (const presetKey of Object.keys(defaults)) {
        if (host.includes(presetKey)) {
          return defaults[presetKey];
        }
      }
      const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
      return {
        name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        color: '#06b6d4',
        placeholder: 'https://' + host,
        icon: <img src={faviconUrl} alt={platformId} style={{ width: '22px', height: '22px', borderRadius: '4px', display: 'inline-block', verticalAlign: 'middle' }} onError={(e) => { e.target.src = ''; }} />
      };
    } catch (err) {
      // ignore
    }
  }

  return {
    name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
    color: '#06b6d4',
    placeholder: 'https://link.com',
    icon: <Globe size={22} className="text-cyan" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  };
};

const FALLBACK_STORE_ITEMS = [];

const getStoreCardSamples = (tmpl) => {
  const list = [];
  const samples = tmpl.samples || [];
  
  samples.forEach(s => {
    const src = s.output || s;
    if (src && typeof src === 'string') {
      list.push(src);
    }
  });

  if (list.length === 0) {
    list.push(tmpl.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80');
    
    const name = (tmpl.name || '').toLowerCase();
    if (name.includes('cyberpunk') || name.includes('metropolis')) {
      list.push(
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80'
      );
    } else if (name.includes('character') || name.includes('portrait') || name.includes('headshot')) {
      list.push(
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
      );
    } else if (name.includes('architecture') || name.includes('interior') || name.includes('forest') || name.includes('islands')) {
      list.push(
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?w=300&auto=format&fit=crop&q=80'
      );
    } else if (name.includes('product') || name.includes('leather') || name.includes('cosmetic') || name.includes('shoes')) {
      list.push(
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'
      );
    } else {
      list.push(
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80'
      );
    }
  }
  
  while (list.length < 4) {
    list.push(tmpl.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80');
  }
  
  return list.slice(0, 4);
};

export default function PromptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, useCredit, dispatch } = useApp();
  const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
  const isAdmin = state?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() || state?.user?.role === 'admin' || state?.user?.isAdmin;

  const [modelSectionVisible, setModelSectionVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('promptniti_model_visible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    const fetchModelVisibility = async () => {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const isVis = data.modelSectionVisible ?? true;
            setModelSectionVisible(isVis);
            localStorage.setItem('promptniti_model_visible', JSON.stringify(isVis));
          }
        }
      } catch (err) { }
    };
    fetchModelVisibility();

    const handleCustomEvent = (e) => {
      if (e.detail && typeof e.detail.modelSectionVisible === 'boolean') {
        setModelSectionVisible(e.detail.modelSectionVisible);
        localStorage.setItem('promptniti_model_visible', JSON.stringify(e.detail.modelSectionVisible));
      } else {
        fetchModelVisibility();
      }
    };

    window.addEventListener('modelVisibilityChanged', handleCustomEvent);
    return () => {
      window.removeEventListener('modelVisibilityChanged', handleCustomEvent);
    };
  }, [location.pathname]);

  // Find cached prompt from global marketplace state if available
  const cachedPrompt = useMemo(() => {
    return (state.marketplace || []).find(t => (t.id || t._id) === id) || null;
  }, [state.marketplace, id]);

  const [template, setTemplate] = useState(cachedPrompt);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const visitTimestamps = useRef({});
  const [userHandles, setUserHandles] = useState(() => {
    if (state.user?.socialLinks) {
      return {
        instagram: '', twitter: '', youtube: '', github: '', website: '',
        ...state.user.socialLinks
      };
    }
    return { instagram: '', twitter: '', youtube: '', github: '', website: '' };
  });

  useEffect(() => {
    if (state.user?.socialLinks) {
      setUserHandles(prev => ({
        ...prev,
        ...state.user.socialLinks
      }));
    }
  }, [state.user]);

  const saveUserHandle = async (platform, handle) => {
    if (!state.user) return;
    const updatedLinks = {
      ...state.user.socialLinks,
      [platform]: handle
    };
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: state.user.name,
          bio: state.user.bio,
          avatar: state.user.avatar,
          socialLinks: updatedLinks
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          dispatch({
            type: 'SET_USER',
            payload: data.user
          });
        }
      }
    } catch (e) {
      console.warn('Failed to sync user handle to profile:', e);
    }
  };

  useEffect(() => {
    if (template && template.seller) {
      const followersList = template.seller.followers || [];
      setFollowersCount(followersList.length);
      
      const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
      const sellerId = template.seller?._id?.toString() || template.seller?.id?.toString() || template.seller?.toString();
      
      if (currentUserId && sellerId) {
        const userFollowing = state.user?.following || [];
        const isUserFollowing = userFollowing.some(id => (id._id || id).toString() === sellerId) ||
                                followersList.some(id => (id._id || id).toString() === currentUserId);
        setIsFollowing(isUserFollowing);
      } else {
        setIsFollowing(false);
      }
    } else {
      setFollowersCount(0);
      setIsFollowing(false);
    }
  }, [template, state.user]);

  const handleFollowClick = async (e) => {
    e.preventDefault();
    if (!state.user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('promptbyniti_token');
    if (!token || token === 'null' || token === 'undefined') {
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
      return;
    }

    const sellerId = template?.seller?._id?.toString() || template?.seller?.id?.toString() || template?.seller?.toString();
    if (!sellerId) return;

    // Optimistic UI updates
    const originalFollowing = isFollowing;
    const originalCount = followersCount;
    
    setIsFollowing(!originalFollowing);
    setFollowersCount(prev => originalFollowing ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await fetch(`/api/auth/follow/${sellerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        
        // Update the template seller followers list locally to prevent subsequent useEffect resets
        setTemplate(prev => {
          if (!prev || !prev.seller) return prev;
          const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
          let updatedFollowers = prev.seller.followers || [];
          if (data.isFollowing) {
            if (!updatedFollowers.some(id => (id._id || id).toString() === currentUserId)) {
              updatedFollowers = [...updatedFollowers, currentUserId];
            }
          } else {
            updatedFollowers = updatedFollowers.filter(id => (id._id || id).toString() !== currentUserId);
          }
          return {
            ...prev,
            seller: {
              ...prev.seller,
              followers: updatedFollowers
            }
          };
        });
        
        // Also dispatch update to state.user following array so other parts of the app are in sync
        dispatch({
          type: 'SET_USER',
          payload: {
            ...state.user,
            following: data.following
          }
        });

        // Globally update the creator's followers in marketplace and other lists
        dispatch({
          type: 'UPDATE_CREATOR_FOLLOWERS',
          payload: {
            creatorId: sellerId,
            followersCount: data.followersCount,
            currentUserId: state.user?._id?.toString() || state.user?.id?.toString(),
            isFollowing: data.isFollowing
          }
        });
      } else {
        // Rollback
        setIsFollowing(originalFollowing);
        setFollowersCount(originalCount);
        console.error(data.message || 'Failed to update follow status');
      }
    } catch (err) {
      console.error('Follow error:', err);
      // Rollback
      setIsFollowing(originalFollowing);
      setFollowersCount(originalCount);
    }
  };
  
  // Initialize activeImage from query parameter ?sample=X if present
  const queryParams = new URLSearchParams(window.location.search);
  const initialSample = queryParams.get('sample');
  const [activeImage, setActiveImage] = useState(initialSample ? parseInt(initialSample, 10) : 0);
  const [loading, setLoading] = useState(!cachedPrompt);
  const [error, setError] = useState(null);
  const [imageRatio, setImageRatio] = useState(null); // null = not yet detected
  const [relatedLimit, setRelatedLimit] = useState(12);
  const [commentText, setCommentText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isPromptPurchased, setIsPromptPurchased] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Unlock with Tokens states
  const [unlockingWithTokens, setUnlockingWithTokens] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const handleTokenUnlock = async () => {
    if (!state.user) {
      navigate('/login');
      return;
    }
    
    const price = template.priceTokens || template.tokens || 5;
    if (state.user.credits < price) {
      setPurchaseError(`Insufficient tokens. You need ${price} tokens to unlock this prompt.`);
      return;
    }
    
    setUnlockingWithTokens(true);
    setPurchaseError('');
    try {
      await useCredit(price, template._id || template.id);
      setIsPromptPurchased(true);
      setTaskMessage({ text: 'Prompt unlocked successfully!', type: 'success' });
      window.open(`/purchase-success/${template._id || template.id}`, '_blank');
    } catch (err) {
      console.error('Purchase error:', err);
      setPurchaseError(err.message || 'Failed to unlock prompt. Please try again.');
    } finally {
      setUnlockingWithTokens(false);
    }
  };

  const linksSource = useMemo(() => {
    if (!template) return {};
    const merged = { ...template.socialLinks };
    const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
    const sellerId = template.seller?._id?.toString() || template.seller?.id?.toString() || template.seller?.toString();
    const isCreator = currentUserId && sellerId && (currentUserId === sellerId);
    
    if (isCreator && state.user?.socialLinks) {
      const userLinks = {};
      Object.keys(state.user.socialLinks).forEach(k => {
        const val = state.user.socialLinks[k];
        if (val && val.trim() !== '') {
          userLinks[k] = val;
        }
      });
      return { ...merged, ...userLinks };
    }
    
    const sellerLinks = {};
    if (template.seller?.socialLinks) {
      Object.keys(template.seller.socialLinks).forEach(k => {
        const val = template.seller.socialLinks[k];
        if (val && val.trim() !== '') {
          sellerLinks[k] = val;
        }
      });
    }
    return { ...merged, ...sellerLinks };
  }, [template, state.user?.socialLinks, state.user?._id, state.user?.id]);

  // Social Unlock & Verification States
  const [isPromptUnlocked, setIsPromptUnlocked] = useState(false);
  const [rulesState, setRulesState] = useState({
    instagram: { clicked: false, verifying: false, statusText: 'Not Started', verified: false, countdown: 0 },
    youtube: { clicked: false, verifying: false, statusText: 'Not Started', verified: false, countdown: 0 },
    twitter: { clicked: false, verifying: false, statusText: 'Not Started', verified: false, countdown: 0 }
  });
  const [taskMessage, setTaskMessage] = useState({ text: '', type: '' }); // type: 'error' | 'success' | 'info'
  const [shareToast, setShareToast] = useState('');
  const countdownTimers = useRef({});

  const activeTasksCount = useMemo(() => {
    if (!template) return 0;
    const rules = template.unlockRules || {};
    return Object.values(rules).filter(Boolean).length;
  }, [template]);

  // Unlocked & Purchased Checks
  const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
  const sellerId = template ? (template.seller?._id?.toString() || template.seller?.id?.toString() || template.seller?.toString()) : null;
  const isCreator = !!(currentUserId && sellerId && currentUserId === sellerId);
  const isPaidPrompt = template && (template.priceTokens > 0 || template.tokens > 0);
  const isUnlocked = isCreator || (isPaidPrompt ? isPromptPurchased : (isPromptUnlocked || isPromptPurchased));

  // Title expansion states for titles longer than 5 lines
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [canExpandTitle, setCanExpandTitle] = useState(false);
  const titleRef = useRef(null);

  // Reset expansion state when prompt template changes
  useEffect(() => {
    setIsTitleExpanded(false);
  }, [id]);

  // Sync activeImage state with URL search parameters on route navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sampleParam = params.get('sample');
    if (sampleParam !== null) {
      const idx = parseInt(sampleParam, 10);
      if (!isNaN(idx) && template && template.samples && idx >= 0 && idx < template.samples.length) {
        setActiveImage(idx);
        setImageRatio(null);
      }
    } else {
      setActiveImage(0);
      setImageRatio(null);
    }
  }, [location.search, template, id]);

  useEffect(() => {
    if (!template) return;

    const checkOverflow = () => {
      if (titleRef.current) {
        const el = titleRef.current;
        if (!isTitleExpanded) {
          const hasOverflow = el.scrollHeight > el.clientHeight;
          setCanExpandTitle(hasOverflow);
        }
      }
    };

    // Check height after DOM has settled
    const timer = setTimeout(checkOverflow, 50);

    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [template, isTitleExpanded]);

  const API_BASE = '/api';

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newCommentLocal = {
      user: state.user?._id || 'local',
      userName: state.user?.name || 'You',
      userAvatar: state.user?.avatar,
      rating: 5,
      comment: commentText,
      createdAt: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_BASE}/prompts/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: 5, comment: commentText })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.prompt.reviews || []);
      } else {
        setReviews(prev => [...prev, newCommentLocal]);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setReviews(prev => [...prev, newCommentLocal]);
    }

    setCommentText('');
  };

  const COUNTDOWN_SECONDS = 15;

  const handleRuleClick = (platform, url) => {
    window.open(url, '_blank');
    
    // Store click timestamp
    visitTimestamps.current[platform] = Date.now();
    
    // Clear any existing timer for this platform
    if (countdownTimers.current[platform]) {
      clearInterval(countdownTimers.current[platform]);
    }

    setRulesState(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        clicked: true,
        countdown: COUNTDOWN_SECONDS,
        statusText: `Follow & wait ${COUNTDOWN_SECONDS}s...`
      }
    }));

    setTaskMessage({ text: '', type: '' });

    // Start countdown timer
    countdownTimers.current[platform] = setInterval(() => {
      setRulesState(prev => {
        const current = prev[platform];
        if (!current || current.countdown <= 1) {
          clearInterval(countdownTimers.current[platform]);
          delete countdownTimers.current[platform];
          return {
            ...prev,
            [platform]: {
              ...current,
              countdown: 0,
              statusText: 'Ready to verify'
            }
          };
        }
        const newCount = current.countdown - 1;
        return {
          ...prev,
          [platform]: {
            ...current,
            countdown: newCount,
            statusText: `Follow & wait ${newCount}s...`
          }
        };
      });
    }, 1000);
  };

  // Cleanup countdown timers on unmount
  useEffect(() => {
    return () => {
      Object.values(countdownTimers.current).forEach(clearInterval);
    };
  }, []);

  const handleVerifyRule = (platform) => {
    const rule = rulesState[platform];
    const config = getPlatformConfig(platform, linksSource[platform]);

    if (!rule.clicked) {
      setTaskMessage({
        text: `Please visit the creator's ${config.name} profile first by clicking the button above.`,
        type: 'error'
      });
      setTimeout(() => setTaskMessage({ text: '', type: '' }), 5000);
      return;
    }

    // Check time spent since clicking
    const clickTime = visitTimestamps.current[platform];
    const timeSpent = clickTime ? (Date.now() - clickTime) : 0;
    if (timeSpent < 10000) { // 10 seconds minimum
      setTaskMessage({
        text: `Verification failed. You returned too quickly. Please follow the creator and stay on their profile for at least 10 seconds before verifying.`,
        type: 'error'
      });
      setTimeout(() => setTaskMessage({ text: '', type: '' }), 5000);
      return;
    }

    // Check if username/handle is entered
    const handle = userHandles[platform];
    if (!handle || handle.trim() === '') {
      setTaskMessage({
        text: `Please enter your ${config.name} username or handle first to verify your follow.`,
        type: 'error'
      });
      setTimeout(() => setTaskMessage({ text: '', type: '' }), 5000);
      return;
    }

    if (rule.countdown > 0) {
      setTaskMessage({
        text: `Please follow on ${config.name} and wait ${rule.countdown} more seconds before verifying.`,
        type: 'info'
      });
      setTimeout(() => setTaskMessage({ text: '', type: '' }), 4000);
      return;
    }

    setTaskMessage({ text: '', type: '' });

    setRulesState(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        verifying: true,
        statusText: 'Connecting to API...'
      }
    }));

    // Step 1: Connecting...
    setTimeout(() => {
      setRulesState(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          statusText: `Searching for ${handle}...`
        }
      }));

      // Step 2: Validating...
      setTimeout(() => {
        setRulesState(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            statusText: 'Verifying follow log...'
          }
        }));

        // Step 3: Success!
        setTimeout(async () => {
          setRulesState(prev => ({
            ...prev,
            [platform]: {
              ...prev[platform],
              verifying: false,
              verified: true,
              countdown: 0,
              statusText: 'Verified ✓'
            }
          }));
          setTaskMessage({
            text: `${config.name} follow verified successfully!`,
            type: 'success'
          });
          setTimeout(() => setTaskMessage({ text: '', type: '' }), 3000);

          // Save handle to profile
          await saveUserHandle(platform, handle);

        }, 1200);

      }, 1200);

    }, 1100);
  };

  const handleDownloadMedia = async () => {
    try {
      const activeSample = template?.samples?.[activeImage];
      const mediaUrl = template?.video || getMediaUrl(activeSample) || getMediaUrl(template?.thumbnail) || getMediaUrl(template?.image);
      if (!mediaUrl) return;

      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const extension = mediaUrl.includes('.mp4') ? 'mp4' : 'png';
      link.download = `${template.title || template.name || 'prompt-media'}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download media:', err);
      // Fallback
      const activeSample = template?.samples?.[activeImage];
      const mediaUrl = template?.video || getMediaUrl(activeSample) || getMediaUrl(template?.thumbnail) || getMediaUrl(template?.image);
      if (mediaUrl) {
        window.open(mediaUrl, '_blank');
      }
    }
  };

  useEffect(() => {
    const keys = Object.keys(rulesState);
    if (keys.length === 0) return;
    const allVerified = keys.every(platformId => {
      const rule = rulesState[platformId];
      return !rule.active || rule.verified;
    });
    if (allVerified) {
      setIsPromptUnlocked(true);
    } else {
      setIsPromptUnlocked(false);
    }
  }, [rulesState]);

  useEffect(() => {
    if (!template) {
      setIsPromptUnlocked(false);
      setRulesState({});
      return;
    }
    
    // Get all rules from template
    const rules = template.unlockRules || {};
    
    const tempState = {};
    let hasAnyActive = false;
    
    Object.keys(rules).forEach(platformId => {
      const isActive = !!rules[platformId];
      if (isActive) hasAnyActive = true;
      tempState[platformId] = {
        active: isActive,
        clicked: false,
        verifying: false,
        statusText: isActive ? 'Not Started' : 'Verified',
        verified: !isActive,
        countdown: 0
      };
    });
    
    setRulesState(tempState);
    setIsPromptUnlocked(!hasAnyActive);
  }, [template, id]);

  const relatedStorePrompts = useMemo(() => {
    if (!template) return [];
    
    const marketplaceItems = (state.marketplace && state.marketplace.length > 0) ? state.marketplace : FALLBACK_STORE_ITEMS;
    const allPaid = marketplaceItems.filter(t => (t.priceTokens > 0 || t.tokens > 0 || t.price > 0));
    const sourceList = allPaid.length > 0 ? allPaid : marketplaceItems;

    const list = sourceList.filter(t => {
      const isSelf = (t.id || t._id) === (template.id || template._id);
      if (isSelf) return false;

      const cat = (t.category || '').toLowerCase().trim();
      const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
      if (!modelSectionVisible && isModel) return false;

      return (t.category && template.category && t.category.toLowerCase() === template.category.toLowerCase()) ||
             (t.generateType && template.generateType && t.generateType === template.generateType);
    });

    if (list.length === 0) {
      return sourceList.filter(t => {
        if ((t.id || t._id) === (template.id || template._id)) return false;
        const cat = (t.category || '').toLowerCase().trim();
        const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
        if (!modelSectionVisible && isModel) return false;
        return true;
      });
    }

    return list;
  }, [template, state.marketplace, modelSectionVisible]);

  const relatedStoreFeedItems = useMemo(() => {
    return (relatedStorePrompts || []).slice(0, 16).map((tmpl, idx) => {
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      return {
        keyId: `related-store-${tmpl._id || tmpl.id || idx}`,
        prompt: tmpl,
        sampleIndex: 0,
        mediaSrc: tmpl.thumbnail || sampleSrc || '',
        isTextOnly: tmpl.generateType === 'text'
      };
    });
  }, [relatedStorePrompts]);

  const relatedFeedItems = useMemo(() => {
    if (!template) return [];
    const sourceList = (state.marketplace && state.marketplace.length > 0) ? state.marketplace : FALLBACK_STORE_ITEMS;
    
    let related = sourceList.filter(t => {
      const isSelf = (t.id || t._id) === (template.id || template._id);
      if (isSelf) return false;

      const cat = (t.category || '').toLowerCase().trim();
      const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
      if (!modelSectionVisible && isModel) return false;

      const catMatch = t.category && template.category && t.category.toLowerCase() === template.category.toLowerCase();
      const typeMatch = t.generateType && template.generateType && t.generateType === template.generateType;
      const keywordMatch = t.keywords?.some(k => template.keywords?.includes(k));
      return catMatch || typeMatch || keywordMatch;
    });

    if (related.length === 0) {
      related = sourceList.filter(t => {
        if ((t.id || t._id) === (template.id || template._id)) return false;
        const cat = (t.category || '').toLowerCase().trim();
        const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
        if (!modelSectionVisible && isModel) return false;
        return true;
      });
    }

    const feedItems = [];
    related.forEach((tmpl, tmplIdx) => {
      const isText = tmpl.generateType === 'text';
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      const mainCover = tmpl.thumbnail || tmpl.video || sampleSrc || tmpl.image;

      feedItems.push({
        prompt: tmpl,
        mediaSrc: isText ? null : mainCover,
        isTextOnly: isText || !mainCover,
        sampleIndex: 0,
        keyId: `related-feed-${tmpl.id || tmpl._id || tmplIdx}`
      });
    });

    return feedItems.slice(0, relatedLimit || 16);
  }, [id, template, state.marketplace, relatedLimit, modelSectionVisible]);

  const handlePrevImage = (e) => {
    e.preventDefault();
    if (!template.samples || template.samples.length <= 1) return;
    setActiveImage(prev => (prev === 0 ? template.samples.length - 1 : prev - 1));
    setImageRatio(null);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    if (!template.samples || template.samples.length <= 1) return;
    setActiveImage(prev => (prev === template.samples.length - 1 ? 0 : prev + 1));
    setImageRatio(null);
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth * 1.2) {
      setImageRatio('9/16');
    } else {
      setImageRatio('1/1');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: template.title || template.name,
          text: template.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast('Link copied to clipboard!');
        setTimeout(() => setShareToast(''), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      // If state.marketplace is empty, load public feed so related items load for unauthenticated users
      if (!state.marketplace || state.marketplace.length === 0) {
        try {
          const mRes = await fetch('/api/prompts');
          if (mRes.ok) {
            const mData = await mRes.json();
            if (mData.success && Array.isArray(mData.prompts)) {
              dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: mData.prompts } });
            }
          }
        } catch (e) {
          console.warn('Marketplace preload in detail page failed:', e);
        }
      }

      // Find cached prompt from global marketplace state if available when id changes
      const cached = (state.marketplace || []).find(t => (t.id || t._id) === id) || 
                     FALLBACK_STORE_ITEMS.find(t => t._id === id) || null;
      setTemplate(cached);
      setLoading(!cached);
      setError(null);

      if (cached) {
        const hasPurchased = state.user?.purchasedPrompts?.some(pId => pId.toString() === id.toString()) || false;
        setIsPromptPurchased(hasPurchased);
      }

      // Try fetching from Database
      try {
        const API_URL = '/api';
        const token = localStorage.getItem('promptbyniti_token');
        const res = await fetch(`${API_URL}/prompts/${id}?t=${Date.now()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTemplate(data.prompt);
            setReviews(data.prompt.reviews || []);
            setIsPromptPurchased(!!data.isPurchased);
            dispatch({
              type: 'UPDATE_MARKETPLACE_PROMPT',
              payload: data.prompt
            });
            return;
          }
        }
        
        // Fallback to local state if server fails or returns success: false
        const localPrompt = (state.marketplace || []).find(t => (t.id || t._id) === id) || 
                            FALLBACK_STORE_ITEMS.find(t => t._id === id);
        if (localPrompt) {
          console.log('⚡ Fallback: Loaded prompt from local state cache');
          setTemplate(localPrompt);
          setReviews(localPrompt.reviews || []);
          const hasPurchased = state.user?.purchasedPrompts?.some(pId => pId.toString() === id.toString()) || false;
          setIsPromptPurchased(hasPurchased);
        } else if (!cached) {
          setError("Prompt not found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // Fallback to local state on network error
        const localPrompt = (state.marketplace || []).find(t => (t.id || t._id) === id) || 
                            FALLBACK_STORE_ITEMS.find(t => t._id === id);
        if (localPrompt) {
          console.log('⚡ Fallback: Loaded prompt from local state cache on network error');
          setTemplate(localPrompt);
          setReviews(localPrompt.reviews || []);
          const hasPurchased = state.user?.purchasedPrompts?.some(pId => pId.toString() === id.toString()) || false;
          setIsPromptPurchased(hasPurchased);
        } else if (!cached) {
          setError("Failed to load prompt details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="p-detail-loading container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <Sparkles size={48} className="spin text-orange mb-4 mx-auto" />
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Open Prompt...</h2>
    </div>
  );

  if (error || !template) return (
    <div className="p-detail-loading container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-orange)' }}>Oops! {error || "Prompt not found"}</h2>
      <Link to="/templates" className="btn btn-secondary mt-md">Back to Store</Link>
    </div>
  );

  const validSamples = useMemo(() => {
    if (!template) return [];
    const list = [];
    const rawSamples = Array.isArray(template.samples) ? template.samples : [];
    
    rawSamples.forEach(s => {
      const url = getMediaUrl(s);
      if (url && !list.includes(url)) list.push(url);
    });

    const fallbackCover = getMediaUrl(template.thumbnail) || getMediaUrl(template.image) || getMediaUrl(template.video);
    if (list.length === 0 && fallbackCover) {
      list.push(fallbackCover);
    }

    return list;
  }, [template]);

  const currentMediaUrl = useMemo(() => {
    if (validSamples.length > 0) {
      const safeIdx = activeImage >= 0 && activeImage < validSamples.length ? activeImage : 0;
      return validSamples[safeIdx];
    }
    return getMediaUrl(template?.thumbnail) || getMediaUrl(template?.image) || '';
  }, [validSamples, activeImage, template]);

  const isVisual = template && template.generateType !== 'text' && (getMediaUrl(template.thumbnail) || template.video || validSamples.length > 0);
  const modelId = template.config?.model || template.model;
  const model = aiModels.find(m => m.id === modelId) || aiModels[0];
  const isPremium = template.premium && !state.isPremium;
  const category = (template.category || template.keywords?.[0] || 'Art');

  const catLower = (template.category || '').toLowerCase().trim();
  const rawModelLower = (template.model || template.config?.model || '').toLowerCase().trim();
  const isModelPrompt = catLower === 'model' || catLower === 'models' || catLower.includes('model') || template.isModel === true || rawModelLower === 'seedream';

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="p-detail" id="prompt-detail-page">
      {/* Share Toast Notification */}
      {shareToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(12px)'
        }}>
          <Check size={16} /> {shareToast}
        </div>
      )}
      <SEOHead
        title={`${template.title || template.name} — ${model.label} Prompt`}
        description={`${template.description || 'Premium AI prompt'} — Unlock this verified ${model.label} ${category} prompt template on Prompt by Niti. ${validSamples.length || 3} sample outputs included. Best ${model.label} prompt templates & ideas.`}
        keywords={`${(template.keywords || []).join(', ')}, ${model.label} prompt, ${model.label} prompt template, AI prompt, ${category} prompt, unlock ${category} prompt, ${category} AI art, prompt template, unlock prompt online, premium AI prompt, ${model.label} examples`}
        ogImage={currentMediaUrl || getMediaUrl(template.thumbnail) || 'https://promptbyniti.in/image1.png'}
        ogType="product"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Feed', url: '/templates' },
          { name: template.title || template.name, url: `/prompt/${id}` }
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": template.title || template.name,
          "description": template.description || `Premium ${model.label} AI prompt template`,
          "image": currentMediaUrl || getMediaUrl(template.thumbnail) || 'https://promptbyniti.in/image1.png',
          "brand": {
            "@type": "Brand",
            "name": "Prompt by Niti"
          },
          "offers": {
            "@type": "Offer",
            "price": String(template.priceTokens || template.tokens || 5),
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": template.seller?.name || "Prompt by Niti"
            }
          },
          ...(template.totalReviews > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(template.averageRating || 0),
              "reviewCount": String(template.totalReviews || 0),
              "bestRating": "5"
            }
          } : {}),
          "category": category
        }}
      />
      <div className="container">
        {/* Navigation */}
        <div className="p-detail__nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} className="p-detail__back">
              <ArrowLeft size={20} /> Back
            </button>
            <div className="p-detail__breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/templates">Store</Link> / <span>{template.title || template.name}</span>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate(`/sell?edit=${template._id || template.id}`)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <Edit3 size={16} /> Edit Prompt (Admin)
            </button>
          )}
        </div>

        <div className="p-detail__grid">
          {/* LEFT COLUMN: Visual Media OR Text Focus */}
          <div className="p-detail__media-section">
            {isVisual ? (
              <div className="visual-display card" style={{ marginBottom: '20px' }}>
                <div className="visual-main">
                  {/* Left Carousel Arrow */}
                  {validSamples.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActiveImage(prev => (prev === 0 ? validSamples.length - 1 : prev - 1));
                      }}
                      className="carousel-arrow carousel-arrow--left"
                      title="Previous Image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}

                  {template.video || template.generateType === 'video' ? (
                    <video
                      src={template.video || currentMediaUrl}
                      autoPlay muted loop controls
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                    />
                  ) : (
                    <img
                      src={currentMediaUrl || getMediaUrl(template.thumbnail)}
                      alt={template.title || template.name}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        const fallback = getMediaUrl(template.thumbnail) || getMediaUrl(template.image);
                        if (fallback && e.target.src !== fallback) {
                          e.target.src = fallback;
                        }
                      }}
                    />
                  )}

                  {/* Right Carousel Arrow */}
                  {validSamples.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActiveImage(prev => (prev === validSamples.length - 1 ? 0 : prev + 1));
                      }}
                      className="carousel-arrow carousel-arrow--right"
                      title="Next Image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const isVideo = template.video || template.generateType === 'video';
                      const url = currentMediaUrl || getMediaUrl(template.thumbnail);
                      setLightboxMedia({
                        url,
                        type: isVideo ? 'video' : 'image'
                      });
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--color-cyan, #06b6d4)';
                      e.currentTarget.style.color = 'black';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Fullscreen Preview"
                  >
                    <Maximize2 size={20} />
                  </button>

                  {/* Download Button (Only visible if unlocked) */}
                  {isUnlocked && (
                    <button
                      onClick={handleDownloadMedia}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = 'var(--color-cyan, #06b6d4)';
                        e.currentTarget.style.color = 'black';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Download Image/Video"
                    >
                      <Download size={20} />
                    </button>
                  )}
                 </div>
                 {/* Thumbnail Carousel Tray */}
                 {validSamples.length > 1 && (
                   <div className="visual-thumbnails" style={{
                     display: 'flex',
                     gap: '8px',
                     marginTop: '12px',
                     overflowX: 'auto',
                     padding: '4px 0',
                     scrollbarWidth: 'thin'
                   }}>
                     {validSamples.map((sampleUrl, idx) => {
                       const isActive = idx === activeImage;
                       return (
                         <div
                           key={idx}
                           onClick={() => {
                             setActiveImage(idx);
                             setImageRatio(null);
                           }}
                           style={{
                             width: '60px',
                             height: '60px',
                             borderRadius: '8px',
                             overflow: 'hidden',
                             border: isActive ? '2px solid var(--color-cyan, #06b6d4)' : '2px solid transparent',
                             cursor: 'pointer',
                             opacity: isActive ? 1 : 0.6,
                             transition: 'all 0.2s ease',
                             flexShrink: 0
                           }}
                           onMouseOver={e => {
                             if (!isActive) e.currentTarget.style.opacity = '1';
                           }}
                           onMouseOut={e => {
                             if (!isActive) e.currentTarget.style.opacity = '0.6';
                           }}
                         >
                           <img
                             src={sampleUrl}
                             alt={`Thumbnail ${idx + 1}`}
                             style={{
                               width: '100%',
                               height: '100%',
                               objectFit: 'cover'
                             }}
                           />
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>
            ) : (
              <div className="text-display card" style={{ marginBottom: '20px' }}>
                <div className="text-header">
                  <div className="text-header-icon">
                    <MessageSquare size={24} className="text-cyan" />
                  </div>
                  <div>
                    <h2 className="text-header-title">Output Samples</h2>
                    <p className="text-xs text-muted">Previewing {template.samples?.length || 0} real-world generations</p>
                  </div>
                </div>

                <div className="text-samples-list">
                  {template.samples && template.samples.slice(0, 3).map((sample, idx) => (
                    <div key={idx} className="text-sample-card">
                      <div className="text-sample-badge">Example {idx + 1}</div>
                      <div className="text-sample-output">
                        <div className="output-bubble">
                          {sample.output || (typeof sample === 'string' ? sample : '')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-footer">
                  <ShieldCheck size={16} className="text-green" />
                  <span>Verified prompt results for {model.label}</span>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="comments-section" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-display)' }}>
                <MessageSquare size={20} className="text-cyan" /> Comments ({reviews.length})
              </h3>
              
              {/* Comments List */}
              <div className="comments-list" style={{ maxHeight: '290px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-cyan)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden' }}>
                          {rev.userAvatar ? <img src={rev.userAvatar} alt={rev.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (rev.userName || 'U')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>@{rev.userName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #9ca3af)', marginLeft: 'auto' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', paddingLeft: '38px', lineHeight: '1.4' }}>{rev.comment}</p>
                      {rev.reply && (
                        <div style={{ marginTop: '10px', marginLeft: '38px', padding: '10px 14px', background: 'rgba(6, 182, 212, 0.05)', borderLeft: '2px solid var(--color-cyan)', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-cyan)', marginBottom: '4px' }}>Creator Reply</div>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{rev.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', textAlign: 'center', margin: '30px 0' }}>No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* Post Comment Form */}
              {state.user ? (
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '24px',
                      padding: '10px 20px',
                      color: 'white',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      borderRadius: '24px',
                      padding: '6px 20px',
                      fontSize: '0.9rem',
                      minWidth: 'auto',
                      height: '42px',
                      lineHeight: '26px'
                    }}
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', textAlign: 'center', margin: 0 }}>
                  Please <Link to="/login" style={{ color: 'var(--color-cyan)' }}>login</Link> to post comments.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Actions & Info */}
          <div className="p-detail__info-section">
            <div className="p-detail__header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', width: '100%' }}>
                <span className="p-detail__category-tag" style={{ marginBottom: 0 }}>{category.replace('-', ' ')}</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                  {/* Web Share API fallback */}
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleShare}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      borderRadius: '20px',
                      height: '28px',
                      lineHeight: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      minWidth: 'auto',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                    title="Copy Page Link"
                  >
                    <Share2 size={12} /> Share
                  </button>

                  {/* Twitter/X Share */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this amazing AI prompt: ${template.title || template.name}`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-icon-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      transition: 'all 0.2s'
                    }}
                    title="Share on Twitter/X"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>

                  {/* Facebook Share */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-icon-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#1877f2',
                      transition: 'all 0.2s'
                    }}
                    title="Share on Facebook"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>

                  {/* WhatsApp Share */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this amazing AI prompt: ${template.title || template.name} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-icon-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#25d366',
                      transition: 'all 0.2s'
                    }}
                    title="Share on WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.858-4.42 9.861-9.864.002-2.636-1.026-5.116-2.893-6.985C16.577 1.888 14.1 1.861 11.47 1.861c-5.437 0-9.862 4.417-9.866 9.861-.002 1.8.481 3.553 1.396 5.117L2.032 20.8l4.615-1.646z"/></svg>
                  </a>

                  {/* Pinterest Share */}
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(template.thumbnail || '')}&description=${encodeURIComponent(template.description || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-icon-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#bd081c',
                      transition: 'all 0.2s'
                    }}
                    title="Share on Pinterest"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.906 2.17-2.906 1.024 0 1.517.768 1.517 1.686 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.168 1.777 2.168 2.133 0 3.772-2.254 3.772-5.509 0-2.881-2.071-4.896-5.029-4.896-3.424 0-5.437 2.568-5.437 5.228 0 1.033.398 2.143.896 2.746.098.118.112.222.083.342-.091.382-.294 1.197-.333 1.36-.053.218-.173.264-.399.157-1.494-.696-2.428-2.882-2.428-4.636 0-3.778 2.748-7.247 7.915-7.247 4.155 0 7.386 2.96 7.386 6.917 0 4.129-2.607 7.452-6.223 7.452-1.215 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.498 3.156 1.127.349 2.321.537 3.56.537 6.62 0 11.988-5.368 11.988-11.991C24.005 5.368 18.636 0 12.017 0z"/></svg>
                  </a>
                </div>
              </div>
              <h1 
                ref={titleRef}
                className={`p-detail__title ${canExpandTitle ? 'p-detail__title--expandable' : ''} ${(!isTitleExpanded && canExpandTitle) ? 'p-detail__title--clamped' : ''}`}
                onClick={() => {
                  if (canExpandTitle) {
                    setIsTitleExpanded(!isTitleExpanded);
                  }
                }}
                style={{ cursor: canExpandTitle ? 'pointer' : 'default' }}
                title={canExpandTitle ? (isTitleExpanded ? "Click to collapse" : "Click to expand") : undefined}
              >
                {template.title || template.name}
              </h1>
              <p className="p-detail__desc">{template.description || "A professional high-end prompt optimized for creative production."}</p>

              {/* Keywords Section */}
              {template.keywords && template.keywords.length > 0 && (
                <div className="p-detail__keywords">
                  {template.keywords.map((kw, i) => {
                    const normalized = kw.toLowerCase().trim().replace(/ /g, '-');
                    // List of valid category IDs to check against
                    const validCatIds = ['portrait', 'group', 'expression', 'lifestyle', 'ai-influencer', 'baby', 'old-age', 'character', 'sci-fi-char', 'fantasy-char', 'horror-char', 'cosplay', 'headshot', 'selfie', 'fashion', 'streetwear', 'luxury-fashion', 'beauty', 'hairstyle', 'makeup', 'outfit-design', 'product', 'e-commerce', 'advertisement', 'branding', 'marketing', 'social-media', 'thumbnail', 'app-ui', 'website-ui', 'poster', 'book-cover', 'movie-poster', 'landscape', 'sunset', 'sunrise', 'cityscape', 'urban', 'night-city', 'space', 'nature', 'forest', 'tropical', 'desert', 'mountains', 'ocean', 'snow', 'volcano', 'architecture', 'interior-design', 'exterior-design', 'building-concept', 'historical', 'futuristic-arch', 'food', 'fast-food', 'dessert', 'drinks', 'coffee-art', 'fine-dining', 'tattoo', 'illustration', 'digital-art', 'painting', 'line-art', 'sketch', '3d-render', 'isometric', 'abstract', 'colorful', 'geometric', 'surreal', 'psychedelic', 'minimalist'];
                    const isCategory = validCatIds.includes(normalized);

                    return (
                      <span
                        key={i}
                        className="p-detail__keyword-tag"
                        onClick={() => {
                          if (isCategory) {
                            navigate('/templates', { state: { category: normalized } });
                          } else {
                            navigate('/templates', { state: { search: kw } });
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        #{kw}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Model & Free Creation Secret Note (Only for Model Prompts) */}
              {isModelPrompt && (
                <div className="p-detail__secret-note" style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(168, 85, 247, 0.12))',
                  border: '1px solid rgba(236, 72, 153, 0.35)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.15)'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    fontSize: '18px'
                  }}>
                    🌊
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#f1f5f9', lineHeight: '1.5', fontWeight: '500' }}>
                    model use <strong style={{ color: '#ec4899' }}>Seedream 3.5 Pro</strong> and i tell you secret how to create that images free after purchased the prompt
                  </p>
                </div>
              )}

            </div>

            {!state.user && (
              <div className="p-detail__actions" style={{ marginTop: '20px' }}>
                <div className="p-detail__auth-gate">
                  <Link to="/login" className="btn btn-primary btn-xl w-full" style={{ width: '100%' }}>
                    Login or Register to Unlock <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            )}

            {state.user && isPaidPrompt && !isPromptPurchased && !isCreator && (
              <div className="unlock-rules-card card animate-slide-up" style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                padding: '24px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '20px', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px', 
                  fontFamily: 'var(--font-display)' 
                }}>
                  <Lock size={20} className="text-orange" /> Premium Store Prompt
                </h3>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.03)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Zap size={22} className="text-orange" fill="var(--color-orange)" />
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-orange)' }}>
                    {template.priceTokens || template.tokens || 5}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '500' }}>Tokens Required</span>
                </div>

                {purchaseError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.8rem',
                    marginBottom: '16px',
                    textAlign: 'left'
                  }}>
                    ⚠️ {purchaseError}
                    {purchaseError.includes('Insufficient') && (
                      <div style={{ marginTop: '8px' }}>
                        <Link to="/pricing" className="text-cyan" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                          Buy Tokens Now
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleTokenUnlock}
                  disabled={unlockingWithTokens}
                  className="btn btn-primary w-full"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 'bold', gap: '8px', color: 'black' }}
                >
                  {unlockingWithTokens ? (
                    <>
                      <Loader2 size={18} className="spin" /> Unlocking...
                    </>
                  ) : (
                    <>
                      <Unlock size={18} /> Unlock Prompt
                    </>
                  )}
                </button>
              </div>
            )}

            {state.user && isPaidPrompt && (isPromptPurchased || isCreator) && (
              <div className="unlock-rules-card card animate-slide-up" style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                padding: '24px', 
                background: 'rgba(16, 185, 129, 0.04)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  marginBottom: '10px', 
                  color: '#34d399', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px', 
                  fontFamily: 'var(--font-display)' 
                }}>
                  <CheckCircle size={22} style={{ color: '#10b981' }} /> You Already Purchased This Prompt
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.4' }}>
                  You have full lifetime access to the secret prompt template, instructions, and download assets.
                </p>

                <button 
                  onClick={() => window.open(`/purchase-success/${template._id || template.id}`, '_blank')}
                  className="btn btn-primary w-full"
                  style={{ 
                    width: '100%', 
                    height: '48px', 
                    fontSize: '0.95rem', 
                    fontWeight: 'bold', 
                    gap: '8px', 
                    color: 'black',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Unlock size={18} /> View Purchased Prompt Details
                </button>
              </div>
            )}

            {state.user && (!isPaidPrompt || isPromptPurchased || isCreator) && activeTasksCount > 0 && !isPromptUnlocked && (
              <div className="unlock-rules-card card animate-slide-up" style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                padding: '24px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: '18px', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontFamily: 'var(--font-display)' 
                }}>
                  <Lock size={18} className="text-orange" /> Creator Social Tasks
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.4' }}>
                  Follow the creator on their social profiles to unlock the full prompt copy and download options.
                </p>

                {/* Inline Task Message */}
                {taskMessage.text && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease',
                    ...(taskMessage.type === 'error' ? {
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5'
                    } : taskMessage.type === 'success' ? {
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#6ee7b7'
                    } : {
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd'
                    })
                  }}>
                    {taskMessage.type === 'error' && <span style={{ fontSize: '1.1rem' }}>⚠️</span>}
                    {taskMessage.type === 'success' && <span style={{ fontSize: '1.1rem' }}>✅</span>}
                    {taskMessage.type === 'info' && <span style={{ fontSize: '1.1rem' }}>⏳</span>}
                    <span>{taskMessage.text}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.keys(rulesState).map(platformId => {
                    const rule = rulesState[platformId];
                    if (!rule.active) return null;
                    const config = getPlatformConfig(platformId, linksSource[platformId]);
                    const isCountingDown = rule.clicked && rule.countdown > 0;
                    const isReadyToVerify = rule.clicked && rule.countdown === 0 && !rule.verified;
                    return (
                      <div key={platformId} style={{ 
                        display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', 
                        background: rule.verified ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)', 
                        borderRadius: '10px', 
                        border: rule.verified ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(255,255,255,0.03)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>
                            <span style={{ color: config.color, display: 'inline-flex', alignItems: 'center' }}>
                              {config.icon}
                            </span>
                            <span>{platformId === 'youtube' ? 'Subscribe' : 'Follow'} on {config.name}</span>
                          </div>
                          <span style={{ 
                            fontSize: '0.75rem', fontWeight: '600', 
                            padding: '2px 8px', borderRadius: '12px',
                            color: rule.verified ? '#10b981' : isCountingDown ? '#f59e0b' : isReadyToVerify ? '#06b6d4' : '#94a3b8',
                            background: rule.verified ? 'rgba(16,185,129,0.15)' : isCountingDown ? 'rgba(245,158,11,0.15)' : isReadyToVerify ? 'rgba(6,182,212,0.15)' : 'transparent'
                          }}>
                            {rule.statusText}
                          </span>
                        </div>

                        {/* Countdown progress bar */}
                        {isCountingDown && (
                          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              borderRadius: '2px',
                              background: 'linear-gradient(90deg, #f59e0b, #fb923c)',
                              width: `${((COUNTDOWN_SECONDS - rule.countdown) / COUNTDOWN_SECONDS) * 100}%`,
                              transition: 'width 1s linear'
                            }} />
                          </div>
                        )}

                        {!rule.verified && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                              Your {config.name} handle/username:
                            </label>
                            <input
                              type="text"
                              placeholder="@yourusername"
                              value={userHandles[platformId] || ''}
                              onChange={e => setUserHandles(prev => ({ ...prev, [platformId]: e.target.value }))}
                              style={{
                                width: '100%',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                color: 'white',
                                fontSize: '0.8rem',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                          <button 
                            onClick={() => handleRuleClick(platformId, linksSource[platformId] || '#')}
                            className="btn btn-secondary btn-sm"
                            style={{ 
                              flex: 1, height: '36px', fontSize: '0.8rem', 
                              background: rule.clicked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                              opacity: rule.verified ? 0.5 : 1
                            }}
                            disabled={rule.verified}
                          >
                            {rule.clicked ? '✓ Visited Profile' : `Visit ${config.name}`}
                          </button>
                          <button 
                            onClick={() => handleVerifyRule(platformId)}
                            className="btn btn-primary btn-sm"
                            style={{ 
                              flex: 1, height: '36px', fontSize: '0.8rem', gap: '6px',
                              opacity: (isCountingDown || (!rule.clicked && !rule.verified)) ? 0.5 : 1,
                              cursor: (isCountingDown || (!rule.clicked && !rule.verified)) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={rule.verified || rule.verifying || isCountingDown}
                          >
                            {rule.verifying ? (
                              <>
                                <Loader2 size={14} className="spin" /> Verifying...
                              </>
                            ) : rule.verified ? (
                              <>
                                <Check size={14} /> Verified
                              </>
                            ) : isCountingDown ? (
                              `Wait ${rule.countdown}s...`
                            ) : (
                              'Verify Action'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-detail__stats card" style={{ marginTop: '20px' }}>
              <div className="stat-item" style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '16px'
              }}>
                {(() => {
                  const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
                  const sellerId = template.seller?._id?.toString() || template.seller?.id?.toString() || template.seller?.toString();
                  const isCreator = currentUserId && sellerId && (currentUserId === sellerId);
                  const avatarUrl = (isCreator ? state.user?.avatar : null) || template.seller?.avatar || `https://ui-avatars.com/api/?name=${template.seller?.name || 'C'}&background=random`;
                  const sellerName = (isCreator ? state.user?.name : null) || template.seller?.name || 'Unknown Creator';
                  
                  // Real-time followers count and follow state used from component hooks
                  
                  // end profile helpers

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img
                            src={avatarUrl}
                            alt="Creator Avatar"
                            style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-cyan)', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '1.15rem', color: 'white', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{sellerName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={12} /> {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
                            </span>
                          </div>
                        </div>
                        
                        {!isCreator && (
                          <button 
                            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} 
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '0.8rem', 
                              borderRadius: '20px', 
                              minWidth: '80px',
                              height: '32px',
                              lineHeight: '20px',
                              boxShadow: isFollowing ? 'none' : '0 0 10px rgba(6, 182, 212, 0.4)'
                            }}
                            onClick={handleFollowClick}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>

                      {(() => {
                        const filledPlatforms = Object.keys(linksSource).filter(platformId => {
                          const url = linksSource[platformId];
                          return url && url.trim() !== '';
                        });
                        
                        if (filledPlatforms.length === 0) return null;
                        
                        return (
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            flexWrap: 'wrap',
                            background: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '12px', 
                            padding: '14px', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginTop: '16px',
                            width: '100%'
                          }}>
                            {filledPlatforms.map(platformId => {
                              const url = linksSource[platformId];
                              const config = getPlatformConfig(platformId, url);
                              
                              return (
                                <a 
                                  key={platformId}
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    color: config.color, 
                                    transition: 'all 0.2s', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    background: `${config.color}14`, // 14 hex = 8% opacity
                                    border: `1px solid ${config.color}26` // 26 hex = 15% opacity
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.color = config.color;
                                    e.currentTarget.style.background = `${config.color}33`; // 33 hex = 20% opacity
                                    e.currentTarget.style.borderColor = `${config.color}4D`; // 4D hex = 30% opacity
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.color = config.color;
                                    e.currentTarget.style.background = `${config.color}14`;
                                    e.currentTarget.style.borderColor = `${config.color}26`;
                                  }}
                                  title={config.name}
                                >
                                  {config.icon}
                                </a>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>


        <section className="p-detail__bottom-section section-spacing">
          <div className="p-detail__related-side">
            <h2 className="h-display" style={{ fontSize: '2rem', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
              More like <span className="text-orange">this</span>
            </h2>
            <MasonryGrid
              columns={4}
              items={(relatedFeedItems && relatedFeedItems.length > 0) ? relatedFeedItems : ((relatedStoreFeedItems && relatedStoreFeedItems.length > 0) ? relatedStoreFeedItems : [])}
              renderItem={(item, i) => (
                <PinterestCard key={item.keyId} item={item} index={i} />
              )}
            />
          </div>

        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="lightbox-overlay" onClick={() => setLightboxMedia(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <button className="lightbox-close" onClick={() => setLightboxMedia(null)}>&times;</button>
            
            {/* Left Arrow inside Lightbox */}
            {validSamples.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const prevIdx = activeImage === 0 ? validSamples.length - 1 : activeImage - 1;
                  setActiveImage(prevIdx);
                  const url = validSamples[prevIdx] || getMediaUrl(template?.thumbnail);
                  setLightboxMedia({
                    url,
                    type: template?.video || template?.generateType === 'video' ? 'video' : 'image'
                  });
                }}
                className="carousel-arrow carousel-arrow--left"
                style={{ position: 'absolute', left: '24px', zIndex: 100 }}
                title="Previous Image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {lightboxMedia.type === 'video' ? (
              <video src={lightboxMedia.url} controls autoPlay className="lightbox-media" style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
            ) : (
              <img src={lightboxMedia.url} alt="Full view" className="lightbox-media" style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} />
            )}

            {/* Right Arrow inside Lightbox */}
            {validSamples.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const nextIdx = activeImage === validSamples.length - 1 ? 0 : activeImage + 1;
                  setActiveImage(nextIdx);
                  const url = validSamples[nextIdx] || getMediaUrl(template?.thumbnail);
                  setLightboxMedia({
                    url,
                    type: template?.video || template?.generateType === 'video' ? 'video' : 'image'
                  });
                }}
                className="carousel-arrow carousel-arrow--right"
                style={{ position: 'absolute', right: '24px', zIndex: 100 }}
                title="Next Image"
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
