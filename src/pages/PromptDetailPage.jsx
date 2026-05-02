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
  const [replyingToIdx, setReplyingToIdx] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPromptPurchased, setIsPromptPurchased] = useState(false);
  const [reviews, setReviews] = useState([
    {
      author: "obscura666veil",
      date: "21 Apr",
      text: "A very well-written prompt! The variations are endless, and the portraits emanate a rich, atmospheric quality. Bravo!",
      rating: 5,
      color: "var(--color-cyan)",
      tag: "Top Buyer",
      reply: "Thanks for the nice review! Glad you like the atmospheric style."
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
  ]);

  const handleReplySubmit = (idx) => {
    if (!replyText.trim()) return;
    const newReviews = [...reviews];
    newReviews[idx].reply = replyText;
    setReviews(newReviews);
    setReplyingToIdx(null);
    setReplyText('');
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
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';
          const token = localStorage.getItem('promptbyniti_token');
          const res = await fetch(`${API_URL}/prompts/${id}?t=${Date.now()}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          const data = await res.json();
          if (data.success) {
            setTemplate(data.prompt);
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
                    const isOwner = state.user?.id?.toString() === template?.seller?._id?.toString() || 
                                    state.user?.id?.toString() === template?.seller?.toString();
                    
                    if (isPurchasedInState || isOwner || isPromptPurchased) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <button 
                            className={`btn btn-primary btn-xl w-full ${copied ? 'copied' : ''}`}
                            onClick={() => {
                              navigator.clipboard.writeText(template.template);
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
                            <span>5 Tokens</span>
                          </div>
                          <div className="price-label">Per Generation</div>
                        </div>

                        <button 
                          onClick={async () => {
                            if (state.credits < 5) {
                              alert('Insufficient tokens! You need 5 tokens to use this prompt.');
                              return;
                            }
                            
                            const templateId = template.id || template._id;
                            try {
                              // Deduct credits and process split
                              await useCredit(5, templateId);
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
                    <h2 className="reviews-number-gradient">603</h2>
                    <span className="reviews-label-sub">Creator Reviews</span>
                  </div>
                  <div className="reviews-rating-badge">
                    <div className="rating-pill-inner">
                      <Star size={14} fill="currentColor" />
                      <span>4.9</span>
                    </div>
                    <span className="rating-desc">Community Score</span>
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                {reviews.slice(0, reviewsLimit).map((rev, idx) => {
                  // Robust ID comparison - FOUND 'seller' in database model
                  const rawCreatorId = template?.seller || template?.userId || template?.user?._id || template?.user || template?.creator;
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
                        <div className="review-accent-line" style={{ background: rev.color }}></div>
                        <div className="review-card-premium__header">
                          <div className="review-user-info">
                            <div className="user-initial-new" style={{ boxShadow: `0 0 15px ${rev.color}44`, background: rev.color }}>{rev.author[0].toUpperCase()}</div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="review-author-name">@{rev.author}</span>
                              </div>
                              <span className="review-date-new">{rev.date}</span>
                            </div>
                          </div>
                          <div className="review-stars-new">
                            {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                          </div>
                        </div>
                        <p className="review-body-text">"{rev.text}"</p>
                        
                        {isCreator && !rev.reply && replyingToIdx !== idx && (
                          <div className="review-actions-creator">
                            <button className="btn-text-only" onClick={() => setReplyingToIdx(idx)} style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', marginTop: '10px' }}>
                              <MessageSquare size={14} /> Reply to review
                            </button>
                          </div>
                        )}

                        {replyingToIdx === idx && (
                          <div className="reply-editor" style={{ marginTop: '15px' }}>
                            <textarea 
                              className="form-control" 
                              placeholder={`Reply to @${rev.author}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{ minHeight: '80px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <button className="btn btn-primary btn-sm" onClick={() => handleReplySubmit(idx)}>Post Reply</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setReplyingToIdx(null); setReplyText(''); }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {rev.reply && (
                        <div className="creator-response-box">
                          <div className="response-header">
                            <div className="response-arrow"></div>
                            <span className="response-label">Response from creator to <span className="text-cyan">@{rev.author}</span></span>
                            <span className="response-date">• {rev.date}</span>
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
