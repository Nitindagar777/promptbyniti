import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiModels } from '../data/promptData';
import { 
  Zap, ArrowLeft, Copy, Check, ShoppingBag, 
  Sparkles, Image, MessageSquare, Play, 
  Download, Share2, Heart, ShieldCheck,
  ChevronLeft, ChevronRight, Eye, ArrowRight, Star 
} from 'lucide-react';
import './PromptDetailPage.css';

export default function PromptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, useCredit } = useApp();
  const [template, setTemplate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageRatio, setImageRatio] = useState(null); // null = not yet detected
  const [reviewsLimit, setReviewsLimit] = useState(2);
  const [relatedLimit, setRelatedLimit] = useState(3);

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
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);
      
      // Try fetching from Database
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';
          const res = await fetch(`${API_URL}/prompts/${id}?t=${Date.now()}`);
          const data = await res.json();
          if (data.success) {
            setTemplate(data.prompt);
          } else {
            setError("Prompt not found");
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Failed to load prompt details");
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

  const isVisual = template.thumbnail || template.video || template.samples || template.generateType !== 'text';
  const modelId = template.config?.model || template.model;
  const model = aiModels.find(m => m.id === modelId) || aiModels[0];
  const isPremium = template.premium && !state.isPremium;
  const category = (template.category || template.keywords?.[0] || 'Art');

  const handleCopy = () => {
    navigator.clipboard.writeText(template.config?.description || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-detail" id="prompt-detail-page">
      <div className="container">
        {/* Navigation */}
        <div className="p-detail__nav">
          <button onClick={() => navigate(-1)} className="p-detail__back">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="p-detail__breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/templates">Store</Link> / <span>{template.title}</span>
          </div>
        </div>

        <div className="p-detail__grid">
          {/* LEFT COLUMN: Visual Media OR Text Focus */}
          <div className="p-detail__media-section">
            {isVisual ? (
              <div className="visual-display card">
                <div
                  className="visual-main"
                  style={{ aspectRatio: imageRatio || '1/1' }}
                >
                  {template.video || template.generateType === 'video' ? (
                    <video src={template.video || (template.samples?.[activeImage]?.output || template.samples?.[activeImage])} autoPlay muted loop controls />
                  ) : (
                    <img
                      src={
                        template.samples
                          ? (template.samples[activeImage]?.output || template.samples[activeImage])
                          : template.thumbnail
                      }
                      alt={template.title || template.name}
                      onLoad={handleImageLoad}
                    />
                  )}

                  {template.samples && template.samples.length > 1 && (
                    <>
                      <button className="visual-nav-btn visual-nav-btn--left" onClick={handlePrevImage} aria-label="Previous image">
                        <ChevronLeft size={24} />
                      </button>
                      <button className="visual-nav-btn visual-nav-btn--right" onClick={handleNextImage} aria-label="Next image">
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  <div className="visual-badge">
                    {(template.video || template.generateType === 'video') ? <Play size={16} fill="white" /> : <Image size={16} fill="white" />}
                    {(template.video || template.generateType === 'video') ? 'Video Prompt' : 'Image Prompt'}
                  </div>
                </div>
                
                {template.samples && template.samples.length > 1 && (
                  <div className="visual-thumbs">
                    {template.samples.map((sample, idx) => {
                      const thumbSrc = sample.output || sample;
                      return (
                        <div 
                          key={idx} 
                          className={`visual-thumb ${activeImage === idx ? 'visual-thumb--active' : ''}`}
                          onClick={() => { setActiveImage(idx); setImageRatio(null); }}
                        >
                          <img src={thumbSrc} alt={`Sample ${idx + 1}`} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-display card">
                <div className="text-header">
                  <MessageSquare size={32} className="text-cyan" />
                  <h2>Prompt Template</h2>
                </div>
                <div className="text-body">
                  <p className="text-muted" style={{ marginBottom: '15px' }}>This is a specialized chat/text prompt designed for {model.label}.</p>
                  <div className="prompt-preview-box">
                    <pre>{template.config?.description}</pre>
                  </div>
                </div>
                <div className="text-footer">
                  <ShieldCheck size={16} /> Verified by Prompt by Niti
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Actions & Info */}
          <div className="p-detail__info-section">
            <div className="p-detail__header-info">
              <span className="p-detail__category-tag">{category.replace('-', ' ')}</span>
              <h1 className="p-detail__title">{template.title || template.name}</h1>
              <p className="p-detail__desc">{template.description || "A professional high-end prompt optimized for creative production."}</p>
              
              {template.keywords && template.keywords.length > 0 && (
                <div className="p-detail__keywords">
                  {template.keywords.map((kw, i) => (
                    <span key={i} className="p-detail__keyword-tag">#{kw}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-detail__stats card">
              <div className="stat-item">
                <span className="stat-label">Model</span>
                <span className="stat-value">{model.label}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Views</span>
                <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} className="text-muted" /> {template.views || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Category</span>
                <span className="stat-value" style={{ textTransform: 'capitalize' }}>
                  {category.replace('-', ' ')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Released</span>
                <span className="stat-value">April 2026</span>
              </div>
            </div>

            <div className="p-detail__actions">
              {state.user ? (
                <>
                  <div className="p-detail__price-row">
                    <div className="token-price">
                      <Zap size={24} fill="var(--color-orange)" className="text-orange" />
                      <span>5 Tokens</span>
                    </div>
                    <div className="price-label">Per Generation</div>
                  </div>

                  <Link 
                    to={isPremium ? '/pricing' : `/generate?template=${template.id || template._id}`} 
                    className="btn btn-primary btn-xl w-full"
                    style={{ width: '100%' }}
                  >
                    {isPremium ? 'Upgrade to Unlock' : 'Use this Prompt'} <Sparkles size={20} />
                  </Link>

                  <div className="p-detail__secondary-actions">
                    <button className="btn btn-secondary btn-xl" onClick={handleShare} style={{ flex: 1, gap: '10px', height: '56px' }}>
                      <Share2 size={20} /> Share this Prompt
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-detail__auth-gate">
                  <p className="text-muted" style={{ marginBottom: '15px', textAlign: 'center' }}>Login to unlock and use this professional prompt.</p>
                  <Link to="/login" className="btn btn-primary btn-xl w-full" style={{ width: '100%' }}>
                    Login or Register <ArrowRight size={20} />
                  </Link>
                </div>
              )}
            </div>

            <div className="p-detail__verified">
              <ShieldCheck size={18} className="text-green" />
              <span className="verified-text">Verified Quality: Tested on <strong>{model.label}</strong></span>
            </div>
          </div>
        </div>

        <section className="p-detail__bottom-section section-spacing">
          <div className="p-detail__bottom-grid">
            {/* Left: Reviews */}
            <div className="p-detail__reviews">
              <div className="reviews-header">
                <div className="reviews-summary-new">
                  <span className="reviews-count-big">603</span>
                  <span className="reviews-label-main">Creator Reviews</span>
                  <div className="reviews-rating-pill">
                    <Star size={14} fill="currentColor" />
                    <span>4.9</span>
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                {[
                  {
                    author: "obscura666veil",
                    date: "21 Apr",
                    text: "A very well-written prompt! The variations are endless, and the portraits emanate a rich, atmospheric quality. Bravo!",
                    rating: 5,
                    color: "var(--color-cyan)",
                    tag: "Top Buyer"
                  },
                  {
                    author: "creative_mind",
                    date: "18 Apr",
                    text: "That vintage prompt is absolutely brilliant. The AI doesn't lie—this one was fantastic for my project!",
                    rating: 5,
                    color: "var(--color-orange)",
                    tag: "Verified"
                  },
                  {
                    author: "pixel_artist",
                    date: "15 Apr",
                    text: "Exceeded my expectations. The lighting details in the generated output are exactly what I needed for my portfolio.",
                    rating: 5,
                    color: "var(--color-purple)",
                    tag: "Verified"
                  },
                  {
                    author: "neo_designer",
                    date: "10 Apr",
                    text: "Amazing value. These prompts are highly optimized and save me hours of trial and error. Highly recommend!",
                    rating: 5,
                    color: "var(--color-blue)",
                    tag: "Pro User"
                  }
                ].slice(0, reviewsLimit).map((rev, idx) => (
                  <div key={idx} className="review-card-premium review-card-premium--glowing">
                    <div className="review-accent-line" style={{ background: rev.color }}></div>
                    <div className="review-card-premium__header">
                      <div className="review-user-info">
                        <div className="user-initial-new" style={{ boxShadow: `0 0 15px ${rev.color}44`, background: rev.color }}>{rev.author[0].toUpperCase()}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="review-author-name">@{rev.author}</span>
                            <span className="review-verified-badge"><ShieldCheck size={10} /> {rev.tag}</span>
                          </div>
                          <span className="review-date-new">{rev.date}</span>
                        </div>
                      </div>
                      <div className="review-stars-new">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="review-body-text">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Related */}
            <div className="p-detail__related-side">
              <h2 className="h-display" style={{ fontSize: '2rem', marginBottom: 'var(--space-lg)' }}>
                More like <span className="text-orange">this</span>
              </h2>
              <div className="related-grid-vertical">
                {state.prompts
                  .filter(t => (t.category || t.keywords?.[0]) === category && (t.id || t._id) !== (template.id || template._id))
                  .slice(0, relatedLimit)
                  .map(t => (
                    <Link key={t.id || t._id} to={`/prompt/${t.id || t._id}`} className="related-card-small card" style={{ textDecoration: 'none' }}>
                      <div className="related-card-small__media">
                        <img 
                          src={t.thumbnail || (t.samples?.[0]?.output || t.samples?.[0]) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'} 
                          alt={t.title || t.name} 
                        />
                      </div>
                      <div className="related-card-small__info">
                        <h4>{t.title || t.name}</h4>
                        <span className="text-muted" style={{fontSize: '0.8rem'}}>{t.model || 'Flux.1'}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* Unified View More Button */}
          {(reviewsLimit < 4 || relatedLimit < 6) && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
              <button 
                className="btn btn-secondary btn-xl" 
                onClick={() => { setReviewsLimit(6); setRelatedLimit(6); }}
                style={{ minWidth: '240px' }}
              >
                View More Reviews & Prompts <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
