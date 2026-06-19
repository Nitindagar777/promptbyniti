import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Upload, CheckCircle, AlertCircle, Info,
  Sparkles, ArrowLeft, ShieldCheck, Trash2, Plus, X, Globe, Eye
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './SellPage.css';

// Platform configuration lookup helper
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

export default function SellPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Media State
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [dragging, setDragging] = useState(false);

  // Dynamic Add Platform Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatformType, setNewPlatformType] = useState('linkedin');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [limitModal, setLimitModal] = useState({ show: false, planName: '', limit: 0 });
  // Creator Social Links & Task Rules (persisted in localStorage)
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      const stored = localStorage.getItem('promptbyniti_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.socialLinks) {
          return {
            instagram: '', twitter: '', github: '', youtube: '', website: '',
            ...parsed.user.socialLinks
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return { instagram: '', twitter: '', github: '', youtube: '', website: '' };
  });

  const socialLinksRef = useRef(socialLinks);
  // Keep ref in sync with state
  socialLinksRef.current = socialLinks;

  const [unlockRules, setUnlockRules] = useState(() => {
    const initialLinks = (() => {
      try {
        const stored = localStorage.getItem('promptbyniti_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user?.socialLinks) {
            return {
              instagram: '', twitter: '', github: '', youtube: '', website: '',
              ...parsed.user.socialLinks
            };
          }
        }
      } catch (e) {
        // ignore
      }
      return { instagram: '', twitter: '', github: '', youtube: '', website: '' };
    })();

    const rules = {};
    Object.keys(initialLinks).forEach(key => {
      rules[key] = false;
    });
    return rules;
  });

  // Creator Social Links & Task Rules: sync with global user profile
  useEffect(() => {
    if (!isEditMode && state.user?.socialLinks) {
      const merged = {
        instagram: '', twitter: '', github: '', youtube: '', website: '',
        ...state.user.socialLinks
      };
      
      setSocialLinks(prev => {
        const activeEl = document.activeElement;
        const isEditingSocialInput = activeEl && activeEl.tagName === 'INPUT' && activeEl.closest('.form-card-glass');
        if (isEditingSocialInput) {
          return prev;
        }

        const keys1 = Object.keys(prev);
        const keys2 = Object.keys(merged);
        if (keys1.length === keys2.length && keys1.every(k => prev[k] === merged[k])) {
          return prev;
        }
        return merged;
      });

      setUnlockRules(prev => {
        const rules = { ...prev };
        let changed = false;
        Object.keys(merged).forEach(key => {
          if (rules[key] === undefined) {
            rules[key] = false;
            changed = true;
          }
        });
        return changed ? rules : prev;
      });
    }
  }, [state.user?.socialLinks, isEditMode]);

  // Save social links directly to the user profile in the database
  const saveSocialLinksToProfile = (updatedLinks) => {
    // 1. IMMEDIATELY update global state + localStorage (synchronous, survives refresh)
    if (state.user) {
      dispatch({
        type: 'SET_USER',
        payload: { ...state.user, socialLinks: updatedLinks }
      });
    }

    // 2. Persist to MongoDB (async, for cross-device / cross-session persistence)
    const token = localStorage.getItem('promptbyniti_token');
    if (!token) return;

    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ socialLinks: updatedLinks })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sync with server-confirmed data
          dispatch({ type: 'SET_USER', payload: data.user });
        }
      })
      .catch(err => console.error('Failed to save social links to profile:', err));
  };

  // Load Edit Data if edit query param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('edit');
    if (id) {
      setIsEditMode(true);
      setEditId(id);
      setLoading(true);
      fetch(`/api/prompts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.prompt) {
            const p = data.prompt;
            setName(p.name || '');
            setDescription(p.description || '');
            setPrompt(p.template || '');
            setTags(p.keywords || []);
            setMedia(p.thumbnail || (p.samples && p.samples[0]?.output) || null);
            setMediaType(p.generateType || 'image');
            const links = p.socialLinks || { instagram: '', twitter: '', github: '', youtube: '', website: '' };
            const rules = p.unlockRules || { instagram: false, youtube: false, twitter: false };
            
            // Sync all socialLinks keys to unlockRules keys
            const mergedRules = { ...rules };
            Object.keys(links).forEach(key => {
              if (mergedRules[key] === undefined) {
                mergedRules[key] = false;
              }
            });
            
            setSocialLinks(links);
            socialLinksRef.current = links;
            setUnlockRules(mergedRules);
          }
        })
        .catch(err => console.error("Error loading prompt for edit:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  // Handle Drag Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');
    if (!isVid && !isImg) {
      alert("Please upload an image or a video file.");
      return;
    }
    setMediaType(isVid ? 'video' : 'image');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedia(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Add Tag Chip
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanVal = tagInput.trim().replace(/,/g, '');
      if (cleanVal && !tags.includes(cleanVal)) {
        setTags([...tags, cleanVal]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!media) {
      alert("Please upload an image or video showcasing your prompt.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        generateType: mediaType,
        model: 'flux', // general high quality prompt
        template: prompt,
        thumbnail: media,
        samples: [{ input: prompt, output: media }],
        keywords: tags,
        socialLinks,
        unlockRules
      };

      const url = isEditMode
        ? `/api/prompts/${editId}`
        : `/api/prompts`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        // Sync social links to the local state.user dynamically
        if (state.user) {
          dispatch({
            type: 'SET_USER',
            payload: {
              ...state.user,
              socialLinks: socialLinks
            }
          });
        }
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        alert(data.message || 'Failed to submit prompt');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleListAnother = () => {
    setName('');
    setDescription('');
    setPrompt('');
    setTags([]);
    setMedia(null);
    const userLinks = state.user?.socialLinks || {};
    const merged = {
      instagram: '', twitter: '', github: '', youtube: '', website: '',
      ...userLinks
    };
    setSocialLinks(merged);
    
    // Dynamically expand unlock rules keys to match merged socialLinks
    const rules = {};
    Object.keys(merged).forEach(key => {
      rules[key] = false;
    });
    setUnlockRules(rules);

    setSubmitted(false);
    setIsEditMode(false);
    setEditId(null);
    navigate('/sell');
  };

  const handleAddCustomPlatform = (e) => {
    e.preventDefault();
    let key = newPlatformType;
    let displayName = '';
    
    if (newPlatformType === 'custom') {
      if (!newPlatformName.trim()) {
        alert('Please enter a platform name.');
        return;
      }
      key = newPlatformName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      displayName = newPlatformName.trim();
    } else {
      const presets = {
        linkedin: 'LinkedIn',
        facebook: 'Facebook',
        pinterest: 'Pinterest',
        tiktok: 'TikTok',
        twitch: 'Twitch',
        discord: 'Discord'
      };
      displayName = presets[newPlatformType];
    }

    if (!key) return;

    if (socialLinks[key] !== undefined) {
      alert(`Platform "${displayName || key}" is already added.`);
      return;
    }

    const updated = {
      ...socialLinks,
      [key]: newPlatformUrl.trim()
    };

    setSocialLinks(updated);
    socialLinksRef.current = updated;
    setUnlockRules(prev => ({
      ...prev,
      [key]: false
    }));

    setNewPlatformName('');
    setNewPlatformUrl('');
    setShowAddForm(false);

    saveSocialLinksToProfile(updated);
  };

  const handleDeletePlatform = (platformKey) => {
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platformKey];
    setSocialLinks(updatedLinks);
    socialLinksRef.current = updatedLinks;

    const updatedRules = { ...unlockRules };
    delete updatedRules[platformKey];
    setUnlockRules(updatedRules);

    saveSocialLinksToProfile(updatedLinks);
  };

  if (submitted) {
    return (
      <div className="sell-page sell-page--success container">
        <div className="card text-center reveal" style={{ padding: 'var(--space-3xl) var(--space-xl)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          <div className="success-icon" style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
            <CheckCircle size={64} color="var(--color-green)" />
          </div>
          <h1 className="h-display" style={{ marginTop: '10px' }}>Post <span className="text-green">Live in Feed!</span></h1>
          <p className="text-secondary" style={{ maxWidth: '600px', margin: '16px auto var(--space-xl)' }}>
            Your prompt post "{name}" is now live in the community feed. Creators can unlock the prompt template by performing your required social verification tasks!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/templates')}>View Feed</button>
            <button className="btn btn-secondary" onClick={handleListAnother}>Post Another</button>
            <button className="btn btn-blue" onClick={() => navigate('/')}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page container">
      <SEOHead
        title="Create New Post — Prompt by Niti"
        description="Post your AI prompt with customized social tasks. Get followers on Instagram, subscribers on YouTube, and followers on Twitter/X to unlock your prompt template."
      />
      
      <div className="sell-page__header">
        {isEditMode && (
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', left: '0', top: '5px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1 className="h-display">{isEditMode ? 'Edit Your' : 'Post to'} <span className="text-orange">the Feed</span></h1>
        <p className="section-desc">
          Upload an image or video, enter your prompt template, and require social actions to unlock it.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Sparkles className="spin text-cyan mb-4 mx-auto" size={40} />
          <p className="text-muted">Loading post details...</p>
        </div>
      )}

      {!loading && (
        <form className="sell-form-v2" onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div className="sell-page__grid">
            {/* Left Column: Post Fields */}
            <div className="sell-section">
              <div className="card form-card-glass">
                <h3 className="section-subtitle"><Sparkles size={20} className="text-cyan" /> Post Details</h3>
                
                <div className="form-group">
                  <label>Post Title / Prompt Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Dreamy Cyberpunk Street Portrait"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    required
                    className="textarea"
                    placeholder="Describe what this prompt generates and what settings you used..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>The Prompt Template</label>
                  <textarea
                    required
                    className="textarea"
                    style={{ minHeight: '110px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                    placeholder="e.g. A neon-lit cyberpunk street corner in Neo-Tokyo, shot on 35mm lens, atmospheric fog, [subject details] standing under [light type]..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  ></textarea>
                  <span className="input-hint"><Info size={14} /> This will be locked behind your selected Creator Tasks.</span>
                </div>

                <div className="form-group">
                  <label>Tags / Keywords (Press Enter or Comma)</label>
                  <div className="tags-input-container">
                    <div className="tags-chips-list">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="tag-chip">
                          #{tag}
                          <button type="button" className="tag-chip-remove" onClick={() => removeTag(idx)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="input"
                      placeholder={tags.length === 0 ? "Type tag and press Enter..." : "Add more tags..."}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>

              {/* Social Tasks Card */}
              <div className="card form-card-glass">
                <h3 className="section-subtitle"><Globe size={20} className="text-purple" /> Creator Social Tasks</h3>
                <p className="text-sm text-muted mb-4">Provide your social links and select which ones are required to unlock the prompt.</p>                {Object.keys(socialLinks).map((key) => {
                  const url = socialLinks[key];
                  const config = getPlatformConfig(key, url);
                  const isDefault = ['instagram', 'twitter', 'youtube', 'github', 'website'].includes(key);
                  return (
                    <div className="form-group" key={key}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: config.color, display: 'inline-flex', alignItems: 'center' }}>
                          {config.icon}
                        </span>
                        <span>{config.name} Profile URL</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="url"
                          className="input"
                          style={{ flex: 1 }}
                          placeholder={`e.g. ${config.placeholder}`}
                          value={url}
                          onChange={e => {
                            const updated = { ...socialLinks, [key]: e.target.value };
                            setSocialLinks(updated);
                            socialLinksRef.current = updated;
                          }}
                          onBlur={() => saveSocialLinksToProfile(socialLinksRef.current)}
                        />
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeletePlatform(key)}
                            className="btn-delete-platform"
                            title={`Remove ${config.name}`}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              borderRadius: '12px',
                              width: '46px',
                              height: '46px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              padding: '0'
                            }}
                          >
                            <Trash2 size={18} style={{ margin: 'auto' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!showAddForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                      width: '100%',
                      marginTop: '10px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <Plus size={18} /> Add Platform Link
                  </button>
                ) : (
                  <div
                    className="add-platform-form"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '16px',
                      padding: '16px',
                      marginTop: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white' }}>Add Social Platform</span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.85rem' }}>Select Platform</label>
                      <select
                        className="input"
                        value={newPlatformType}
                        onChange={e => setNewPlatformType(e.target.value)}
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="facebook">Facebook</option>
                        <option value="pinterest">Pinterest</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitch">Twitch</option>
                        <option value="discord">Discord</option>
                        <option value="custom">Custom Platform / Website</option>
                      </select>
                    </div>

                    {newPlatformType === 'custom' && (
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ fontSize: '0.85rem' }}>Platform Name</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Patreon"
                          value={newPlatformName}
                          onChange={e => setNewPlatformName(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.85rem' }}>Profile or Channel URL (Optional)</label>
                      <input
                        type="url"
                        className="input"
                        placeholder="e.g. https://linkedin.com/in/username"
                        value={newPlatformUrl}
                        onChange={e => setNewPlatformUrl(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomPlatform}
                      className="btn btn-primary"
                      style={{ marginTop: '8px', padding: '10px' }}
                    >
                      Confirm Add
                    </button>
                  </div>
                )}

                <div className="form-group mt-md">
                  {(() => {
                    const isAdmin = state.user?.email?.toLowerCase().trim() === 'nitindagar0800@gmail.com';
                    
                    const getPlanName = (plan) => {
                      if (isAdmin) return 'Studio';
                      const p = (plan || 'free').toLowerCase();
                      if (p === 'unlimited') return 'Studio';
                      if (p === 'pro') return 'Creator';
                      if (p === 'starter') return 'Starter';
                      return 'Free';
                    };
                    const getPlanLimit = (plan) => {
                      if (isAdmin) return 3;
                      const p = (plan || 'free').toLowerCase();
                      if (p === 'unlimited') return 3; // Studio
                      if (p === 'pro') return 2;       // Creator
                      if (p === 'starter') return 1;   // Starter
                      return 0;                        // Free by default
                    };
                    
                    const limit = getPlanLimit(state.plan);
                    const planName = getPlanName(state.plan);
                    const checkedCount = Object.values(unlockRules).filter(Boolean).length;
                    
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: 'bold', margin: 0 }}>Unlock Requirements (Checkboxes)</label>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            padding: '4px 10px', 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: planName === 'Studio' ? 'var(--color-purple, #a855f7)' : planName === 'Creator' ? 'var(--color-cyan, #06b6d4)' : planName === 'Starter' ? 'var(--color-green, #10b981)' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {planName} Plan: {checkedCount} / {limit} Selected
                          </span>
                        </div>

                        {limit === 0 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: '16px', 
                            background: 'rgba(239, 68, 68, 0.08)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            color: '#f87171', 
                            padding: '16px 20px', 
                            borderRadius: '12px', 
                            fontSize: '0.9rem', 
                            marginTop: '8px',
                            marginBottom: '20px',
                            width: '100%'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ 
                                background: '#ef4444', 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '0.95rem',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>!</span>
                              <span>
                                Social lock rules are locked on the Free Plan. Please upgrade your plan to unlock and set required tasks.
                              </span>
                            </div>
                            <Link to="/pricing" className="btn btn-primary btn-sm" style={{ 
                              flexShrink: 0,
                              padding: '8px 16px',
                              borderRadius: '8px',
                              boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
                              textDecoration: 'none'
                            }}>
                              Go to Pricing Page
                            </Link>
                          </div>
                        )}

                        <span className="input-hint" style={{ marginBottom: '14px' }}>
                          <Info size={14} /> Checked options will show up as lock rules on your post. 
                          {limit === 0 ? " Upgrade your plan to set required social tasks." : limit === 1 ? ` ${planName} plan allows 1 lock rule.` : limit === 2 ? ` ${planName} plan allows 2 lock rules.` : ` ${planName} plan allows 3 lock rules.`}
                        </span>
                        
                        <div className="tasks-checkbox-grid">
                          {Object.keys(socialLinks).map((platformId) => {
                            const url = socialLinks[platformId];
                            const config = getPlatformConfig(platformId, url);
                            const isRequired = !!unlockRules[platformId];
                            
                            let actionText = `Follow on ${config.name}`;
                            if (platformId === 'youtube') {
                              actionText = `Subscribe on ${config.name}`;
                            } else if (platformId === 'website') {
                              actionText = `Visit Website`;
                            } else if (['github', 'linkedin', 'facebook', 'pinterest', 'tiktok', 'twitch'].includes(platformId)) {
                              actionText = `Follow on ${config.name}`;
                            } else if (platformId === 'discord') {
                              actionText = `Join Discord Server`;
                            } else {
                              actionText = `Follow/Visit ${config.name}`;
                            }

                            return (
                              <label 
                                className="task-checkbox-label" 
                                key={platformId} 
                                style={{ 
                                  opacity: (limit === 0 || (!isAdmin && !url)) ? 0.5 : 1, 
                                  cursor: (limit === 0 || (!isAdmin && !url)) ? 'not-allowed' : 'pointer' 
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isRequired}
                                  disabled={limit === 0 || (!isAdmin && !url)}
                                  onChange={e => {
                                    const isChecking = e.target.checked;
                                    if (isChecking) {
                                      if (checkedCount >= limit) {
                                        setLimitModal({ show: true, planName: planName, limit: limit });
                                        return;
                                      }
                                    }
                                    setUnlockRules({ ...unlockRules, [platformId]: e.target.checked });
                                  }}
                                />
                                <span className={((!url && !isAdmin) || limit === 0) ? "opacity-50" : ""} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: config.color, display: 'inline-flex', alignItems: 'center' }}>
                                    {config.icon}
                                  </span>
                                  <span>Require {actionText}</span>
                                </span>
                                {!url && <span className="req-warning">(Add URL first)</span>}
                              </label>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right Column: Drag & Drop Media Upload */}
            <div className="sell-section">
              <div className="card form-card-glass sticky-media-box">
                <h3 className="section-subtitle"><Eye size={20} className="text-orange" /> Showcased Media</h3>
                <p className="text-sm text-muted mb-4">Upload the single image or video generated by this prompt that will represent it in the feed.</p>

                <div
                  className={`media-dropzone ${dragging ? 'dragging' : ''} ${media ? 'has-media' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {media ? (
                    <div className="media-preview-container">
                      {mediaType === 'video' ? (
                        <video src={media} autoPlay muted loop playsInline controls />
                      ) : (
                        <img src={media} alt="Prompt showcased result" />
                      )}
                      <button
                        type="button"
                        className="media-clear-btn"
                        onClick={() => setMedia(null)}
                        title="Remove Media"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="dropzone-label">
                      <input
                        type="file"
                        hidden
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                      />
                      <div className="upload-icon-circle">
                        <Upload size={32} />
                      </div>
                      <span className="dropzone-text-main">Drag & Drop Image or Video</span>
                      <span className="dropzone-text-sub">or click to browse from device</span>
                      <span className="dropzone-limits">Supports MP4, WebM, PNG, JPG, WebP</span>
                    </label>
                  )}
                </div>

                <div className="post-security-badge" style={{ marginTop: '24px' }}>
                  <ShieldCheck size={18} className="text-green" />
                  <span>Immediate Publish - Posted directly to Feed</span>
                </div>
              </div>

              {/* Publish Actions */}
              <div className="publish-actions-container">
                <button
                  type="submit"
                  className="btn btn-primary btn-xl w-full"
                  disabled={loading || !name || !description || !prompt || !media}
                  style={{ opacity: (loading || !name || !description || !prompt || !media) ? 0.6 : 1 }}
                >
                  {loading ? 'Publishing...' : (isEditMode ? 'Save & Update Post' : 'Publish Post to Feed')}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Limit Upgrade Modal */}
      {limitModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.25s ease-out'
        }} onClick={() => setLimitModal({ show: false, planName: '', limit: 0 })}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.15)',
            padding: '40px 30px',
            borderRadius: '24px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--color-cyan, #06b6d4)'
            }}>
              <AlertCircle size={32} />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.75rem', marginBottom: '16px' }}>
              Limit Reached
            </h2>
            
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.6' }}>
              Your current plan (<strong>{limitModal.planName}</strong>) allows you to select at most <strong>{limitModal.limit}</strong> lock rule{limitModal.limit === 1 ? '' : 's'}. Upgrade your plan to add more social tasks and unlock full creator settings!
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setLimitModal({ show: false, planName: '', limit: 0 })}
                className="btn btn-secondary"
                style={{ flex: 1, height: '48px', borderRadius: '14px', fontSize: '0.95rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  height: '48px', 
                  borderRadius: '14px', 
                  fontSize: '0.95rem',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
