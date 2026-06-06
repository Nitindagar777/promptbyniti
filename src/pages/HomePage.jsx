/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign, Eye, Camera, Lock, Check, Repeat, Video, Info, Copy, ChevronDown } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PromptThumbnail from '../components/PromptThumbnail';
import SEOHead from '../components/SEOHead';
import QuantumReactor from '../components/QuantumReactor';
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



  // Reference Modes Showcase Section States
  const [activeImageMode, setActiveImageMode] = useState('sameScene'); // 'sameScene' | 'different' | 'fixed'
  const [activeVideoMode, setActiveVideoMode] = useState('sameSceneLoop'); // 'sameSceneLoop' | 'differentScenes' | 'fixedCharacterMotion'

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


  // Auto-switch Image Reference Modes every 3 seconds smoothly
  useEffect(() => {
    const modes = ['sameScene', 'different', 'fixed'];
    const timer = setTimeout(() => {
      setActiveImageMode(current => {
        const currentIndex = modes.indexOf(current);
        const nextIndex = (currentIndex + 1) % modes.length;
        return modes[nextIndex];
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeImageMode]);

  // Handler to auto-switch Video Reference Modes when the active video ends
  const handleVideoEnded = useCallback(() => {
    const videoModes = ['sameSceneLoop', 'differentScenes', 'fixedCharacterMotion'];
    setActiveVideoMode(current => {
      const currentIndex = videoModes.indexOf(current);
      const nextIndex = (currentIndex + 1) % videoModes.length;
      return videoModes[nextIndex];
    });
  }, []);

  // Effect to control playing/pausing of reference videos based on active video mode
  useEffect(() => {
    Object.entries(videoRefs).forEach(([key, ref]) => {
      const videoEl = ref.current;
      if (videoEl) {
        if (key === activeVideoMode) {
          videoEl.currentTime = 0;
          videoEl.play().catch(err => {
            // Silence AbortError due to quick tab switching
            if (err.name !== 'AbortError') {
              console.log(`Video play interrupted for ${key}:`, err);
            }
          });
        } else {
          videoEl.pause();
        }
      }
    });
  }, [activeVideoMode]);


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
        title="AI Prompt Generator & Consistent Reference Prompt Marketplace — Prompt by Niti"
        description="Prompt by Niti is the #1 AI prompt generator and marketplace for Midjourney, Flux, Sora, Luma, and Llama. Craft consistent character prompts for text-to-image generation and cinematic image-to-video generation. Buy, sell, and discover prompt templates, blueprints, and examples."
        keywords="text to image generation prompts, image to video generation prompts, consistent character prompts, Midjourney cref prompts, Sora video prompts, Flux consistency prompts, AI art prompt marketplace, prompt engineering templates, buy sell prompts, PromptBase alternative, promptbase, promptbyniti"
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
                Traditional prompt makers only guess. Our generator supports both <strong>Image</strong> & <strong>Video</strong> outputs, using state-of-the-art <strong>Reference Mode</strong> & <strong>Character Consistency</strong> locking to replicate poses, maintain style coherence, and freeze details across multiple scenes and clips with absolute precision.
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
                  <span>Image & Video Consistency</span>
                </div>
                <div className="p-hero__feature-item">
                  <ZapIcon size={16} className="text-orange" />
                  <span>3 Advanced Reference Modes</span>
                </div>
                <div className="p-hero__feature-item">
                  <Layers size={16} className="text-cyan" />
                  <span>Midjourney, Sora, Flux & More</span>
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

      {/* IMAGE REFERENCE MODES SECTION */}
      <section className="p-ref-modes section-spacing" id="image-ref-modes">
        <div className="container">
          <div className="p-ref-modes__header reveal">
            <h2 className="h-display text-center">Consistent Character & Style <span className="text-cyan">Image Reference Modes</span></h2>
            <p className="text-center p-ref-modes__subtitle">
              Learn how our advanced image prompt templates maintain consistency across characters, styles, and settings.
            </p>
          </div>

          <div className="p-ref-modes__showcase-grid reveal">
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
                <Link to="/generate" className="btn btn-primary btn-xl">
                  Try image reference mode <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO REFERENCE MODES SECTION */}
      <section className="p-ref-modes section-spacing" id="video-ref-modes">
        <div className="container">
          <div className="p-ref-modes__header reveal">
            <h2 className="h-display text-center">Consistent Motion & Actor <span className="text-purple">Video Reference Modes</span></h2>
            <p className="text-center p-ref-modes__subtitle">
              Learn how our advanced video prompt templates animate characters with stable details across frames.
            </p>
          </div>

          <div className="p-ref-modes__showcase-grid p-ref-modes__showcase-grid--reversed reveal">
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
                <Link to="/generate" className="btn btn-sky btn-xl">
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
                  muted 
                  playsInline
                  onEnded={handleVideoEnded}
                />
                <video 
                  ref={videoRefs.differentScenes}
                  src="/Different_Character_Video_ref.mp4" 
                  className={`p-ref-modes__showcase-media ${activeVideoMode === 'differentScenes' ? 'active' : ''}`}
                  muted 
                  playsInline
                  onEnded={handleVideoEnded}
                />
                <video 
                  ref={videoRefs.fixedCharacterMotion}
                  src="/Fixed_Character_Motion_Video_ref.mp4" 
                  className={`p-ref-modes__showcase-media ${activeVideoMode === 'fixedCharacterMotion' ? 'active' : ''}`}
                  muted 
                  playsInline
                  onEnded={handleVideoEnded}
                />
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

      {/* 05.5 RICH SEO HUB & FAQ SECTION */}
      <section className="p-seo-hub section-spacing" id="seo-hub">
        <div className="container">
          <div className="p-seo-hub__header reveal">
            <h2 className="h-display text-center">Ultimate AI Prompt Guide: <span className="text-cyan">Text-to-Image</span> & <span className="text-orange">Image-to-Video</span></h2>
            <p className="text-center p-seo-hub__subtitle">
              Learn how to master character consistency, style referencing, and multi-scene narrative prompt engineering.
            </p>
          </div>

          <div className="p-seo-hub__articles-grid reveal">
            <article className="p-seo-article glass-effect">
              <div className="p-seo-article__icon text-cyan">
                <Image size={28} />
              </div>
              <h3>Text-to-Image Generation & Consistent Characters</h3>
              <p>
                Creating consistent characters in text-to-image generators like Midjourney (v6), Stable Diffusion, and Flux has historically been a challenge. By utilizing specialized prompt formats and style/character reference anchors (like Midjourney's <code>--cref</code> and <code>--sref</code> parameters), creators can lock facial features, clothing, and environment.
              </p>
              <p>
                Our AI Prompt Generator automates this by structure-formatting references, allowing you to generate seamless photoshoots, different camera angles, and alternate clothing configurations without losing character identity.
              </p>
              <ul className="p-seo-article__bullets">
                <li><strong>Cref (Character Reference):</strong> Focuses on face, hair, body shape, and attire.</li>
                <li><strong>Sref (Style Reference):</strong> Focuses on color scheme, lighting, texture, and artistic medium.</li>
                <li><strong>Weighting (Cw):</strong> Dynamically control reference strength from 0 (face only) to 100 (full costume/pose lock).</li>
              </ul>
            </article>

            <article className="p-seo-article glass-effect">
              <div className="p-seo-article__icon text-orange">
                <Video size={28} />
              </div>
              <h3>Image-to-Video Generation Prompts & Motion Anchors</h3>
              <p>
                Converting a static character sheet or image into a fluid movie clip requires motion anchor prompting. AI video models such as Sora, Kling, Luma Dream Machine, and Runway Gen-3 utilize reference frames to guide video diffusion.
              </p>
              <p>
                Writing an effective image-to-video consistency prompt requires defining the camera movement (e.g., pan, dolly zoom, orbit) along with the character's secondary actions (e.g., hair blowing in wind, walking under streetlights). Our engine creates templates specifically tailored to match these motion demands.
              </p>
              <ul className="p-seo-article__bullets">
                <li><strong>Same Scene Loops:</strong> Seamlessly transition static images into cinematic 4K video clips.</li>
                <li><strong>Subject-to-Subject Action:</strong> Maintain character features while performing complex tasks or motions.</li>
                <li><strong>Fixed Character Motion:</strong> Lock the camera's focus on a subject while changing perspective or speed.</li>
              </ul>
            </article>
          </div>

          {/* FAQ ACCORDION */}
          <div className="p-seo-faq reveal">
            <h3 className="text-center p-seo-faq__title">Frequently Asked Questions</h3>
            
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
                <summary>How do I write prompts for image-to-video generation?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    When doing image-to-video (I2V) prompting, you upload a source image and write a prompt describing the action rather than the details. Since the video model gets the details from the image, your text should focus on camera instructions (e.g., "slow tracking shot, camera dollying left") and motion details ("dust motes drifting in sunbeams, hair blowing softly in wind").
                  </p>
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
                <summary>Can I sell my optimized prompt templates on the marketplace?</summary>
                <div className="p-seo-faq__content">
                  <p>
                    Absolutely! Prompt by Niti is a marketplace where prompt engineers sell high-quality, verified prompt templates. You earn 80% royalties on every sale, with payments processed securely. Head over to the <a href="/sell">Sell Prompts</a> page to list your prompts.
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
