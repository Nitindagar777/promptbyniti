/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign, Eye, Camera, Lock, Check, Repeat, Video, Info, Copy, ChevronDown, Code, FileText, Bot, Clock, RotateCw, ZoomIn, Activity, Film, Package, Send, Mail, Globe, Loader2, Crown } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PromptThumbnail from '../components/PromptThumbnail';
import MasonryGrid from '../components/MasonryGrid';
import PinterestCard from '../components/PinterestCard';
import SEOHead from '../components/SEOHead';
import QuantumReactor from '../components/QuantumReactor';
import './HomePage.css';

const API_URL = '/api';

// Seeded shuffle — deterministic order for the same dataset so cards never jump
const seededShuffle = (arr) => {
  const out = [...arr];
  let seed = 0;
  for (const item of out) {
    const s = String(item.keyId);
    for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) | 0;
  }
  const next = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 0x7fffffff; };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const REF_MODE_SEQUENCE = [
  { cat: 'image', sub: 'sameScene' },
  { cat: 'image', sub: 'different' },
  { cat: 'image', sub: 'fixed' },
  { cat: 'video', sub: 'sameSceneLoop' },
  { cat: 'video', sub: 'differentScenes' },
  { cat: 'video', sub: 'fixedCharacterMotion' },
  { cat: 'text', sub: 'code' },
  { cat: 'text', sub: 'copywriting' },
  { cat: 'text', sub: 'agents' }
];

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));
  return (
    <div className="p-testimonial-card__stars">
      {'★'.repeat(fullStars)}
      {hasHalf && <span className="half-star">★</span>}
      {emptyStars > 0 && <span className="empty-stars">{'★'.repeat(emptyStars)}</span>}
    </div>
  );
};

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

export default function HomePage() {
  const { state, dispatch, canGenerate, useCredit, addPrompt, cache, setCachedData, setScroll, getScroll, refetchMarketplace } = useApp();
  const location = useLocation();
  const [prompts, setPrompts] = useState(state.marketplace || []);
  const [modelSectionVisible, setModelSectionVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('promptniti_model_visible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [storeSectionVisible, setStoreSectionVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('promptniti_store_visible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
  const isAdmin = state?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() || state?.user?.role === 'admin' || state?.user?.isAdmin;

  // Sync prompts whenever state.marketplace is updated or preloaded
  useEffect(() => {
    if (state.marketplace && state.marketplace.length > 0) {
      setPrompts(state.marketplace);
    }
  }, [state.marketplace]);

  // Fetch visibility settings from public settings
  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const isModelVis = data.modelSectionVisible ?? true;
            const isStoreVis = data.storeSectionVisible ?? true;
            setModelSectionVisible(isModelVis);
            setStoreSectionVisible(isStoreVis);
            localStorage.setItem('promptniti_model_visible', JSON.stringify(isModelVis));
            localStorage.setItem('promptniti_store_visible', JSON.stringify(isStoreVis));
          }
        }
      } catch (err) { }
    };
    fetchVisibility();

    const handleModelEvent = (e) => {
      if (e.detail && typeof e.detail.modelSectionVisible === 'boolean') {
        setModelSectionVisible(e.detail.modelSectionVisible);
        localStorage.setItem('promptniti_model_visible', JSON.stringify(e.detail.modelSectionVisible));
      } else {
        fetchVisibility();
      }
    };

    const handleStoreEvent = (e) => {
      if (e.detail && typeof e.detail.storeSectionVisible === 'boolean') {
        setStoreSectionVisible(e.detail.storeSectionVisible);
        localStorage.setItem('promptniti_store_visible', JSON.stringify(e.detail.storeSectionVisible));
      } else {
        fetchVisibility();
      }
    };

    window.addEventListener('modelVisibilityChanged', handleModelEvent);
    window.addEventListener('storeVisibilityChanged', handleStoreEvent);
    return () => {
      window.removeEventListener('modelVisibilityChanged', handleModelEvent);
      window.removeEventListener('storeVisibilityChanged', handleStoreEvent);
    };
  }, [location.pathname]);

  // Always fetch fresh data on mount, but never block rendering
  useEffect(() => {
    if (refetchMarketplace) {
      refetchMarketplace();
    }
  }, []);
  const navigate = useNavigate();
  const [previewPrompt, setPreviewPrompt] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Build, shuffle, and slice prompt sample cards to exactly 16 items (4 rows of 4 columns)
  const feedItems = useMemo(() => {
    const items = [];
    const sourcePrompts = state.marketplace || [];
    sourcePrompts.forEach((tmpl, tmplIdx) => {
      const cat = (tmpl.category || '').toLowerCase().trim();
      const isModel = cat === 'model' || cat === 'models' || tmpl.isModel === true;
      if (!modelSectionVisible && isModel) return;

      const isText = tmpl.generateType === 'text';
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      const mainCover = tmpl.thumbnail || tmpl.video || sampleSrc || tmpl.image;

      items.push({
        prompt: tmpl,
        mediaSrc: isText ? null : mainCover,
        isTextOnly: isText || !mainCover,
        sampleIndex: 0,
        keyId: tmpl.id || tmpl._id || `tmpl-${tmplIdx}`
      });
    });

    // Sort by createdAt descending to ensure latest/newest content is visible first
    const sortedItems = [...items].sort((a, b) => {
      const dateA = a.prompt?.createdAt ? new Date(a.prompt.createdAt).getTime() : 0;
      const dateB = b.prompt?.createdAt ? new Date(b.prompt.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sortedItems.slice(0, 20);
  }, [state.marketplace, modelSectionVisible]);

  const storeItems = useMemo(() => {
    const list = (state.marketplace && state.marketplace.length > 0) ? state.marketplace : prompts;
    const filtered = list.filter(t => {
      const cat = (t.category || '').toLowerCase().trim();
      const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
      if (!modelSectionVisible && isModel) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 20);
  }, [state.marketplace, prompts, modelSectionVisible]);

  const storeFeedItems = useMemo(() => {
    const list = (state.marketplace && state.marketplace.length > 0) ? state.marketplace : prompts;
    const nonModelList = list.filter(t => {
      const cat = (t.category || '').toLowerCase().trim();
      const isModel = cat === 'model' || cat === 'models' || t.isModel === true;
      if (!modelSectionVisible && isModel) return false;
      return cat !== 'model' && cat !== 'models';
    });
    const sorted = [...nonModelList].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 20).map((tmpl, idx) => {
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      return {
        keyId: `home-store-${tmpl._id || tmpl.id || idx}`,
        prompt: tmpl,
        sampleIndex: 0,
        mediaSrc: tmpl.thumbnail || sampleSrc || '',
        isTextOnly: false
      };
    });
  }, [state.marketplace, prompts]);

  // Build model-specific feed items for the Model Prompt section (4x4 = 16 items max)
  const modelFeedItems = useMemo(() => {
    const list = (state.marketplace && state.marketplace.length > 0) ? state.marketplace : prompts;
    // Strictly filter for prompts explicitly assigned under the model category
    const modelPrompts = list.filter(t => {
      const cat = (t.category || '').toLowerCase().trim();
      return cat === 'model' || cat === 'models';
    });
    const sorted = [...modelPrompts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 16).map((tmpl, idx) => {
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      return {
        keyId: `home-model-${tmpl._id || tmpl.id || idx}`,
        prompt: tmpl,
        sampleIndex: 0,
        mediaSrc: tmpl.thumbnail || sampleSrc || '',
        isTextOnly: false
      };
    });
  }, [state.marketplace, prompts]);

  // Reference Modes Showcase Section States
  const [activeRefCategory, setActiveRefCategory] = useState('image'); // 'image' | 'video' | 'text'
  const [activeImageMode, setActiveImageMode] = useState('sameScene'); // 'sameScene' | 'different' | 'fixed'
  const [activeVideoMode, setActiveVideoMode] = useState('sameSceneLoop'); // 'sameSceneLoop' | 'differentScenes' | 'fixedCharacterMotion'
  const [activeTextMode, setActiveTextMode] = useState('code'); // 'code' | 'copywriting' | 'agents'

  const handleSelectFeature = (e, category, subMode) => {
    e.preventDefault();
    setActiveRefCategory(category);
    if (category === 'image') {
      setActiveImageMode(subMode);
    } else if (category === 'video') {
      setActiveVideoMode(subMode);
    } else if (category === 'text') {
      setActiveTextMode(subMode);
    }
    const el = document.getElementById('ref-modes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollContainerRef = useRef(null);

  const scrollBannersLeft = (e) => {
    e.preventDefault();
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth / 3;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 16, behavior: 'smooth' });
    }
  };

  const scrollBannersRight = (e) => {
    e.preventDefault();
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth / 3;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
    }
  };

  // Video Reference Refs for play/pause control
  const videoRefs = {
    sameSceneLoop: useRef(null),
    differentScenes: useRef(null),
    fixedCharacterMotion: useRef(null)
  };



  // Testimonials & Reviews State
  const DEFAULT_TESTIMONIALS = [
    {
      quote: "The reference mode is a game-changer. I can now maintain character consistency across entire comic series. Nothing else comes close.",
      name: "Priya M.",
      role: "Digital Comic Artist",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "I've tried PromptBase and others, but the prompt quality here is on another level. The multi-model support saves me hours of tweaking.",
      name: "Alex R.",
      role: "AI Art Creator",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "Using these prompts has completely transformed my social media content. My engagement has gone up by 400% and I've gained thousands of followers.",
      name: "Jordan K.",
      role: "Social Media Influencer",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "The custom prompt options and model fine-tuning are incredible. The output images look exactly like what I envisioned in my mind.",
      name: "Marcus L.",
      role: "3D Concept Artist",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "Maintaining visual consistency is crucial for my brand, and the reference engine locks character faces perfectly. My followers love the storytelling!",
      name: "Elena S.",
      role: "Content Creator",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ];

  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ quote: '', stars: 5 });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Fetch global reviews from API on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews`);
        const data = await res.json();
        if (data.success && data.reviews && data.reviews.length > 0) {
          // Only show 4+ star reviews in the carousel, limit to 20
          const filtered = data.reviews.filter(r => r.stars >= 4).slice(0, 20);
          if (filtered.length > 0) {
            // Merge API reviews (newest first) with defaults as fallback
            const merged = [...filtered];
            for (const item of DEFAULT_TESTIMONIALS) {
              if (merged.length >= 20) break;
              if (!merged.some(m => m.name === item.name)) {
                merged.push(item);
              }
            }
            setTestimonials(merged);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const getCardClass = useCallback((idx) => {
    const total = testimonials.length;
    let diff = idx - activeTestimonialIndex;
    while (diff > total / 2) diff -= total;
    while (diff <= -total / 2) diff += total;

    if (diff === 0) return 'pos-center';
    if (diff === -1) return 'pos-left-1';
    if (diff === 1) return 'pos-right-1';
    if (diff === -2) return 'pos-left-2';
    if (diff === 2) return 'pos-right-2';
    return 'pos-hidden';
  }, [activeTestimonialIndex, testimonials.length]);

  const handleNextTestimonial = useCallback(() => {
    setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrevTestimonial = useCallback(() => {
    setActiveTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextTestimonial();
    }, 3000);
    return () => clearInterval(timer);
  }, [handleNextTestimonial]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!state.user) return;
    if (!newReview.quote.trim()) return;
    if (reviewSubmitting) return;

    setReviewSubmitting(true);

    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quote: newReview.quote,
          stars: newReview.stars
        })
      });
      const data = await res.json();

      if (data.success && data.review) {
        // If the new review is 4+ stars, add it to the visible carousel
        if (data.review.stars >= 4) {
          setTestimonials(prev => {
            const updated = [data.review, ...prev].slice(0, 20);
            return updated;
          });
          setActiveTestimonialIndex(0);
        }

        setNewReview({ quote: '', stars: 5 });
        setShowReviewForm(false);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };


  useEffect(() => {
    fetchPrompts();

    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, []);

  // Smooth scroll to store section if hash is present
  useEffect(() => {
    if (location.hash === '#store-section') {
      const handleScroll = () => {
        const el = document.getElementById('store-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      };
      // Try immediate and with a delay for safety
      handleScroll();
      const timer = setTimeout(handleScroll, 500);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);


  // Go to next reference mode in the global loop sequence
  const goToNextMode = useCallback(() => {
    const activeSub = activeRefCategory === 'image'
      ? activeImageMode
      : activeRefCategory === 'video'
        ? activeVideoMode
        : activeTextMode;

    const currentIndex = REF_MODE_SEQUENCE.findIndex(
      s => s.cat === activeRefCategory && s.sub === activeSub
    );

    const nextIndex = (currentIndex !== -1 ? currentIndex + 1 : 0) % REF_MODE_SEQUENCE.length;
    const next = REF_MODE_SEQUENCE[nextIndex];

    setActiveRefCategory(next.cat);
    if (next.cat === 'image') {
      setActiveImageMode(next.sub);
    } else if (next.cat === 'video') {
      setActiveVideoMode(next.sub);
    } else if (next.cat === 'text') {
      setActiveTextMode(next.sub);
    }
  }, [activeRefCategory, activeImageMode, activeVideoMode, activeTextMode]);

  // Handler to auto-switch Reference Modes when a video ends
  const handleVideoEnded = useCallback(() => {
    if (activeRefCategory === 'video') {
      goToNextMode();
    }
  }, [activeRefCategory, goToNextMode]);

  // Unified auto-rotation timer for reference modes (resets automatically on manual user interaction)
  useEffect(() => {
    const isVideo = activeRefCategory === 'video';
    const delay = isVideo ? 12000 : 4000; // 12s fallback for videos, 4s for image/text tabs

    const timer = setTimeout(() => {
      goToNextMode();
    }, delay);

    return () => clearTimeout(timer);
  }, [activeRefCategory, activeImageMode, activeVideoMode, activeTextMode, goToNextMode]);

  // Effect to control playing/pausing of reference videos based on active video mode and category tab
  useEffect(() => {
    Object.entries(videoRefs).forEach(([key, ref]) => {
      const videoEl = ref.current;
      if (videoEl) {
        if (activeRefCategory === 'video' && key === activeVideoMode) {
          videoEl.play().catch(err => {
            if (err.name !== 'AbortError') {
              console.log(`Video play interrupted for ${key}:`, err);
            }
          });
        } else {
          videoEl.pause();
        }
      }
    });
  }, [activeVideoMode, activeRefCategory]);


  const fetchPrompts = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch(`${API_URL}/prompts`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;

      const data = await res.json();
      if (data && data.success && Array.isArray(data.prompts)) {
        const sliced = data.prompts.slice(0, 8);
        setPrompts(sliced);
        dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Network notice fetching home prompts:', err.message);
      }
    }
  };

  return (
    <div className="p-home" id="home-page">
      <SEOHead
        title="AI Prompt & Agent Generation — Prompts. Agents. Built by AI."
        description="Prompt by Niti is the premier platform for AI Prompt & Agent Generation. Prompts. Agents. Built by AI. Craft consistent character prompts for Midjourney & Flux, cinematic motion anchors for Sora & Kling, and autonomous AI agents & system blueprints."
        keywords="ai prompt generator, ai agent generator, ai prompt & agent generation, prompts agents built by ai, autonomous ai agents, agent prompt generator, midjourney prompt generator, chatgpt prompt generator, sora video prompts, flux prompt generator, text to code prompts, prompt templates, prompt engineering, promptbyniti"
        breadcrumbs={[
          { name: 'Home', url: '/' }
        ]}
      />
      {/* 01. HERO */}
      <section className="p-hero">
        <div className="container">

          {/* Mini Banners Row */}
          <div className="p-hero__mini-banners-wrapper reveal" style={{ animationDelay: '0.05s' }}>
            <button className="p-mini-banners__nav-btn p-mini-banners__nav-btn--prev" onClick={scrollBannersLeft} aria-label="Scroll left">
              &lsaquo;
            </button>

            <div className="p-hero__mini-banners" ref={scrollContainerRef}>

              {/* 2nd banner: Image Generation Agent */}
              <a href="#ref-modes" onClick={(e) => handleSelectFeature(e, 'image', 'sameScene')} className="p-mini-banner p-mini-banner--cyan" style={{ backgroundImage: "url('/same_scene_ref.png')" }}>
                <div className="p-mini-banner__top">
                  <Image size={16} className="text-cyan" />
                </div>
                <h4 className="p-mini-banner__title">Image Generation Agent</h4>
                <p className="p-mini-banner__desc">Lock faces, outfits, and styles across scenes.</p>
              </a>

              {/* 3rd banner: Video Generation Agent */}
              <a href="#ref-modes" onClick={(e) => handleSelectFeature(e, 'video', 'sameSceneLoop')} className="p-mini-banner p-mini-banner--orange" style={{ backgroundImage: "url('/fixed_character_ref.png')" }}>
                <div className="p-mini-banner__top">
                  <Video size={16} className="text-orange" />
                </div>
                <h4 className="p-mini-banner__title">Video Generation Agent</h4>
                <p className="p-mini-banner__desc">Generate cinematic motion loops and characters.</p>
              </a>

              {/* 4th banner: Super Agent */}
              <a href="#ref-modes" onClick={(e) => handleSelectFeature(e, 'text', 'agents')} className="p-mini-banner p-mini-banner--purple">
                <div className="p-mini-banner__top">
                  <Bot size={16} className="text-purple" />
                </div>
                <h4 className="p-mini-banner__title">Super Agent</h4>
                <p className="p-mini-banner__desc">Format autonomous agents, system rules & code.</p>
              </a>
            </div>

            <button className="p-mini-banners__nav-btn p-mini-banners__nav-btn--next" onClick={scrollBannersRight} aria-label="Scroll right">
              &rsaquo;
            </button>
          </div>

          <div className="p-hero__split-grid">
            {/* Left Hero Content */}
            <div className="p-hero__content-col reveal" style={{ animationDelay: '0.1s' }}>

              <h1 className="p-hero__title" style={{ fontSize: 'clamp(2.1rem, 3.3vw, 3.2rem)', lineHeight: '1.2' }}>
                <span className="text-cyan" style={{ whiteSpace: 'nowrap' }}>AI Prompt</span> <span style={{ color: '#ffffff', margin: '0 6px' }}>&</span> <span className="text-cyan" style={{ whiteSpace: 'nowrap' }}>Agent</span> <br className="hide-on-mobile" />
                <span className="text-orange" style={{ whiteSpace: 'nowrap' }}>Generation</span>
              </h1>

              <p className="p-hero__pitch">
                Generate & craft high-performing <strong className="text-cyan">AI Prompts</strong> <span style={{ color: '#ffffff' }}>&</span> autonomous <strong className="text-purple">AI Agents</strong>, powered by <strong className="text-pink">smart multi-modal engines</strong> and reference consistency that keeps every character, style, and agent persona <strong className="text-green">perfectly consistent</strong>.
              </p>

              <p className="p-hero__subtitle p-hero__subtitle--accent">
                <span className="text-orange">Prompts.</span> <span className="text-cyan">Agents.</span> <span className="text-purple">Built by AI.</span>
              </p>

              <div className="p-hero__btns">
                <Link to={state?.user ? "/generate" : "/login"} className="btn btn-primary btn-xl">
                  Start Generating <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                </Link>
                {storeSectionVisible ? (
                  <Link to="/templates" className="btn btn-secondary btn-xl">
                    Explore Store <Sparkles size={18} style={{ marginLeft: '4px' }} />
                  </Link>
                ) : (
                  <a href="#ref-modes" className="btn btn-secondary btn-xl">
                    Explore Modes <Sparkles size={18} style={{ marginLeft: '4px' }} />
                  </a>
                )}
              </div>

              {/* Feature Pills */}
              <div className="p-hero__features">
                <div className="p-hero__feature-item">
                  <Sparkles size={16} className="text-pink" />
                  <span>AI Prompts <span style={{ color: '#ffffff' }}>&</span> Autonomous Agents</span>
                </div>
                <div className="p-hero__feature-item">
                  <ZapIcon size={16} className="text-orange" />
                  <span>3 Consistency & Persona Engines</span>
                </div>
                <div className="p-hero__feature-item">
                  <Layers size={16} className="text-cyan" />
                  <span>Midjourney, Sora, ChatGPT, Claude <span style={{ color: '#ffffff' }}>&</span> Agents</span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase (Interactive Quantum Prompt Reactor) */}
            <div className="p-hero__showcase-col reveal" style={{ animationDelay: '0.2s' }}>
              <QuantumReactor />
            </div>
          </div>
        </div>
      </section>

      {/* MODEL PROMPT SECTION (before Premium Store) */}
      {modelSectionVisible && modelFeedItems.length > 0 && (
        <section className="p-model-section" id="model-section">
          <div className="container">
            <div className="p-model-header reveal">
              <div className="p-model-header__info">
                <span className="p-model-header__subtitle">
                  <Crown size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Model Prompt
                </span>
                <h2 className="h-display" style={{ marginTop: 0 }}>Premium <span className="text-pink">Model</span> Prompts</h2>
              </div>
              <Link to="/model" className="btn btn-secondary" style={{ color: '#ffffff' }}>
                View All Models <Crown size={18} style={{ marginLeft: '8px', color: '#ffffff' }} />
              </Link>
            </div>

            <MasonryGrid
              columns={4}
              items={modelFeedItems}
              renderItem={(item, i) => (
                <PinterestCard key={item.keyId} item={item} index={i} />
              )}
            />
          </div>
        </section>
      )}

      {/* STORE SECTION */}
      {storeSectionVisible && (
        <section className="p-store-section" id="store-section">
          <div className="container">
            <div className="p-store-header reveal">
              <div className="p-store-header__info">
                <span className="p-store-header__subtitle">Prompt Store</span>
                <h2 className="h-display" style={{ marginTop: 0 }}>Featured <span className="text-orange">Prompts</span></h2>
              </div>
              <Link to="/templates" className="btn btn-secondary">
                Browse Store Feed <Sparkles size={18} style={{ marginLeft: '8px' }} />
              </Link>
            </div>

            {storeFeedItems.length > 0 ? (
              <MasonryGrid
                columns={4}
                items={storeFeedItems}
                renderItem={(item, i) => (
                  <PinterestCard key={item.keyId} item={item} index={i} />
                )}
              />
            ) : (
              <div className="p-market-empty" style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <Loader2 size={40} className="animate-spin text-cyan" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading prompts feed...</p>
              </div>
            )}
          </div>
        </section>
      )}



      {/* UNIFIED AI REFERENCE MODES SECTION */}
      <section className="p-ref-modes section-spacing" id="ref-modes">
        <div className="container">
          <div className="p-ref-modes__header reveal">
            <h2 className="h-display text-center">AI Agent <span className="text-cyan">Reference</span> Modes</h2>
            <p className="text-center p-ref-modes__subtitle">
              Explore how our advanced prompt templates maintain consistency across images, videos, and autonomous agents.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="p-ref-modes__category-tabs reveal">
            <button className={`p-ref-modes__cat-tab ${activeRefCategory === 'image' ? 'active p-ref-modes__cat-tab--image' : ''}`} onClick={() => setActiveRefCategory('image')}>
              <Image size={18} />
              <span>Image Generation Agent</span>
            </button>
            <button className={`p-ref-modes__cat-tab ${activeRefCategory === 'video' ? 'active p-ref-modes__cat-tab--video' : ''}`} onClick={() => setActiveRefCategory('video')}>
              <Video size={18} />
              <span>Video Generation Agent</span>
            </button>
            <button className={`p-ref-modes__cat-tab ${activeRefCategory === 'text' ? 'active p-ref-modes__cat-tab--text' : ''}`} onClick={() => setActiveRefCategory('text')}>
              <Bot size={18} />
              <span>Super Agent</span>
            </button>
          </div>

          {/* Tabbed Panels */}
          <div className="p-ref-modes__panels">

            {/* IMAGE PANEL */}
            <div className={`p-ref-modes__panel ${activeRefCategory === 'image' ? 'active' : ''}`}>
              <div className="p-ref-modes__showcase-grid">
                {/* Left Column: Media Preview */}
                <div className="p-ref-modes__left-pane">
                  <div className="p-ref-modes__sub-toggles">
                    <button
                      className={`p-ref-modes__sub-btn ${activeImageMode === 'sameScene' ? 'active active--sameScene' : ''}`}
                      onClick={() => setActiveImageMode('sameScene')}
                    >
                      <Camera size={16} />
                      <span>Same Scene</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeImageMode === 'different' ? 'active active--different' : ''}`}
                      onClick={() => setActiveImageMode('different')}
                    >
                      <Repeat size={16} />
                      <span>Diff Subjects</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeImageMode === 'fixed' ? 'active active--fixed' : ''}`}
                      onClick={() => setActiveImageMode('fixed')}
                    >
                      <Lock size={16} />
                      <span>Fixed Character</span>
                    </button>
                  </div>

                  <div className="p-ref-modes__media-wrap">
                    <img
                      src="/same_scene_ref.png"
                      alt="Same Scene Image Reference Guide"
                      className={`p-ref-modes__showcase-media ${activeImageMode === 'sameScene' ? 'active' : ''}`}
                    />
                    <img
                      src="/diff_characters_ref.png"
                      alt="Different Characters Image Reference Guide"
                      className={`p-ref-modes__showcase-media ${activeImageMode === 'different' ? 'active' : ''}`}
                    />
                    <img
                      src="/fixed_character_ref.png"
                      alt="Fixed Character Image Reference Guide"
                      className={`p-ref-modes__showcase-media ${activeImageMode === 'fixed' ? 'active' : ''}`}
                    />
                  </div>

                  {/* Supported Image Styles & Presets */}
                  <div className="p-ref-modes__text-categories-list">
                    <span className="p-ref-modes__text-list-label">Supported Image Styles & Presets</span>
                    <div className="p-ref-modes__text-list-chips">
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Camera size={12} /> Portraits</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Eye size={12} /> Cinematic Shots</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Heart size={12} /> Anime & Manga</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Layers size={12} /> 3D Concept Art</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Palette size={12} /> Vector Art</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Image size={12} /> Comic Book Style</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Palette size={12} /> Watercolor</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Layers size={12} /> Pixel Art</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Package size={12} /> Product Design</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Zap size={12} /> Logo Design</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Palette size={12} /> Oil Painting</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Wand2 size={12} /> Lineart & Sketch</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Data Card */}
                <div className="p-ref-modes__right-pane">
                  <div className="p-ref-modes__info-card glass-effect">
                    {/* Same Scene Mode Content */}
                    <div className={`p-ref-modes__info-card-content ${activeImageMode === 'sameScene' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--sameScene">
                          Same Scene / Photoshoot
                        </span>
                        <h3>Maintain Identical Background & Composition</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'A [camera_angle] photoshoot of [subject] posing in [setting] --cref [url] --cw 100 ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Subject Identity:</strong> Face shape, eyes, hair color, and basic features</li>
                            <li><strong>Outfit Details:</strong> Dress style, clothing texture, and accessory colors</li>
                            <li><strong>Lighting & Setting:</strong> The ambient illumination and background scenery</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Pose & Angle:</strong> Standing front-facing vs looking back over shoulder</li>
                            <li><strong>Framing:</strong> Close-up zoom vs full-body frame length</li>
                            <li><strong>Expression:</strong> Smiles, natural gaze changes, head tilt</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Text-to-Image Consistency:</strong> You can upload any reference image (such as a character profile or style reference) and use these image reference modes to generate consistent characters in new poses, settings, or expressions!
                        </div>
                      </div>
                    </div>

                    {/* Different Subjects Mode Content */}
                    <div className={`p-ref-modes__info-card-content ${activeImageMode === 'different' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--different">
                          Different Subjects / Medium Match
                        </span>
                        <h3>Maintain Artistic Style & Medium Coherence</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'A stylized [medium] illustration of a [animal_subject], [color] palette, geometric vector style ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Artistic Medium:</strong> Stained-glass vector illustration</li>
                            <li><strong>Composition:</strong> Single-subject centered profile layout</li>
                            <li><strong>Rendering Style:</strong> Geometric contours and stylized line art</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Main Subject:</strong> Swaps the animal (Leopard ➔ Fox ➔ Owl)</li>
                            <li><strong>Colors:</strong> Hue matches the natural coloration of the new subject</li>
                            <li><strong>Details:</strong> Contours adapt to the physical shape of the animal</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Text-to-Image Consistency:</strong> You can upload any reference image (such as a character profile or style reference) and use these image reference modes to generate consistent characters in new poses, settings, or expressions!
                        </div>
                      </div>
                    </div>

                    {/* Fixed Character Mode Content */}
                    <div className={`p-ref-modes__info-card-content ${activeImageMode === 'fixed' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--fixed">
                          Fixed Character / Consistency
                        </span>
                        <h3>Lock Character Details & Move Settings</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'A close-up shot of [character] performing [action] at [new_background] --cref [url] --cw 100 ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Character Identity:</strong> Hair cut/color, facial features, body structure</li>
                            <li><strong>Exact Outfit:</strong> Teal sporty windbreaker, sunglasses, helmet</li>
                            <li><strong>Key Accessories:</strong> Black skateboard, trousers</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Scenery:</strong> Sunny beach ➔ concrete city stairs ➔ urban streets</li>
                            <li><strong>Action:</strong> Cruising ➔ jumping high in air ➔ standing post-ride</li>
                            <li><strong>Lighting Vibe:</strong> Direct warm sunlight ➔ overcast soft day glow</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Text-to-Image Consistency:</strong> You can upload any reference image (such as a character profile or style reference) and use these image reference modes to generate consistent characters in new poses, settings, or expressions!
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-ref-modes__footer-actions">
                    <Link to={state?.user ? "/generate" : "/login"} className="btn btn-primary btn-xl">
                      Try image reference mode <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO PANEL */}
            <div className={`p-ref-modes__panel ${activeRefCategory === 'video' ? 'active' : ''}`}>
              <div className="p-ref-modes__showcase-grid p-ref-modes__showcase-grid--reversed">
                {/* Left Column: Data Card */}
                <div className="p-ref-modes__right-pane">
                  <div className="p-ref-modes__info-card glass-effect">
                    {/* Same Scene Video Content */}
                    <div className={`p-ref-modes__info-card-content ${activeVideoMode === 'sameSceneLoop' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--sameSceneLoop">
                          🎥 Same Scene Video
                        </span>
                        <h3>Animate Details Within A Stationary Frame</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Video Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'Generate a video of: Scene 1 (0 to 2.5 seconds): [subject] posing in [setting], slow zoom --ar 16:9 ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Character Details:</strong> Face, hair, age, and identity details remain static</li>
                            <li><strong>Background & Frame:</strong> The background set, composition, and props do not shift</li>
                            <li><strong>Art Style:</strong> Cinematic resolution, color depth, lighting levels</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Micro-movement:</strong> Gentle breathing, hair blowing in breeze, blinking</li>
                            <li><strong>Atmosphere:</strong> Tree leaves swaying, wind blowing, minor shadows moving</li>
                            <li><strong>Timing:</strong> Continuous fluid loop across the timeline</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Image-to-Video Generation:</strong> You can upload any static reference image (such as a character sheet or portrait) and select these video reference modes to bring that exact character to life with smooth, consistent motion!
                        </div>
                      </div>
                    </div>

                    {/* Different Scenes Content */}
                    <div className={`p-ref-modes__info-card-content ${activeVideoMode === 'differentScenes' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--differentScenes">
                          🎬 Different Scenes (Continuity)
                        </span>
                        <h3>Follow a Consistent Character Across Locations</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Video Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'Generate a video of: Scene 1 (0 to 2.5 seconds): [character] walking in [location_1] --ar 16:9. Scene 2 (2.5 to 5.0 seconds): [character] sitting in [location_2] --ar 16:9 ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Character Identity:</strong> Hair style, facial contours, eyes, skin tone</li>
                            <li><strong>Outfit Consistency:</strong> Specific clothes, colours, and accessories</li>
                            <li><strong>Visual Tone:</strong> Consistent camera lenses, color grade, and grading</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Environment:</strong> Swaps backgrounds (e.g. library ➔ cafeteria ➔ outdoors)</li>
                            <li><strong>Action/Activity:</strong> Walking ➔ sitting down ➔ reading ➔ talking</li>
                            <li><strong>Camera Angle:</strong> Transitioning between close-ups and medium pans</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Image-to-Video Generation:</strong> You can upload any static reference image (such as a character sheet or portrait) and select these video reference modes to bring that exact character to life with smooth, consistent motion!
                        </div>
                      </div>
                    </div>

                    {/* Fixed Character + Motion Content */}
                    <div className={`p-ref-modes__info-card-content ${activeVideoMode === 'fixedCharacterMotion' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--fixedCharacterMotion">
                          📽️ Fixed Character + Motion
                        </span>
                        <h3>Maintain Character Poses & Rotate Camera</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Video Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'Generate a video of: Scene 1 (0 to 2.5 seconds): orbital camera rotation around [character] performing [motion] --ar 16:9 ......'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Character Identity:</strong> Face features, build, and key traits</li>
                            <li><strong>Outfit:</strong> The specific teal jacket, sunglasses, and helmet</li>
                            <li><strong>Relative Stance:</strong> The subject remains center-frame as camera moves</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Camera Angle:</strong> Orbital rotating camera pan (360 orbit) around subject</li>
                            <li><strong>Dynamic Lighting:</strong> Reflections and shadows shift along with camera rotation</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Image-to-Video Generation:</strong> You can upload any static reference image (such as a character sheet or portrait) and select these video reference modes to bring that exact character to life with smooth, consistent motion!
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-ref-modes__footer-actions">
                    <Link to={state?.user ? "/generate" : "/login"} className="btn btn-sky btn-xl">
                      Try video reference mode <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Media Preview */}
                <div className="p-ref-modes__left-pane">
                  <div className="p-ref-modes__sub-toggles">
                    <button
                      className={`p-ref-modes__sub-btn ${activeVideoMode === 'sameSceneLoop' ? 'active active--sameScene' : ''}`}
                      onClick={() => setActiveVideoMode('sameSceneLoop')}
                    >
                      <Camera size={16} />
                      <span>Same Scene Video</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeVideoMode === 'differentScenes' ? 'active active--different' : ''}`}
                      onClick={() => setActiveVideoMode('differentScenes')}
                    >
                      <Repeat size={16} />
                      <span>Different Scenes</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeVideoMode === 'fixedCharacterMotion' ? 'active active--fixed' : ''}`}
                      onClick={() => setActiveVideoMode('fixedCharacterMotion')}
                    >
                      <Lock size={16} />
                      <span>Fixed Character + Motion</span>
                    </button>
                  </div>

                  <div className="p-ref-modes__media-wrap p-ref-modes__media-wrap--video">
                    <video
                      ref={videoRefs.sameSceneLoop}
                      src="/Same_Scene_Video_ref.mp4"
                      className={`p-ref-modes__showcase-media ${activeVideoMode === 'sameSceneLoop' ? 'active' : ''}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                    />
                    <video
                      ref={videoRefs.differentScenes}
                      src="/Different_Character_Video_ref.mp4"
                      className={`p-ref-modes__showcase-media ${activeVideoMode === 'differentScenes' ? 'active' : ''}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                    />
                    <video
                      ref={videoRefs.fixedCharacterMotion}
                      src="/Fixed_Character_Motion_Video_ref.mp4"
                      className={`p-ref-modes__showcase-media ${activeVideoMode === 'fixedCharacterMotion' ? 'active' : ''}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                    />
                  </div>

                  {/* Supported Cinematic Movements */}
                  <div className="p-ref-modes__text-categories-list">
                    <span className="p-ref-modes__text-list-label">Supported Camera Movements & Motions</span>
                    <div className="p-ref-modes__text-list-chips">
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><ZoomIn size={12} /> Slow Zoom</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><RotateCw size={12} /> Orbital Rotation</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Film size={12} /> Tracking Shot</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Rocket size={12} /> Drone Flyby</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Clock size={12} /> Timelapse</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><ArrowRight size={12} /> Panning Shot</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><ChevronDown size={12} /> Dynamic Tilt</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Eye size={12} /> Subject Follow</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Activity size={12} /> Handheld Shake</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Zap size={12} /> Slow Motion</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Repeat size={12} /> 360 Rotation</span>
                      <span className="p-ref-modes__text-chip p-ref-modes__text-chip--sky"><Sparkles size={12} /> Cinematic Focus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TEXT PANEL */}
            <div className={`p-ref-modes__panel ${activeRefCategory === 'text' ? 'active' : ''}`}>
              <div className="p-ref-modes__showcase-grid">
                {/* Left Column: Interactive IDE Mockup */}
                <div className="p-ref-modes__left-pane">
                  <div className="p-ref-modes__sub-toggles">
                    <button
                      className={`p-ref-modes__sub-btn ${activeTextMode === 'code' ? 'active active--sameScene' : ''}`}
                      onClick={() => setActiveTextMode('code')}
                    >
                      <Code size={16} />
                      <span>Structured Code</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeTextMode === 'copywriting' ? 'active active--different' : ''}`}
                      onClick={() => setActiveTextMode('copywriting')}
                    >
                      <FileText size={16} />
                      <span>Copywriting</span>
                    </button>
                    <button
                      className={`p-ref-modes__sub-btn ${activeTextMode === 'agents' ? 'active active--fixed' : ''}`}
                      onClick={() => setActiveTextMode('agents')}
                    >
                      <Bot size={16} />
                      <span>AI Agent Personas</span>
                    </button>
                  </div>

                  <div className="p-ref-modes__media-wrap p-ref-modes__media-wrap--text">
                    {/* Code Window */}
                    <div className={`p-ref-modes__editor-mock ${activeTextMode === 'code' ? 'active' : ''}`}>
                      <div className="p-ref-modes__editor-header">
                        <div className="p-ref-modes__editor-dots">
                          <span className="dot dot--red"></span>
                          <span className="dot dot--yellow"></span>
                          <span className="dot dot--green"></span>
                        </div>
                        <span className="p-ref-modes__editor-title">PromptReactor.jsx</span>
                      </div>
                      <div className="p-ref-modes__editor-body">
                        <div className="p-ref-modes__code-content">
                          <div className="code-line">
                            <span className="code-keyword">import</span> React, &#123; useState, useEffect &#125; <span className="code-keyword">from</span> <span className="code-string">'react'</span>;
                          </div>
                          <div className="code-line">
                            <span className="code-keyword">import</span> &#123; Sparkles &#125; <span className="code-keyword">from</span> <span className="code-string">'lucide-react'</span>;
                          </div>
                          <div className="code-line code-line--empty"></div>
                          <div className="code-line">
                            <span className="code-keyword">export default function</span> <span className="code-function">PromptReactor</span>() &#123;
                          </div>
                          <div className="code-line code-line--indent-1">
                            <span className="code-keyword">const</span> [state, setState] = <span className="code-function">useState</span>(<span className="code-string">'idle'</span>);
                          </div>
                          <div className="code-line code-line--empty"></div>
                          <div className="code-line code-line--indent-1">
                            <span className="code-function">useEffect</span>(() =&gt; &#123;
                          </div>
                          <div className="code-line code-line--indent-2">
                            <span className="code-comment">// Initialize quantum sequence</span>
                          </div>
                          <div className="code-line code-line--indent-2">
                            <span className="code-keyword">const</span> system = <span className="code-function">connectToAgent</span>();
                          </div>
                          <div className="code-line code-line--indent-2">
                            system.<span className="code-function">setPrecision</span>(<span className="code-string">'maximum'</span>);
                          </div>
                          <div className="code-line code-line--indent-1">
                            &#125;, []);
                          </div>
                          <div className="code-line code-line--empty"></div>
                          <div className="code-line code-line--indent-1">
                            <span className="code-keyword">return</span> (
                          </div>
                          <div className="code-line code-line--indent-2">
                            <span className="code-tag">&lt;div</span> <span className="code-attr">className</span>=<span className="code-string">"reactor-core"</span><span className="code-tag">&gt;</span>
                          </div>
                          <div className="code-line code-line--indent-3">
                            <span className="code-tag">&lt;Sparkles</span> <span className="code-attr">className</span>=<span className="code-string">"animated-spark"</span> <span className="code-tag">/&gt;</span>
                          </div>
                          <div className="code-line code-line--indent-3">
                            <span className="code-tag">&lt;h2&gt;</span>Prompt Reactor Activated<span className="code-tag">&lt;/h2&gt;</span>
                          </div>
                          <div className="code-line code-line--indent-2">
                            <span className="code-tag">&lt;/div&gt;</span>
                          </div>
                          <div className="code-line code-line--indent-1">
                            );
                          </div>
                          <div className="code-line">
                            &#125;
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Copywriting Window */}
                    <div className={`p-ref-modes__editor-mock ${activeTextMode === 'copywriting' ? 'active' : ''}`}>
                      <div className="p-ref-modes__editor-header">
                        <div className="p-ref-modes__editor-dots">
                          <span className="dot dot--red"></span>
                          <span className="dot dot--yellow"></span>
                          <span className="dot dot--green"></span>
                        </div>
                        <span className="p-ref-modes__editor-title">AIDA_Sales_Pitch.md</span>
                      </div>
                      <div className="p-ref-modes__editor-body">
                        <div className="p-ref-modes__doc-content">
                          <p><strong>[ATTENTION]</strong><br />
                            Stop burning hours on manual prompt adjustments that yield subpar results.</p>

                          <p><strong>[INTEREST]</strong><br />
                            Our revolutionary text reference engine locks in your desired framework structures, outputting consistent templates that execute perfectly on first try, every single time.</p>

                          <p><strong>[DESIRE]</strong><br />
                            Imagine generating high-converting sales letters, clean codebase files, or custom agent personas without manual adjustments or endless copy-pasting iterations.</p>

                          <p><strong>[ACTION]</strong><br />
                            Click "Start Generating" below to unlock premium text reference modes and boost your workflow efficiency by 10x today!</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Agent Chat Window */}
                    <div className={`p-ref-modes__editor-mock ${activeTextMode === 'agents' ? 'active' : ''}`}>
                      <div className="p-ref-modes__editor-header">
                        <div className="p-ref-modes__editor-dots">
                          <span className="dot dot--red"></span>
                          <span className="dot dot--yellow"></span>
                          <span className="dot dot--green"></span>
                        </div>
                        <span className="p-ref-modes__editor-title">System Persona Log</span>
                      </div>
                      <div className="p-ref-modes__editor-body">
                        <div className="p-ref-modes__chat-content">
                          <div className="chat-bubble chat-bubble--system">
                            <span className="bubble-label">SYSTEM INSTRUCTION</span>
                            <p>You are Antigravity, a professional Senior Developer AI. Focus heavily on production-ready, clean, well-documented code. Maintain a concise and helpful tone.</p>
                          </div>
                          <div className="chat-bubble chat-bubble--user">
                            <span className="bubble-label">USER</span>
                            <p>Explain how reference prompts optimize prompt styling.</p>
                          </div>
                          <div className="chat-bubble chat-bubble--agent">
                            <span className="bubble-label">AGENT (ANTIGRAVITY)</span>
                            <p>Reference prompts lock variables, styles, and structural frameworks into system layers. This forces the model's latent weights to prioritize consistency constraints over generic text outputs.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Supported Text Prompt Categories List */}
                  <div className="p-ref-modes__text-categories-list">
                    <span className="p-ref-modes__text-list-label">
                      {activeTextMode === 'agents' ? '12+ Platform Agent Personas' : 'Supported Prompt Categories'}
                    </span>
                    <div className="p-ref-modes__text-list-chips">
                      {activeTextMode === 'agents' ? (
                        <>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--pink">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            Instagram Growth Agent
                          </span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--blue">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" /></svg>
                            Facebook Ads Agent
                          </span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--blue">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            LinkedIn Content Agent
                          </span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--white">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            Twitter/X Growth Agent
                          </span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--red">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            YouTube SEO Agent
                          </span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--pink"><Video size={12} /> TikTok Scriptwriter</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--yellow"><Mail size={12} /> Cold Outreach Agent</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Globe size={12} /> SEO Writer Agent</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Send size={12} /> Telegram Funnel Agent</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--purple"><MessageSquare size={12} /> Support Chatbot Agent</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--orange"><ShoppingBag size={12} /> Shopify Ecom Agent</span>
                          <span className="p-ref-modes__text-chip p-ref-modes__text-chip--cyan"><Zap size={12} /> SaaS Product Agent</span>
                        </>
                      ) : (
                        <>
                          <span className="p-ref-modes__text-chip"><Bot size={12} /> AI Agents</span>
                          <span className="p-ref-modes__text-chip"><Code size={12} /> Code</span>
                          <span className="p-ref-modes__text-chip"><FileText size={12} /> Writing</span>
                          <span className="p-ref-modes__text-chip"><ShoppingBag size={12} /> Marketing</span>
                          <span className="p-ref-modes__text-chip"><Coins size={12} /> Business</span>
                          <span className="p-ref-modes__text-chip"><Sparkles size={12} /> Research</span>
                          <span className="p-ref-modes__text-chip"><Zap size={12} /> Education</span>
                          <span className="p-ref-modes__text-chip"><Layers size={12} /> Productivity</span>
                          <span className="p-ref-modes__text-chip"><Palette size={12} /> Creative</span>
                          <span className="p-ref-modes__text-chip"><MessageSquare size={12} /> Social Media</span>
                          <span className="p-ref-modes__text-chip"><DollarSign size={12} /> Ecommerce</span>
                          <span className="p-ref-modes__text-chip"><Wand2 size={12} /> Other</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Data Card */}
                <div className="p-ref-modes__right-pane">
                  <div className="p-ref-modes__info-card glass-effect">
                    {/* Code Generation Content */}
                    <div className={`p-ref-modes__info-card-content ${activeTextMode === 'code' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--sameScene">
                          💻 Structured Code Blueprints
                        </span>
                        <h3>Generate Clean, Syntactically-Perfect Code Blocks</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Code Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'Act as a Senior React Engineer. Write a [component_name] component that uses [hooks] and implements [features]. Output only valid ES6 syntax. Do not explain standard modules ...'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Syntax Style:</strong> Standardized code layouts and naming conventions</li>
                            <li><strong>Dependencies:</strong> Consistent package imports and library choices</li>
                            <li><strong>Comments:</strong> Detailed inline docstrings and documentation formats</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Component Logic:</strong> Adapts state logic and handler functions dynamically</li>
                            <li><strong>JSX Elements:</strong> Renders customized layout nodes based on feature specs</li>
                            <li><strong>Sub-components:</strong> Swaps child nodes based on design requests</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Text Reference Blueprints:</strong> Use these modes to lock in language choice, syntax rules, and error-handling strategies. This prevents random markdown commentary and enforces clean files.
                        </div>
                      </div>
                    </div>

                    {/* Copywriting Content */}
                    <div className={`p-ref-modes__info-card-content ${activeTextMode === 'copywriting' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--different">
                          ✍️ Copywriting Frameworks
                        </span>
                        <h3>Lock Structural Frameworks (AIDA, PAS, BAB)</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Copywriting Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'Write high-converting copy for [product] targeting [audience] using the [framework] framework. Keep Attention punchy, build Interest with statistics, create Desire with benefits ...'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>Copy Framework:</strong> Strict sectioning corresponding to AIDA, PAS, or BAB</li>
                            <li><strong>Marketing Tone:</strong> Persuasive, professional, benefit-driven style</li>
                            <li><strong>Formatting:</strong> Bullet points, bold headers, and short paragraphs</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Product Hook:</strong> Adapts the attention grabber to specific items/services</li>
                            <li><strong>Call-to-Action:</strong> Swaps signup links, discount triggers, or buy buttons</li>
                            <li><strong>Use Cases:</strong> Aligns problem/desire statements with user persona</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Copywriting Blueprints:</strong> Enforce structural formatting. This guarantees that marketing generators structure paragraphs logically, instead of dumping large blocks of unstructured sentences.
                        </div>
                      </div>
                    </div>

                    {/* AI Agent Personas Content */}
                    <div className={`p-ref-modes__info-card-content ${activeTextMode === 'agents' ? 'active' : ''}`}>
                      <div className="p-ref-modes__info-header">
                        <span className="p-ref-modes__badge p-ref-modes__badge--fixed">
                          🤖 AI Agent Personas
                        </span>
                        <h3>Define Strict System Rules & Chat Context</h3>
                      </div>

                      <div className="p-ref-modes__template-box">
                        <span className="p-ref-modes__template-label">Agent Prompt Template</span>
                        <pre className="p-ref-modes__template-code">
                          {'You are [agent_name], a specialized AI designed for [specific_role]. Always follow [rule_1], [rule_2]. Respond in a [tone] voice. Frame decisions using [framework] ...'}
                        </pre>
                      </div>

                      <div className="p-ref-modes__comparison-grid">
                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--same">
                          <h4>🟢 What Stays SAME</h4>
                          <ul>
                            <li><strong>System Mandate:</strong> The system instruction guidelines and behavior constraints</li>
                            <li><strong>Response Tone:</strong> Specific voice tone (e.g., academic, playful, analytical)</li>
                            <li><strong>Formatting Rules:</strong> Code-first outputs or structural guidelines</li>
                          </ul>
                        </div>

                        <div className="p-ref-modes__comparison-col p-ref-modes__comparison-col--changes">
                          <h4>⚡ What CHANGES</h4>
                          <ul>
                            <li><strong>Session Data:</strong> Custom user queries and incoming message history</li>
                            <li><strong>Task Context:</strong> Specific problem domain to analyze or code to write</li>
                            <li><strong>Action Output:</strong> Precise answers matching current conversation goals</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-ref-modes__tip-banner">
                        <div className="p-ref-modes__tip-icon">
                          <Info size={18} />
                        </div>
                        <div className="p-ref-modes__tip-text">
                          <strong>Agent Persona Blueprints:</strong> Restrict agent behavior so it adheres to strict guidelines and doesn't hallucinate outside its core scope or break system instructions.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-ref-modes__footer-actions">
                    <Link to={state?.user ? "/generate" : "/login"} className="btn btn-primary btn-xl">
                      Try text reference mode <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── Section: TESTIMONIALS ── */}
      <section className="p-section p-testimonials">
        <div className="p-testimonials__header-wrap">
          <h2 className="h-display text-center" style={{ margin: 0 }}>Loved by <span className="text-pink">AI Artists</span></h2>
          &nbsp;
          <button
            className="btn-add-review"
            onClick={() => setShowReviewForm(true)}
            title="Write a Review"
          >
            +
          </button>
        </div>

        <div className="p-testimonials__carousel-container">
          <button className="carousel-nav-btn prev" onClick={handlePrevTestimonial}>&larr;</button>

          <div className="p-testimonials__carousel-track">
            {testimonials.map((t, idx) => {
              const posClass = getCardClass(idx);
              return (
                <div
                  key={idx}
                  className={`p-testimonial-card p-testimonial-card--carousel ${posClass}`}
                  onClick={() => {
                    if (posClass.includes('left') || posClass.includes('right')) {
                      setActiveTestimonialIndex(idx);
                    }
                  }}
                >
                  {renderStars(t.stars)}
                  <p className="p-testimonial-card__quote">"{t.quote}"</p>
                  <div className="p-testimonial-card__author">
                    <div className="p-testimonial-card__avatar">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="p-testimonial-card__avatar-img" />
                      ) : (
                        t.name ? t.name[0] : 'U'
                      )}
                    </div>
                    <div className="p-testimonial-card__name">{t.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="carousel-nav-btn next" onClick={handleNextTestimonial}>&rarr;</button>
        </div>

        {/* Dots indicators */}
        <div className="p-testimonials__dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`testimonial-dot ${idx === activeTestimonialIndex ? 'active' : ''}`}
              onClick={() => setActiveTestimonialIndex(idx)}
            />
          ))}
        </div>
      </section>

      {/* ── Section 04 ─ HOW TOKENS WORK ── */}
      <section className="p-section p-tokens">
        <h2 className="h-display text-center">How <span className="text-cyan">Tokens</span> Work</h2>
        <p className="p-tokens__subtitle">Simple, transparent pricing. No subscriptions required.</p>

        {/* 3-step flow */}
        <div className="p-tokens__flow">
          <div className="p-tokens__step p-tokens__step--1">
            <span className="p-tokens__step-number">01</span>
            <div className="p-tokens__step-icon p-tokens__step-icon--green">🎁</div>
            <h3><span className="text-green">Sign Up Free</span></h3>
            <p>Create your account and get your <strong>first prompt generation completely free</strong>. No credit card needed.</p>
            <div className="p-tokens__features">
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--green">✓</span>
                <span>Welcome: <strong>1 Free Token</strong></span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--green">✓</span>
                <span><strong>No credit card</strong> required</span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--green">✓</span>
                <span><strong>Save prompts</strong> in library</span>
              </div>
            </div>
          </div>
          <div className="p-tokens__step-arrow">→</div>
          <div className="p-tokens__step p-tokens__step--2">
            <span className="p-tokens__step-number">02</span>
            <div className="p-tokens__step-icon p-tokens__step-icon--cyan">⚡</div>
            <h3><span className="text-cyan">Generate Prompts</span></h3>
            <p>Use tokens to create professional AI prompts. Choose your power level:</p>
            <div className="p-tokens__costs">
              <div className="p-tokens__cost-item">
                <span className="p-tokens__cost-badge p-tokens__cost-badge--normal">Normal</span>
                <strong>1 token</strong>
              </div>
              <div className="p-tokens__cost-item">
                <span className="p-tokens__cost-badge p-tokens__cost-badge--super">Super</span>
                <strong>3 tokens</strong>
              </div>
              <div className="p-tokens__cost-item">
                <span className="p-tokens__cost-badge p-tokens__cost-badge--power">Power</span>
                <strong>5 tokens</strong>
              </div>
            </div>
          </div>
          <div className="p-tokens__step-arrow">→</div>
          <div className="p-tokens__step p-tokens__step--3">
            <span className="p-tokens__step-number">03</span>
            <div className="p-tokens__step-icon p-tokens__step-icon--pink">🚀</div>
            <h3><span className="text-pink">Share & Grow</span></h3>
            <p>Share your AI-generated content on social media. <strong>Grow your audience and followers</strong> organically.</p>
            <div className="p-tokens__features">
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Post to <strong>Instagram, TikTok & more</strong></span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Boost <strong>engagement & reach</strong></span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Grow <strong>followers organically</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* What 1 token gets you */}
        <div className="p-tokens__value-box">
          <h3>What Does <span className="text-orange">1 Token</span> Get You?</h3>
          <p>Each token generates a <strong>complete prompt pack</strong> including:</p>
          <div className="p-tokens__value-grid">
            <div className="p-tokens__value-item">
              <span className="p-tokens__value-icon-circle">✓</span>
              <span>Professional prompt text</span>
            </div>
            <div className="p-tokens__value-item">
              <span className="p-tokens__value-icon-circle">✓</span>
              <span>Optimized for your chosen AI model</span>
            </div>
            <div className="p-tokens__value-item">
              <span className="p-tokens__value-icon-circle">✓</span>
              <span>Negative prompts included</span>
            </div>
            <div className="p-tokens__value-item">
              <span className="p-tokens__value-icon-circle">✓</span>
              <span>Sample output previews</span>
            </div>
          </div>
          <a href="/pricing" className="p-tokens__pricing-link">View Token Packs & Pricing →</a>
        </div>
      </section>
      {/* 05.5 RICH SEO HUB & FAQ SECTION */}
      <section className="p-seo-hub section-spacing" id="seo-hub">
        <div className="container">
          <div className="p-seo-hub__header reveal">
            <h2 className="h-display text-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px 16px' }}>
              <span>Ultimate AI Prompt Guide:</span>
              <span className="text-cyan">Text-to-Image</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'var(--font-body), sans-serif', fontWeight: '300' }}>|</span>
              <span className="text-orange">Image-to-Video</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'var(--font-body), sans-serif', fontWeight: '300' }}>|</span>
              <span className="text-purple">Text-to-Code/Text</span>
            </h2>
            <p className="text-center p-seo-hub__subtitle" style={{ marginTop: '16px' }}>
              Learn how to master character consistency, style referencing, camera movements, structured copywriting frameworks, and custom agent blueprints.
            </p>
          </div>

          <div className="p-seo-hub__guides-list reveal" style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '40px', marginBottom: '48px' }}>
            {/* 1. Text-to-Image */}
            <div className="p-seo-guide-card p-seo-guide-card--image glass-effect">
              <div className="p-seo-guide-card__content">
                <div className="p-seo-guide-card__icon-box text-cyan">
                  <Image size={24} />
                </div>
                <h3 className="p-seo-guide-card__title">
                  <span className="text-cyan">Text-to-Image</span> Generation & Consistent Characters
                </h3>
                <p className="p-seo-guide-card__text">
                  Creating consistent characters in text-to-image generators like Midjourney (v6), Stable Diffusion, and Flux has historically been a challenge. By utilizing specialized prompt formats and style/character reference anchors (like Midjourney's <code>--cref</code> and <code>--sref</code> parameters), creators can lock facial features, clothing, and environment.
                </p>
                <p className="p-seo-guide-card__text">
                  Our AI Prompt Generator automates this by structure-formatting references, allowing you to generate seamless photoshoots, different camera angles, and alternate clothing configurations without losing character identity.
                </p>
                <div className="p-seo-guide-card__divider"></div>
                <ul className="p-seo-guide-card__bullets">
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-cyan">✦</span>
                    <span><strong>Cref (Character Reference):</strong> Focuses on face, hair, body shape, and attire.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-cyan">✦</span>
                    <span><strong>Sref (Style Reference):</strong> Focuses on color scheme, lighting, texture, and artistic medium.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-cyan">✦</span>
                    <span><strong>Weighting (Cw):</strong> Dynamically control reference strength from 0 (face only) to 100 (full costume/pose lock).</span>
                  </li>
                </ul>
              </div>
              <div className="p-seo-guide-card__media">
                <div
                  className="p-seo-guide-card__image-container"
                  onClick={() => setActiveLightboxImg({ src: '/text_to_image_diagram.png', alt: 'AI Text to Image Prompt structure diagram blueprint' })}
                >
                  <img
                    src="/text_to_image_diagram.png"
                    alt="AI Text to Image Prompt structure diagram blueprint"
                    className="p-seo-guide-card__diagram"
                  />
                  <button type="button" className="p-seo-guide-card__fullscreen-btn" title="View Fullscreen">
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Image-to-Video */}
            <div className="p-seo-guide-card p-seo-guide-card--video p-seo-guide-card--reverse glass-effect">
              <div className="p-seo-guide-card__media">
                <div
                  className="p-seo-guide-card__image-container"
                  onClick={() => setActiveLightboxImg({ src: '/image_to_video_diagram.png', alt: 'AI Image to Video Motion Anchor structure diagram blueprint' })}
                >
                  <img
                    src="/image_to_video_diagram.png"
                    alt="AI Image to Video Motion Anchor structure diagram blueprint"
                    className="p-seo-guide-card__diagram"
                  />
                  <button type="button" className="p-seo-guide-card__fullscreen-btn" title="View Fullscreen">
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
              <div className="p-seo-guide-card__content">
                <div className="p-seo-guide-card__icon-box text-orange">
                  <Video size={24} />
                </div>
                <h3 className="p-seo-guide-card__title">
                  <span className="text-orange">Image-to-Video</span> Generation & Motion Anchors
                </h3>
                <p className="p-seo-guide-card__text">
                  Converting a static character sheet or image into a fluid movie clip requires motion anchor prompting. AI video models such as Sora, Kling, Luma Dream Machine, and Runway Gen-3 utilize reference frames to guide video diffusion.
                </p>
                <p className="p-seo-guide-card__text">
                  Writing an effective image-to-video consistency prompt requires defining the camera movement (e.g., pan, dolly zoom, orbit) along with the character's secondary actions (e.g., hair blowing in wind, walking under streetlights). Our engine creates templates specifically tailored to match these motion demands.
                </p>
                <div className="p-seo-guide-card__divider"></div>
                <ul className="p-seo-guide-card__bullets">
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-orange">✦</span>
                    <span><strong>Same Scene Loops:</strong> Seamlessly transition static images into cinematic 4K video clips.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-orange">✦</span>
                    <span><strong>Subject-to-Subject Action:</strong> Maintain character features while performing complex tasks or motions.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-orange">✦</span>
                    <span><strong>Fixed Character Motion:</strong> Lock the camera's focus on a subject while changing perspective or speed.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Text-to-Code/Text */}
            <div className="p-seo-guide-card p-seo-guide-card--code glass-effect">
              <div className="p-seo-guide-card__content">
                <div className="p-seo-guide-card__icon-box text-purple">
                  <Code size={24} />
                </div>
                <h3 className="p-seo-guide-card__title">
                  <span className="text-purple">Text-to-Code & Text</span> Prompt Engineering
                </h3>
                <p className="p-seo-guide-card__text">
                  Generating structured textual output like React components, Python scripts, system prompt instructions, or sales copy requires syntax-aware template rules. By using specific system instructions, anti-visions, and context variables, engineers can force the model to output production-ready structures without generic chat commentary.
                </p>
                <p className="p-seo-guide-card__text">
                  Our AI Prompt Generator handles these parameters, wrapping your descriptions in structured frameworks like AIDA (Copywriting) or strictly constrained personas. This results in high-conversion sales copy, error-free code blocks, and reliable agent bots.
                </p>
                <div className="p-seo-guide-card__divider"></div>
                <ul className="p-seo-guide-card__bullets">
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-purple">✦</span>
                    <span><strong>AIDA & PAS Frameworks:</strong> Auto-structure copy with attention hooks, problem breakdowns, and clear call-to-actions.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-purple">✦</span>
                    <span><strong>Code Constraints:</strong> Restrict responses to raw, syntax-highlighted code output while omitting verbose conversational padding.</span>
                  </li>
                  <li>
                    <span className="p-seo-guide-card__bullet-spark text-purple">✦</span>
                    <span><strong>System Personas:</strong> Define strict rules, behavior boundaries, and memory states for custom AI agent flows.</span>
                  </li>
                </ul>
              </div>
              <div className="p-seo-guide-card__media">
                <div
                  className="p-seo-guide-card__image-container"
                  onClick={() => setActiveLightboxImg({ src: '/text_to_code_diagram.png', alt: 'AI Text to Code prompt engineering flowchart diagram blueprint' })}
                >
                  <img
                    src="/text_to_code_diagram.png"
                    alt="AI Text to Code prompt engineering flowchart diagram blueprint"
                    className="p-seo-guide-card__diagram"
                  />
                  <button type="button" className="p-seo-guide-card__fullscreen-btn" title="View Fullscreen">
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 05. SEO CONTENT — Keyword-rich text for search engines */}
          <div className="p-seo-content container" style={{ padding: '24px 0 48px', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2 className="h-display" style={{ textAlign: 'center', marginBottom: '24px' }}>
                The Ultimate <span className="text-cyan">AI Prompt</span> <span style={{ color: '#ffffff', margin: '0 6px' }}>&</span> <span className="text-orange">Agent Platform</span> — <span className="text-orange">Prompt by Niti</span>
              </h2>
              <div className="seo-caveat-text" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <p>
                  <strong>Prompt by Niti</strong> is the world's premier platform for <strong>AI Prompt & Agent Generation</strong>. <em>Prompts. Agents. Built by AI.</em> Built for creators, designers, developers, and prompt engineers, our platform empowers you to generate studio-quality prompts and autonomous AI agent blueprints in seconds. Whether you need <strong>Midjourney prompts</strong>, <strong>ChatGPT prompts</strong>, <strong>Flux prompts</strong>, <strong>Sora prompts</strong>, or <strong>Autonomous AI Agents</strong> with strict system directives and operational personas — our multi-modal engine handles everything seamlessly.
                </p>
                <p style={{ marginTop: '16px' }}>
                  What sets us apart is our multi-modal <strong>Consistency & Agent Generation Engine</strong>:
                </p>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li style={{ marginTop: '6px' }}><strong>Image Reference Modes:</strong> Replicate complex art styles, portraits, and 3D concept graphics while locking character details (<code>--cref</code>) and style parameters (<code>--sref</code>).</li>
                  <li style={{ marginTop: '6px' }}><strong>Video Reference Modes:</strong> Bring static images to life with cinematic motion anchors, orbital rotations, slow zooms, panning directions, and stable characters across frames.</li>
                  <li style={{ marginTop: '6px' }}><strong>Autonomous AI Agents & Code Modes:</strong> Enforce structured blueprints for <strong>Autonomous AI Agents</strong> (Customer support, Research, Coding, Automation personas), <strong>Code Generation</strong> (React, Python, APIs), and <strong>Copywriting Frameworks</strong>.</li>
                </ul>
                <p style={{ marginTop: '16px' }}>
                  Looking for <strong>AI prompt or agent ideas</strong>? Our <strong>AI Prompt & Agent Generator</strong> transforms your simple descriptions into production-ready blueprints. <strong>Prompt by Niti</strong> is the all-in-one studio — <strong>Prompts. Agents. Built by AI.</strong>
                </p>
                <p style={{ marginTop: '16px' }}>
                  Start generating <strong>AI prompts & autonomous agents</strong> today — for free. No credit card required.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ ACCORDION */}
          <br></br>
          <div className="p-seo-faq reveal">
            <h3 className="text-center p-seo-faq__title">Frequently Asked <span className="text-orange">Questions</span></h3>

            <div className="p-seo-faq__list">
              <details className="p-seo-faq__item glass-effect">
                <summary>How does text-to-image character consistency work?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Text-to-image consistency relies on providing the model with a reference image URL and specialized parameters (such as <code>--cref URL</code> in Midjourney or LoRA nodes in Stable Diffusion). The generator parses the character features and injects them alongside the new scene prompt, allowing the character to appear in multiple settings and poses.
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>Why does the character's face change slightly across different image generations?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    AI models add a degree of latent noise during diffusion. To maximize facial consistency, set the character weight parameter (like <code>--cw 100</code> in Midjourney) to lock hair, clothing, and details. To change clothes while keeping the face identical, reduce the weight to <code>--cw 0</code> so only the face profile is locked.
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>How do I write prompts for image-to-video generation?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    When doing image-to-video (I2V) prompting, you upload a source image and write a prompt describing the action rather than the details. Since the video model gets the details from the image, your text should focus on camera instructions (e.g., "slow tracking shot, camera dollying left") and motion details ("dust motes drifting in sunbeams, hair blowing softly in wind").
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>Why does my code prompt output verbose explanations instead of clean code?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Standard LLMs are trained to be conversational and chatty, leading to verbose introductions. By using our <strong>Code Blueprint Reference Mode</strong>, the generated prompt forces the system instruction layer to mandate raw, syntax-highlighted code output inside markdown blocks while strictly banning conversational padding.
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>Can I force the copywriting generator to adhere to specific marketing frameworks?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Yes! Our <strong>Copywriting Framework Reference Mode</strong> allows you to choose templates like AIDA (Attention, Interest, Desire, Action) or PAS (Problem, Agitate, Solution). The engine forces the model to structure the response under bold section headers.
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>How do generator credit tiers work when crafting my prompts?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Our prompt reactor runs on three levels of complexity:
                  </p>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
                    <li><strong>Normal (1 credit):</strong> Focuses on syntax structure and clean layouts (500–700 chars).</li>
                    <li><strong>Super (3 credits):</strong> Adds advanced target audience persona and tone metrics (800–1000 chars).</li>
                    <li><strong>Power (5 credits):</strong> Appends multi-phase blueprints, anti-visions, and strict success metrics (1200–1500 chars).</li>
                  </ul>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>Can I use these prompts on Midjourney, Sora, Luma, and Runway?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Yes! Our generated prompts are built using standard syntax and engineering patterns designed to be copy-pasted directly into popular AI systems. Midjourney, Flux, Stable Diffusion, Sora, Kling, Runway Gen-3, and Luma Dream Machine are all fully supported.
                  </p>
                </div>
              </details>

              <details className="p-seo-faq__item glass-effect">
                <summary>How can I use Prompt by Niti to grow my social media?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Generate professional AI prompts for stunning images and videos, then share them directly on your social media platforms. Use our feed to discover trending content ideas, grow your followers, and increase engagement organically.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* 06. TESTIMONIAL / CTA */}
      <section className="p-cta container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div className="p-cta__inner reveal">
          <div className="p-cta__content">
            <h2 className="h-display p-cta__title">Start your <span className="text-orange">journey</span> <span className="text-cyan">today!</span></h2>
            <p className="p-cta__subtitle">Join a growing community of AI creators. No more guessing, just creating.</p>
            <Link to={state?.user ? "/generate" : "/login"} className="btn btn-primary btn-xl">
              Get Started for Free <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {previewPrompt && <PreviewModal prompt={previewPrompt} onClose={() => setPreviewPrompt(null)} />}

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          className="p-lightbox-overlay"
          onClick={() => setActiveLightboxImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <button
            type="button"
            className="p-lightbox-close"
            onClick={() => setActiveLightboxImg(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10000
            }}
          >
            &times;
          </button>

          <img
            src={activeLightboxImg.src}
            alt={activeLightboxImg.alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
          />
        </div>
      )}

      {/* Review Modal Form */}
      {showReviewForm && (
        <div className="review-modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="review-modal-card glass-effect" onClick={(e) => e.stopPropagation()}>
            <button className="review-modal-close" onClick={() => setShowReviewForm(false)}>&times;</button>
            {!state.user ? (
              <div className="login-required-modal" style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ marginBottom: '12px' }}>Login Required</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                  You must be logged in to share your experience with the community.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowReviewForm(false);
                    navigate('/login');
                  }}
                  style={{ width: '100%' }}
                >
                  Log In
                </button>
              </div>
            ) : (
              <>
                <h3>Write a Creator Review</h3>
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="form-group rating-group">
                    <label>Rating</label>
                    <div className="star-rating-select">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isHalf = newReview.stars === starIndex - 0.5;
                        const isFull = newReview.stars >= starIndex;
                        return (
                          <span key={starIndex} className="star-select-item">
                            {/* Base grey star */}
                            <span className="star-select-visual-base">★</span>

                            {/* Overlay active/orange star */}
                            {(isFull || isHalf) && (
                              <span className={`star-select-visual-overlay ${isHalf ? 'half' : 'full'}`}>
                                ★
                              </span>
                            )}

                            {/* Transparent click targets */}
                            <span
                              className="star-select-btn left"
                              onClick={() => setNewReview({ ...newReview, stars: starIndex - 0.5 })}
                            />
                            <span
                              className="star-select-btn right"
                              onClick={() => setNewReview({ ...newReview, stars: starIndex })}
                            />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Review Description</label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {500 - (newReview.quote?.length || 0)} characters left
                      </span>
                    </div>
                    <textarea
                      required
                      rows="4"
                      maxLength={500}
                      placeholder="Tell us what you like about PromptByNiti..."
                      value={newReview.quote}
                      onChange={e => setNewReview({ ...newReview, quote: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={reviewSubmitting}>{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
