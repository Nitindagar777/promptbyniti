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
import PromptThumbnail from '../components/PromptThumbnail';
import './PromptDetailPage.css';

// Global cache to prevent reference errors if any old/experimental code is running
const cachePromptDetail = {};

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
  const [replyingToIdx, setReplyingToIdx] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPromptPurchased, setIsPromptPurchased] = useState(false);
  const [reviews, setReviews] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL ||
    (window.location.hostname.includes('oopsverse.cloud')
      ? 'https://oopsverse.cloud/api'
      : 'http://localhost:8845/api');

  const handleReplySubmit = async (idx) => {
    if (!replyText.trim()) return;

    const reviewId = reviews[idx]._id;
    if (!reviewId) {
      console.error('❌ Review ID missing for index:', idx, reviews[idx]);
      return;
    }

    const url = `${API_BASE}/prompts/${id}/reviews/${reviewId}/reply`;
    console.log('🚀 ATTEMPTING REPLY:', { url, reviewId, replyText });

    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        const updatedReviews = [...reviews];
        updatedReviews[idx].reply = replyText;
        setReviews(updatedReviews);
        setReplyingToIdx(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Reply submission error:', err);
    }
  };

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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';
        const token = localStorage.getItem('promptbyniti_token');
        const res = await fetch(`${API_URL}/prompts/${id}?t=${Date.now()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          setTemplate(data.prompt);
          setReviews(data.prompt.reviews || []);
          if (data.isPurchased) {
            setIsPromptPurchased(true);
          }
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

  const isVisual = template.generateType !== 'text' && (template.thumbnail || template.video || template.samples);
  const modelId = template.config?.model || template.model;
  const model = aiModels.find(m => m.id === modelId) || aiModels[0];
  const isPremium = template.premium && !state.isPremium;
  const category = (template.category || template.keywords?.[0] || 'Art');

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
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
                    <video
                      src={template.video || (template.samples?.[activeImage]?.output || template.samples?.[activeImage])}
                      autoPlay muted loop controls
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                    />
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
                      const isVideo = thumbSrc?.toLowerCase().match(/\.(mp4|webm|ogg)$/) || template.generateType === 'video';
                      return (
                        <div
                          key={idx}
                          className={`visual-thumb ${activeImage === idx ? 'visual-thumb--active' : ''}`}
                          onClick={() => { setActiveImage(idx); setImageRatio(null); }}
                        >
                          {isVideo ? (
                            <video src={thumbSrc} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={thumbSrc} alt={`Sample ${idx + 1}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-display card">
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
          </div>

          {/* RIGHT COLUMN: Actions & Info */}
          <div className="p-detail__info-section">
            <div className="p-detail__header-info">
              <span className="p-detail__category-tag">{category.replace('-', ' ')}</span>
              <h1 className="p-detail__title">{template.title || template.name}</h1>
              <p className="p-detail__desc">{template.description || "A professional high-end prompt optimized for creative production."}</p>

              {/* AI Generator Metadata (Auto-filled) - Only visible if purchased/authorized */}
              {(template.mainPrompt || template.negativePrompt || template.imageAnalysis) && (
                <div className="p-detail__generator-metadata card" style={{
                  marginTop: '24px',
                  padding: '24px',
                  background: 'rgba(6, 182, 212, 0.03)',
                  border: '1px dashed rgba(6, 182, 212, 0.2)',
                  borderRadius: '16px'
                }}>
                  <h4 style={{ color: 'var(--color-cyan)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                    <Sparkles size={18} /> Auto-filled from Generator
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {template.mainPrompt && (
                      <div className="metadata-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete Prompt Example</span>
                          <button
                            className={`btn-icon-tiny ${copied ? 'copied' : ''}`}
                            onClick={() => handleCopyText(template.mainPrompt)}
                            style={{ width: '28px', height: '28px' }}
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="prompt-box-reveal" style={{ fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>{template.mainPrompt}</div>
                      </div>
                    )}

                    {template.negativePrompt && (
                      <div className="metadata-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Negative Prompt</span>
                          <button
                            className={`btn-icon-tiny ${copied ? 'copied' : ''}`}
                            onClick={() => handleCopyText(template.negativePrompt)}
                            style={{ width: '28px', height: '28px' }}
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="prompt-box-reveal" style={{ fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>{template.negativePrompt}</div>
                      </div>
                    )}

                    {template.imageAnalysis && (
                      <div className="metadata-item">
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Analysis</span>
                        </div>
                        <div className="prompt-box-reveal" style={{ fontSize: '0.85rem', padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {template.imageAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
            </div>

            <div className="p-detail__stats card">
              <div className="stat-item" style={{
                gridColumn: '1 / -1',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 0 }}>
                  {(() => {
                    const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();
                    const sellerId = template.seller?._id?.toString() || template.seller?.id?.toString() || template.seller?.toString();
                    const isCreator = currentUserId && sellerId && (currentUserId === sellerId);
                    const avatarUrl = template.seller?.avatar || (isCreator ? state.user?.avatar : null) || `https://ui-avatars.com/api/?name=${template.seller?.name || 'C'}&background=random`;

                    return (
                      <>
                        <img
                          src={avatarUrl}
                          alt="Creator Avatar"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-cyan)', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}
                        />
                        <span style={{ fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>{template.seller?.name || 'Unknown Creator'}</span>
                      </>
                    );
                  })()}
                </span>
              </div>
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
                  {(() => {
                    const userPurchases = state.user?.purchasedPrompts || [];
                    const currentId = template?._id?.toString() || id?.toString();
                    const isPurchasedInState = userPurchases.some(p => {
                      const pid = typeof p === 'object' ? p._id : p;
                      return pid?.toString() === currentId;
                    });
                    const isOwner = (state.user?.id?.toString() === template?.seller?._id?.toString() ||
                      state.user?.id?.toString() === template?.seller?.toString() ||
                      state.user?._id?.toString() === template?.seller?._id?.toString() ||
                      state.user?._id?.toString() === template?.seller?.toString());

                    if (isOwner) {
                      return (
                        <div style={{
                          padding: '24px',
                          background: 'rgba(6, 182, 212, 0.05)',
                          border: '1px dashed var(--color-cyan)',
                          borderRadius: 'var(--radius-lg)',
                          textAlign: 'center'
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.25rem',
                            color: 'var(--color-cyan)',
                            margin: 0
                          }}>
                            It is your prompt ✨
                          </p>
                          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                            As the creator, you can manage this from your dashboard.
                          </p>
                        </div>
                      );
                    }

                    if (isPurchasedInState || isPromptPurchased) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <button
                            className={`btn btn-primary btn-xl w-full ${copied ? 'copied' : ''}`}
                            onClick={() => {
                              navigator.clipboard.writeText(template.template || template.config?.description || '');
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            style={{ width: '100%', gap: '10px' }}
                          >
                            {copied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy Secret Prompt</>}
                          </button>

                          <button
                            className="btn btn-secondary btn-xl w-full"
                            onClick={() => window.open(`/purchase-success/${template._id}`, '_blank')}
                            style={{
                              width: '100%',
                              gap: '10px',
                              background: 'rgba(168, 85, 247, 0.1)',
                              border: '1px solid rgba(168, 85, 247, 0.2)',
                              color: 'var(--color-purple)'
                            }}
                          >
                            <Eye size={20} /> View Full Instructions
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="p-detail__price-row">
                          <div className="token-price">
                            <Zap size={24} fill="var(--color-orange)" className="text-orange" />
                            <span>{Math.floor(template.priceTokens || template.tokens || 5)} Tokens</span>
                          </div>
                          <div className="price-label">Unlock Full Access</div>
                        </div>

                        <button
                          onClick={async () => {
                            const price = template.priceTokens || template.tokens || 5;
                            if (Math.floor(state.credits) < price) {
                              alert(`Insufficient tokens! You need ${price} tokens to unlock this prompt.`);
                              return;
                            }

                            const templateId = template.id || template._id;
                            try {
                              // Deduct credits and process split
                              await useCredit(price, templateId);
                              // Redirect to success page in a new tab
                              window.open(`/purchase-success/${templateId}`, '_blank');
                            } catch (err) {
                              console.error('Purchase failed:', err);
                              alert('Transaction failed. Please try again.');
                            }
                          }}
                          className="btn btn-primary btn-xl w-full"
                          style={{ width: '100%', gap: '10px' }}
                        >
                          Use this Prompt <Sparkles size={20} />
                        </button>

                        <div className="p-detail__secondary-actions">
                          <button className="btn btn-secondary btn-xl" onClick={handleShare} style={{ width: '100%', gap: '10px', height: '56px' }}>
                            <Share2 size={20} /> Share this Prompt
                          </button>
                        </div>
                      </div>
                    );
                  })()}
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
                <div className="reviews-summary-premium">
                  <div className="reviews-stat-stack">
                    <h2 className="reviews-number-gradient">{template.totalReviews || 0}</h2>
                    <span className="reviews-label-sub">Creator Reviews</span>
                  </div>
                  <div className="reviews-rating-badge">
                    <div className="rating-pill-inner">
                      <Star size={14} fill="currentColor" />
                      <span>{(template.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <span className="rating-desc">Community Score</span>
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                {reviews.slice(0, reviewsLimit).map((rev, idx) => {
                  // Robust ID comparison for populated seller object
                  const rawCreatorId = template?.seller?._id || template?.seller || template?.userId;
                  const creatorId = rawCreatorId?.toString();
                  const currentUserId = state.user?._id?.toString() || state.user?.id?.toString();

                  const isCreator = currentUserId && creatorId && (currentUserId === creatorId);

                  // Debug log to help you fix this in the console
                  if (idx === 0) {
                    console.log('🧐 ID CHECK:', {
                      currentUserId,
                      creatorId,
                      match: isCreator,
                      rawTemplate: template
                    });
                  }

                  return (
                    <div key={idx} className="review-container">
                      <div className="review-card-premium review-card-premium--glowing">
                        <div className="review-accent-line" style={{ background: 'var(--color-cyan)' }}></div>
                        <div className="review-card-premium__header">
                          <div className="review-user-info">
                            <div className="user-initial-new" style={{ background: 'var(--color-cyan)', padding: 0, overflow: 'hidden' }}>
                              {rev.userAvatar ? (
                                <img src={rev.userAvatar} alt={rev.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (rev.userName || 'U')[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="review-author-name">@{rev.userName}</span>
                              </div>
                              <span className="review-date-new">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="review-stars-new">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={rev.rating >= i + 1 ? "currentColor" : (rev.rating >= i + 0.5 ? "url(#half-grad-small)" : "none")}
                                stroke="currentColor"
                              />
                            ))}
                            <svg width="0" height="0" style={{ position: 'absolute' }}>
                              <linearGradient id="half-grad-small">
                                <stop offset="50%" stopColor="currentColor" />
                                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                              </linearGradient>
                            </svg>
                          </div>
                        </div>
                        <p className="review-body-text">"{rev.comment}"</p>

                        {isCreator && !rev.reply && replyingToIdx !== idx && (
                          <div className="review-actions-creator">
                            <button className="btn-text-only" onClick={() => setReplyingToIdx(idx)} style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', marginTop: '10px' }}>
                              <MessageSquare size={14} /> Reply to review
                            </button>
                          </div>
                        )}

                        {replyingToIdx === idx && (
                          <div className="reply-editor animate-slide-up" style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              Replying to <span className="text-cyan">@{rev.userName}</span>
                            </div>
                            <textarea
                              className="reply-textarea-premium"
                              placeholder="Write your response here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '15px',
                                fontSize: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                marginBottom: '15px',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button className="btn btn-primary btn-md" onClick={() => handleReplySubmit(idx)} style={{ borderRadius: '10px', padding: '10px 24px' }}>Post Reply</button>
                              <button className="btn btn-secondary btn-md" onClick={() => { setReplyingToIdx(null); setReplyText(''); }} style={{ borderRadius: '10px', padding: '10px 24px' }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {rev.reply && (
                        <div className="creator-response-box animate-fade-in">
                          <div className="response-header">
                            <div className="response-arrow"></div>
                            <span className="response-label">Response from creator to <span className="text-cyan">@{rev.userName}</span></span>
                            <span className="response-date">• Verified Response</span>
                          </div>
                          <p className="response-text">{rev.reply}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Related */}
            <div className="p-detail__related-side">
              <h2 className="h-display" style={{ fontSize: '2rem', marginBottom: 'var(--space-lg)' }}>
                More like <span className="text-orange">this</span>
              </h2>
              <div className="related-grid-vertical">
                {(() => {
                  let related = state.prompts.filter(t => {
                    const isSelf = (t.id || t._id) === (template.id || template._id);
                    if (isSelf) return false;

                    const catMatch = t.category === template.category;
                    const keywordMatch = t.keywords?.some(k => template.keywords?.includes(k));
                    return catMatch || keywordMatch;
                  });

                  // Fallback: If no related found, just show any other prompts
                  if (related.length === 0) {
                    related = state.prompts.filter(t => (t.id || t._id) !== (template.id || template._id));
                  }

                  return related.slice(0, relatedLimit).map(t => (
                    <Link key={t.id || t._id} to={`/prompt/${t.id || t._id}`} className="related-card-small card" style={{ textDecoration: 'none' }}>
                      <div className="related-card-small__media">
                        <PromptThumbnail
                          src={t.thumbnail || (t.samples?.[0]?.output || t.samples?.[0])}
                          alt={t.title || t.name}
                        />
                      </div>
                      <div className="related-card-small__info">
                        <h4>{t.title || t.name}</h4>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t.model || 'Flux.1'}</span>
                      </div>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Unified View More Button */}
          {(reviews.length > reviewsLimit || state.prompts.length > relatedLimit + 1) && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', marginBottom: '50px' }}>
              <button
                className="btn btn-secondary-outline btn-xl"
                onClick={() => {
                  if (reviews.length > reviewsLimit) setReviewsLimit(prev => prev + 4);
                  if (state.prompts.length > relatedLimit + 1) setRelatedLimit(prev => prev + 3);
                }}
                style={{ minWidth: '280px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                View More Content <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
