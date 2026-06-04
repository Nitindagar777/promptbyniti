/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign, Eye, Camera, Lock, Check, Repeat } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PromptThumbnail from '../components/PromptThumbnail';
import SEOHead from '../components/SEOHead';
import './HomePage.css';

const API_URL = '/api';

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

export default function HomePage() {
  const { state, dispatch, canGenerate, useCredit, addPrompt, cache, setCachedData, setScroll, getScroll } = useApp();
  const location = useLocation();
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [prompts, setPrompts] = useState(state.marketplace ? state.marketplace.slice(0, 8) : []);
  const [loadingPrompts, setLoadingPrompts] = useState(!state.marketplace || state.marketplace.length === 0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [previewPrompt, setPreviewPrompt] = useState(null);
  const [activeMode, setActiveMode] = useState('sameScene');

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
      quote: "Started selling my prompts here and earned back my investment in the first week. The 80% royalty is the best in the market.", 
      name: "Jordan K.", 
      role: "Prompt Seller", 
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
      quote: "Listing my prompts here has become a viable side income. The platform handles payment processing and delivery flawlessly.", 
      name: "Elena S.", 
      role: "Generative Art Director", 
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ];

  const [testimonials, setTestimonials] = useState(() => {
    const saved = localStorage.getItem('promptbyniti_testimonials');
    let allReviews = [];
    if (saved) {
      try {
        allReviews = JSON.parse(saved);
      } catch (e) {
        allReviews = DEFAULT_TESTIMONIALS;
      }
    } else {
      allReviews = DEFAULT_TESTIMONIALS;
    }
    // Filter visible list to only contain 4, 4.5, and 5 star reviews
    const filtered = allReviews.filter(t => t.stars >= 4);
    
    if (filtered.length >= 5) return filtered;
    const merged = [...filtered];
    for (const item of DEFAULT_TESTIMONIALS) {
      if (merged.length >= 5) break;
      if (!merged.some(m => m.name === item.name) && item.stars >= 4) {
        merged.push(item);
      }
    }
    return merged;
  });

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ quote: '', stars: 5 });

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

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!state.user) return;
    if (!newReview.quote.trim()) return;

    const reviewToSubmit = {
      quote: newReview.quote,
      stars: newReview.stars,
      name: state.user.name || state.user.username || 'AI Artist',
      avatar: state.user.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80'
    };

    // Get current stored items
    const saved = localStorage.getItem('promptbyniti_testimonials');
    let allReviews = [];
    if (saved) {
      try {
        allReviews = JSON.parse(saved);
      } catch (err) {
        allReviews = [];
      }
    }
    if (allReviews.length === 0) {
      allReviews = [...DEFAULT_TESTIMONIALS];
    }
    
    // Add new review to absolute storage list
    const updatedAll = [reviewToSubmit, ...allReviews];
    localStorage.setItem('promptbyniti_testimonials', JSON.stringify(updatedAll));

    // Update active UI testimonials only if rating is 4, 4.5, or 5 stars
    if (reviewToSubmit.stars >= 4) {
      const updatedVisible = [reviewToSubmit, ...testimonials];
      setTestimonials(updatedVisible);
      setActiveTestimonialIndex(0);
    }

    setNewReview({ quote: '', stars: 5 });
    setShowReviewForm(false);
  };

  useEffect(() => {
    if (state.marketplace && state.marketplace.length > 0) {
      setPrompts(state.marketplace.slice(0, 8));
      setLoadingPrompts(false);
    } else {
      fetchPrompts();
    }

    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, [state.marketplace]);

  // Auto-switch modes every 2 seconds smoothly
  useEffect(() => {
    const modes = ['sameScene', 'different', 'fixed'];
    const timer = setTimeout(() => {
      setActiveMode(current => {
        const currentIndex = modes.indexOf(current);
        const nextIndex = (currentIndex + 1) % modes.length;
        return modes[nextIndex];
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeMode]);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (data.success) {
        const sliced = data.prompts.slice(0, 8);
        setPrompts(sliced);
        // Dispatch to global state if missing or to update it
        if (!state.marketplace || state.marketplace.length === 0) {
          dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
        }
      }
    } catch (err) {
      console.error('Failed to fetch home prompts:', err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleDemoGenerate = () => {
    if (!demoInput.trim()) {
      inputRef.current?.focus();
      return;
    }
    navigate('/generate', { state: { initialInput: demoInput } });
  };

  const handleRandomGenerate = () => {
    const randomIndex = Math.floor(Math.random() * randomDescriptions.length);
    const selected = randomDescriptions[randomIndex];
    setDemoInput(selected);
    setTimeout(() => {
      navigate('/generate', { state: { initialInput: selected, isRandom: true } });
    }, 500);
  };

  return (
    <div className="p-home" id="home-page">
      <SEOHead
        title="AI Prompt Generator & Marketplace — Free Prompt Ideas, Templates & Examples"
        description="Prompt by Niti is the #1 AI prompt generator, marketplace, and prompt engineering platform. Generate, buy, sell, and discover the best prompts for Midjourney, ChatGPT, DALL·E 3, Stable Diffusion, Flux, Sora, and more. Free prompt ideas, prompt templates, and prompt examples. Best PromptBase alternative."
        keywords="prompt, prompts, AI prompt, prompt generator, prompt ideas, prompt marketplace, prompt engineering, prompt templates, prompt examples, best prompts, free prompts, buy prompts, sell prompts, PromptBase alternative, promptbase, promptbyniti, Midjourney prompts, ChatGPT prompts, DALL-E prompts, Stable Diffusion prompts, Flux prompts, AI art prompts, AI image prompts, prompt store, prompt library, prompt builder, prompt creator, AI tools"
      />
      {/* 01. HERO */}
      <section className="p-hero">
        <div className="container">
          <div className="p-hero__split-grid">
            {/* Left Hero Content */}
            <div className="p-hero__content-col reveal" style={{ animationDelay: '0.1s' }}>
              
              <h1 className="p-hero__title">
                <span className="text-cyan">AI Prompt</span> Generator & <span className="text-orange">Marketplace</span>
              </h1>
              
              <p className="p-hero__pitch">
                Traditional prompt makers only guess. Our generator uses state-of-the-art <strong>Reference Mode</strong> & <strong>Character Consistency</strong> locking to replicate poses, maintain style coherence, and freeze character details across multiple scenes with absolute precision.
              </p>
              
              <p className="p-hero__subtitle p-hero__subtitle--accent">
                <span className="text-orange">Generate.</span> <span className="text-cyan">Customize.</span> <span className="text-purple">Sell.</span>
              </p>
              
              <div className="p-hero__btns">
                <Link to="/generate" className="btn btn-primary btn-xl">
                  Start Generating <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                </Link>
                <Link to="/templates" className="btn btn-secondary btn-xl">
                  Explore Archive
                </Link>
              </div>
              
              {/* Feature Pills */}
              <div className="p-hero__features">
                <div className="p-hero__feature-item">
                  <Sparkles size={16} className="text-pink" />
                  <span>Pixel-Perfect Consistency</span>
                </div>
                <div className="p-hero__feature-item">
                  <ZapIcon size={16} className="text-orange" />
                  <span>3 Reference Lock Modes</span>
                </div>
                <div className="p-hero__feature-item">
                  <Layers size={16} className="text-cyan" />
                  <span>12+ AI Models Supported</span>
                </div>
              </div>
            </div>
            
            {/* Right Hero Showcase (Interactive Showcase Card) */}
            <div className="p-hero__showcase-col reveal" style={{ animationDelay: '0.2s' }}>
              <div className="hero-showcase__card">
                <div className="hero-showcase__header">
                  <div className="hero-showcase__badge">Interactive Reference Mode Guide</div>
                  <h3 className="hero-showcase__headline">See how our generator works</h3>
                </div>
                
                {/* Toggles */}
                <div className="hero-showcase__toggles">
                  <button 
                    className={`hero-showcase__toggle-btn ${activeMode === 'sameScene' ? 'active active--sameScene' : ''}`}
                    onClick={() => setActiveMode('sameScene')}
                  >
                    <Camera size={16} />
                    <span>Same Scene</span>
                  </button>
                  <button 
                    className={`hero-showcase__toggle-btn ${activeMode === 'different' ? 'active active--different' : ''}`}
                    onClick={() => setActiveMode('different')}
                  >
                    <Repeat size={16} />
                    <span>Diff Subjects</span>
                  </button>
                  <button 
                    className={`hero-showcase__toggle-btn ${activeMode === 'fixed' ? 'active active--fixed' : ''}`}
                    onClick={() => setActiveMode('fixed')}
                  >
                    <Lock size={16} />
                    <span>Fixed Character</span>
                  </button>
                </div>
                
                {/* Showcase Image & Template Preview */}
                <div className="hero-showcase__preview-area">
                  <div className="hero-showcase__image-wrap">
                    <img 
                      src="/same_scene_ref.png" 
                      alt="Same Scene Reference Guide" 
                      className={`hero-showcase__img ${activeMode === 'sameScene' ? 'active' : ''}`}
                    />
                    <img 
                      src="/diff_characters_ref.png" 
                      alt="Different Characters Reference Guide" 
                      className={`hero-showcase__img ${activeMode === 'different' ? 'active' : ''}`}
                    />
                    <img 
                      src="/fixed_character_ref.png" 
                      alt="Fixed Character Reference Guide" 
                      className={`hero-showcase__img ${activeMode === 'fixed' ? 'active' : ''}`}
                    />
                  </div>
                  
                  {/* Template Overlay */}
                  <div className="hero-showcase__template-bar">
                    <span className="hero-showcase__template-label">Prompt Template:</span>
                    <div className="hero-showcase__template-wrapper">
                      <code className={`hero-showcase__template-code ${activeMode === 'sameScene' ? 'active' : ''}`}>
                        A [camera_angle] photoshoot of [subject] posing in [setting] --cref [url] --cw 100
                      </code>
                      <code className={`hero-showcase__template-code ${activeMode === 'different' ? 'active' : ''}`}>
                        A stylized [medium] illustration of a [animal_subject], [color] palette, geometric vector style
                      </code>
                      <code className={`hero-showcase__template-code ${activeMode === 'fixed' ? 'active' : ''}`}>
                        A close-up shot of [character] performing [action] at [new_background] --cref [url] --cw 100
                      </code>
                    </div>
                  </div>
                </div>
                
                {/* Bullet differences */}
                <div className="hero-showcase__rules">
                  <div className="hero-showcase__rules-col hero-showcase__rules-col--same">
                    <h4>🟢 What Stays SAME</h4>
                    <div className="hero-showcase__rules-list-wrapper">
                      <ul className={`hero-showcase__rules-list ${activeMode === 'sameScene' ? 'active' : ''}`}>
                        <li><strong>Subject details:</strong> Face, hair, age, and identity</li>
                        <li><strong>Outfit elements:</strong> Clothing style, accessories, and colors</li>
                        <li><strong>Lighting:</strong> Soft overcast natural daylight</li>
                      </ul>
                      <ul className={`hero-showcase__rules-list ${activeMode === 'different' ? 'active' : ''}`}>
                        <li><strong>Artistic Medium:</strong> Stained-glass vector illustration</li>
                        <li><strong>Composition:</strong> Single-subject centered layout</li>
                        <li><strong>Style:</strong> Stylized line art & geometric contours</li>
                      </ul>
                      <ul className={`hero-showcase__rules-list ${activeMode === 'fixed' ? 'active' : ''}`}>
                        <li><strong>Character Identity:</strong> Face structure, hair, and body type</li>
                        <li><strong>Exact Outfit:</strong> Teal sporty windbreaker, sunglasses, helmet</li>
                        <li><strong>Accessories:</strong> Skateboard, dark trousers</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="hero-showcase__rules-col hero-showcase__rules-col--changes">
                    <h4>⚡ What CHANGES</h4>
                    <div className="hero-showcase__rules-list-wrapper">
                      <ul className={`hero-showcase__rules-list ${activeMode === 'sameScene' ? 'active' : ''}`}>
                        <li><strong>Pose & Gesture:</strong> Standing front vs looking back over shoulder</li>
                        <li><strong>Camera Framing:</strong> Medium close-up vs full-body perspective</li>
                        <li><strong>Subject Expression:</strong> Face expression adjusts naturally</li>
                      </ul>
                      <ul className={`hero-showcase__rules-list ${activeMode === 'different' ? 'active' : ''}`}>
                        <li><strong>Main Subject:</strong> Swaps the animal (Leopard ➔ Fox ➔ Owl)</li>
                        <li><strong>Colors:</strong> Palette matches character's natural tones</li>
                        <li><strong>Details:</strong> Fine shading adapts to the new subject shape</li>
                      </ul>
                      <ul className={`hero-showcase__rules-list ${activeMode === 'fixed' ? 'active' : ''}`}>
                        <li><strong>Setting:</strong> Sunny beach ➔ urban concrete stairs ➔ streets</li>
                        <li><strong>Action/Pose:</strong> Skateboard cruising ➔ high-air jumping ➔ standing</li>
                        <li><strong>Lighting/Vibe:</strong> Bright sunlight ➔ overcast daylight</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="hero-showcase__footer">
                  <Link to="/generate" className="hero-showcase__cta-link">
                    <span>Try Reference Mode in the Generator</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. LIVE PLAYGROUND (No more hidden text) */}
      <section className="p-playground container">
        <div className="p-playground__card card reveal">
          <div className="p-playground__header">
            <h2 className="text-center h-display">Try it <span className="text-purple">right now!</span></h2>
            <p className="text-center">Describe your mental image below.</p>
          </div>
          <div className="p-playground__input">
            <textarea
              ref={inputRef}
              className="p-playground__textarea"
              placeholder="e.g., A majestic white lion sitting on a throne made of flowers..."
              value={demoInput}
              onChange={e => setDemoInput(e.target.value)}
            />
          </div>
          <div className="p-playground__footer" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-xl btn-demo-transform"
              onClick={handleDemoGenerate}
            >
              <Wand2 size={20} /> Transform into Professional Prompt
            </button>
            <button
              className="btn btn-sky btn-xl btn-demo-random"
              onClick={handleRandomGenerate}
            >
              <ZapIcon size={20} /> Randomly Generate
            </button>
          </div>
          {demoResult && <div className="mt-2xl"><PromptOutput result={demoResult} /></div>}
        </div>
      </section>

      {/* 03. PROMPT STORE — NEW */}
      <section className="p-categories bg-secondary section-spacing">
        <div className="container">
          <div className="p-market-header reveal">
            <h2 className="h-display">Prompt <span className="text-pink">Store</span></h2>
            <Link to="/templates" className="btn btn-secondary">
              See all Prompts <ShoppingBag size={18} style={{ marginLeft: '8px' }} />
            </Link>
          </div>

          <div className="p-market-grid">
            {loadingPrompts ? (
              // Skeleton loaders
              [...Array(4)].map((_, i) => (
                <div key={i} className="template-card card skeleton" style={{ height: '350px', background: 'rgba(255,255,255,0.02)' }}></div>
              ))
            ) : prompts.length > 0 ? (
              prompts.map((tmpl, i) => {
                // Mirror the exact same logic as PromptDetailPage
                // Samples are now normalized as simple URL arrays from the backend
                const s0 = tmpl.samples?.[0];
                const s1 = tmpl.samples?.[1];
                const s2 = tmpl.samples?.[2];
                
                const coverSrc = tmpl.thumbnail && tmpl.thumbnail.startsWith('http') ? tmpl.thumbnail : (tmpl.generateType !== 'text' ? s0 : null);
                const isTextOnly = tmpl.generateType === 'text' || (!coverSrc && !tmpl.video);

                return (
                  <Link
                    key={tmpl.id || tmpl._id}
                    to={`/prompt/${tmpl.id || tmpl._id}`}
                    className={`template-card card reveal ${tmpl.generateType === 'text' ? 'template-card--text' : ''}`}
                    id={`template-${tmpl.id || tmpl._id}`}
                    style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
                  >
                    <div className="template-card__visual">
                      {/* Main media using unified component */}
                      <PromptThumbnail 
                        src={tmpl.video || coverSrc} 
                        alt={tmpl.title || tmpl.name} 
                        title={tmpl.title || tmpl.name}
                        className="template-card__media template-card__media-main"
                        type={tmpl.generateType}
                      />

                      {/* Hover gallery - Only for Image/Video */}
                      {tmpl.generateType !== 'text' && (
                        <div className="template-card__gallery">
                          <div className="template-card__gallery-main">
                            <PromptThumbnail src={s0} alt="sample 1" type={tmpl.generateType} />
                          </div>
                          <div className="template-card__gallery-side">
                            <PromptThumbnail src={s1} alt="sample 2" type={tmpl.generateType} />
                            <PromptThumbnail src={s2} alt="sample 3" type={tmpl.generateType} />
                          </div>
                        </div>
                      )}

                      {/* Model tag (top) */}
                      <div className="template-card__overlay template-card__overlay--top">
                        <span className={`template-card__model-tag ${tmpl.generateType === 'text' ? 'template-card__model-tag--text' : ''}`}>
                          {tmpl.model || (tmpl.category === 'anime' ? 'Niji v6' : (tmpl.generateType === 'text' ? 'GPT-4o' : 'Flux.1'))}
                        </span>
                        <div className="template-card__view-badge">
                          <Eye size={12} /> {tmpl.views || 0}
                        </div>
                      </div>

                      {/* Title + seller + tokens (bottom) */}
                      <div className="template-card__overlay template-card__overlay--bottom">
                        <div style={{ flex: 1 }}>
                          <h3 className="template-card__title-overlay">{tmpl.title || tmpl.name}</h3>
                        </div>
                      </div>

                      {/* Absolute token badge */}
                      <div className={`template-card__token-badge ${tmpl.generateType === 'text' ? 'template-card__token-badge--text' : ''}`}>
                        <Zap size={12} fill="currentColor" /> {tmpl.priceTokens || tmpl.tokens || 5}
                      </div>
                    </div>

                    {/* Hover eye icon (half inside/half outside) */}
                    <div className="template-card__hover-eye" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewPrompt(tmpl); }}>
                      <Eye size={18} color="red" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-market-empty reveal" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
                <ShoppingBag size={48} className="text-muted mb-4 mx-auto" />
                <h3>No Prompts Found</h3>
                <p>Be the first to list a prompt in our store!</p>
                <Link to="/sell" className="btn btn-primary mt-4">Start Selling</Link>
              </div>
            )}
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
            <div className="p-tokens__step-icon p-tokens__step-icon--pink">💰</div>
            <h3><span className="text-pink">Sell & Earn 80%</span></h3>
            <p>List your prompts in the marketplace. <strong>You keep 80% of every sale</strong>. Set your own prices.</p>
            <div className="p-tokens__features">
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Industry-leading <strong>80% royalty</strong></span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Set your <strong>own custom pricing</strong></span>
              </div>
              <div className="p-tokens__feature-item">
                <span className="p-tokens__feature-check p-tokens__feature-check--pink">✓</span>
                <span>Get paid <strong>instantly</strong> in tokens</span>
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
      {/* 05. SEO CONTENT — Keyword-rich text for search engines */}
      <section className="p-seo-content container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <h2 className="h-display" style={{ textAlign: 'center', marginBottom: '24px' }}>
            The Best <span className="text-cyan">AI Prompt</span> Platform — <span className="text-orange">Prompt by Niti</span>
          </h2>
          <div className="seo-caveat-text" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>
              <strong>Prompt by Niti</strong> is the ultimate <strong>AI prompt generator</strong> and <strong>prompt marketplace</strong> built for creators, designers, and prompt engineers. Whether you need <strong>Midjourney prompts</strong>, <strong>ChatGPT prompts</strong>, <strong>DALL·E prompts</strong>, <strong>Stable Diffusion prompts</strong>, or <strong>Flux prompts</strong> — our AI-powered platform generates studio-quality results in seconds.
            </p>
            <p style={{ marginTop: '16px' }}>
              Looking for <strong>prompt ideas</strong>? Our <strong>free prompt generator</strong> transforms your simple descriptions into professional, optimized <strong>prompt templates</strong> and <strong>prompt examples</strong> for any AI model. From <strong>AI art prompts</strong> and <strong>AI image prompts</strong> to <strong>text generation prompts</strong> and <strong>video prompts</strong> — we've got you covered.
            </p>
            <p style={{ marginTop: '16px' }}>
              <strong>Prompt by Niti</strong> is the best <strong>PromptBase alternative</strong> — offering a richer <strong>prompt store</strong>, smarter <strong>prompt engineering</strong> tools, and a thriving <strong>prompt marketplace</strong> where you can <strong>buy prompts</strong> and <strong>sell prompts</strong> to earn real money. Our <strong>prompt library</strong> includes thousands of curated <strong>prompt templates</strong> for <strong>Midjourney</strong>, <strong>ChatGPT</strong>, <strong>DALL·E 3</strong>, <strong>Stable Diffusion XL</strong>, <strong>Flux</strong>, <strong>Sora</strong>, <strong>Niji</strong>, and many more AI models.
            </p>
            <p style={{ marginTop: '16px' }}>
              Start generating <strong>professional AI prompts</strong> today — for free. No credit card required. Join thousands of creators who trust <strong>Prompt by Niti</strong> as their go-to <strong>prompt builder</strong> and <strong>prompt creator</strong> platform.
            </p>
          </div>
        </div>
      </section>

      {/* 06. TESTIMONIAL / CTA */}
      <section className="p-cta container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div className="p-cta__inner reveal">
          <div className="p-cta__content">
            <h2 className="h-display p-cta__title">Start your <span className="text-orange">journey</span> <span className="text-cyan">today!</span></h2>
            <p className="p-cta__subtitle">Join a growing community of AI creators. No more guessing, just creating.</p>
            <Link to="/generate" className="btn btn-primary btn-xl">
              Get Started for Free <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {previewPrompt && <PreviewModal prompt={previewPrompt} onClose={() => setPreviewPrompt(null)} />}

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
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Submit Review</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
