import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle, Copy, ArrowLeft, Star, Clock, 
  Lock, Unlock, RefreshCw, Zap, Download, Maximize2, Check, Sparkles
} from 'lucide-react';
import { aiModels } from '../data/promptData';
import PromptThumbnail from '../components/PromptThumbnail';
import SEOHead from '../components/SEOHead';
import './PurchaseSuccess.css';

const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="star-rating-input">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const halfStarValue = i + 0.5;
        return (
          <div key={i} className="star-wrapper">
            <div 
              className="star-hitbox left"
              onMouseEnter={() => setHover(halfStarValue)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(halfStarValue)}
            />
            <div 
              className="star-hitbox right"
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(starValue)}
            />
            <Star 
              size={36} 
              className="star-icon-svg"
              fill={ (hover || value) >= starValue ? "var(--color-orange, #f59e0b)" : ((hover || value) >= halfStarValue ? "url(#half-grad)" : "none")}
              stroke={ (hover || value) >= halfStarValue ? "var(--color-orange, #f59e0b)" : "rgba(255,255,255,0.2)"}
            />
          </div>
        );
      })}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="half-grad">
            <stop offset="50%" stopColor="var(--color-orange, #f59e0b)" />
            <stop offset="50%" stopColor="transparent" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      {value > 0 && <span className="rating-display-val">{value.toFixed(1)}</span>}
    </div>
  );
};

const PurchaseSuccess = () => {
  const { id } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainCopied, setMainCopied] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [lightboxMedia, setLightboxMedia] = useState(null); // { url, type }
  
  // Review State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [alreadyReviewedBefore, setAlreadyReviewedBefore] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const modelLabel = prompt ? (aiModels.find(m => m.id === prompt.model)?.label || prompt.model) : '';

  const API_BASE = '/api';

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_BASE}/prompts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrompt(data.prompt);
        // Check if user already reviewed or is seller
        const currentUserId = state.user?._id || state.user?.id;
        const sellerMatch = data.prompt.seller?._id?.toString() === currentUserId?.toString() || 
                           data.prompt.seller?.toString() === currentUserId?.toString();
        const hasReviewed = data.prompt.reviews?.some(r => r.user?.toString() === currentUserId?.toString());
        
        setIsSeller(sellerMatch);
        setAlreadyReviewedBefore(hasReviewed);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please leave a comment');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_BASE}/prompts/${id}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Network error. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCopy = (text, key = 'main') => {
    navigator.clipboard.writeText(text);
    if (key === 'main') {
      setMainCopied(true);
      setTimeout(() => setMainCopied(false), 2000);
    } else {
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    }
  };

  if (loading) return (
    <div className="success-loading">
      <div className="loader-premium"></div>
      <p>Unlocking your premium content...</p>
    </div>
  );

  if (!prompt) return (
    <div className="success-error">
      <h2>Oops! Content not found.</h2>
      <button onClick={() => navigate('/buyer-dashboard')} className="btn-back">
        <ArrowLeft /> Back to My Library
      </button>
    </div>
  );

  return (
    <div className="purchase-success-page">
      <SEOHead title="Unlock Complete" noIndex={true} />
      <div className="container-small">
        <div className="success-header animate-fade-in">
          <h1>Unlock Successful!</h1>
          <p>This prompt is now permanently saved to your library.</p>
        </div>

        <div className="unlocked-card card premium-card animate-slide-up">
          <div className="card-top-row">
            <div className="badge-unlocked">
              <Unlock size={14} /> FULL ACCESS UNLOCKED
            </div>
            <div className="prompt-meta-info">
              <span><Zap size={14} /> {Math.floor(prompt.priceTokens || prompt.tokens || 5)} Tokens</span>
              <span><Star size={14} /> {modelLabel}</span>
              <span><Clock size={14} /> {new Date(prompt.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="unlocked-content">
            <div className="prompt-header-info">
              <PromptThumbnail 
                src={prompt.thumbnail || prompt.video || (prompt.samples?.[0]?.output || prompt.samples?.[0])} 
                alt={prompt.name} 
                type={prompt.generateType}
                samples={prompt.samples}
                className="success-thumb" 
              />
              <div className="header-text">
                <h2>{prompt.name}</h2>
                <p className="success-desc">{prompt.description}</p>
                <div className="seller-badge">
                  <span>Creator:</span> <strong>{prompt.seller?.name || 'Anonymous'}</strong>
                </div>
              </div>
            </div>



            <div className="secret-section">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', width: '100%' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  <Lock size={18} /> The Secret Prompt
                </h3>
                <button 
                  className={`btn-copy-small ${mainCopied ? 'copied' : ''}`}
                  onClick={() => handleCopy(prompt.template, 'main')}
                  style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
                >
                  {mainCopied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Prompt</>}
                </button>
              </div>
              <div className="prompt-box-reveal">
                {prompt.template}
              </div>
            </div>

            {prompt.instructions && (
              <div className="secret-section">
                <div className="section-title">
                  <h3><Zap size={18} /> Instructions & Usage</h3>
                </div>
                <div className="instructions-box">
                  {prompt.instructions}
                </div>
              </div>
            )}

            {prompt.keywords && prompt.keywords.length > 0 && (
              <div className="secret-section">
                <div className="section-title">
                  <h3>Keywords</h3>
                </div>
                <div className="keywords-grid-reveal">
                  {prompt.keywords.map(kw => (
                    <span key={kw} className="keyword-tag-reveal">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generator Metadata (Auto-filled) - Premium Unlocked Bonus */}
            {(prompt.mainPrompt || prompt.negativePrompt) && (
              <div className="secret-section generator-metadata-reveal animate-fade-in" style={{
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '32px'
              }}>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--color-cyan)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Sparkles size={20} className="text-cyan" /> Generator Metadata
                  </h3>
                  <span className="premium-badge-tiny">BONUS</span>
                </div>
                
                <div className="generator-metadata-box">
                  {prompt.mainPrompt && (
                    <div className="metadata-item">
                      <div className="metadata-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>Complete Prompt Example</span>
                        <button 
                          className={`btn-copy-small ${copiedStates['mainPrompt'] ? 'copied' : ''}`}
                          onClick={() => handleCopy(prompt.mainPrompt, 'mainPrompt')}
                        >
                          {copiedStates['mainPrompt'] ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
                        </button>
                      </div>
                      <div className="metadata-value prompt-box-reveal" style={{ background: 'rgba(0,0,0,0.3)', marginTop: '8px' }}>{prompt.mainPrompt}</div>
                    </div>
                  )}

                  {prompt.negativePrompt && (
                    <div className="metadata-item" style={{ marginTop: '20px' }}>
                      <div className="metadata-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>Negative Prompt</span>
                        <button 
                          className={`btn-copy-small ${copiedStates['negativePrompt'] ? 'copied' : ''}`}
                          onClick={() => handleCopy(prompt.negativePrompt, 'negativePrompt')}
                        >
                          {copiedStates['negativePrompt'] ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
                        </button>
                      </div>
                      <div className="metadata-value prompt-box-reveal" style={{ background: 'rgba(0,0,0,0.3)', marginTop: '8px' }}>{prompt.negativePrompt}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Samples Section */}
            {prompt.samples && prompt.samples.length > 0 && (
              <div className="secret-section">
                <div className="section-title">
                  <h3>Proof of Concept (Samples)</h3>
                </div>
                <div className="samples-grid-reveal">
                  {prompt.samples.map((sample, idx) => (
                    <div key={idx} className="sample-card-reveal">
                      <div className="sample-card-header">
                        <div className="sample-label">Sample #{idx + 1}</div>
                        <button 
                          className={`btn-icon-tiny ${copiedStates[`input-${idx}`] ? 'copied' : ''}`} 
                          title="Copy Input"
                          onClick={() => handleCopy(sample.input || prompt.template, `input-${idx}`)}
                        >
                          {copiedStates[`input-${idx}`] ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      
                      <div className="sample-input">
                        <span className="label">Input:</span> {sample.input || prompt.template}
                      </div>

                      <div className="sample-output-wrapper">
                        {prompt.generateType === 'video' ? (
                          <div className="media-container-premium">
                            <video src={sample.output || sample} className="sample-output-media" />
                            <div className="media-actions-overlay">
                              <button onClick={() => setLightboxMedia({ url: sample.output || sample, type: 'video' })} title="Full Screen"><Maximize2 size={16} /></button>
                              <a href={sample.output || sample} download={`sample-${idx+1}.mp4`} title="Download"><Download size={16} /></a>
                            </div>
                          </div>
                        ) : prompt.generateType === 'text' ? (
                          <div className="sample-output-text-container">
                            <div className="sample-output-text">{sample.output || sample}</div>
                            <button 
                              className={`btn-copy-text ${copiedStates[`output-${idx}`] ? 'copied' : ''}`} 
                              onClick={() => handleCopy(sample.output || sample, `output-${idx}`)}
                            >
                              {copiedStates[`output-${idx}`] ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Response</>}
                            </button>
                          </div>
                        ) : (
                          <div className="media-container-premium">
                            <img src={sample.output || sample} alt={`Sample ${idx + 1}`} className="sample-output-media" />
                            <div className="media-actions-overlay">
                              <button onClick={() => setLightboxMedia({ url: sample.output || sample, type: 'image' })} title="View Full Image"><Maximize2 size={16} /></button>
                              <a href={sample.output || sample} download={`sample-${idx+1}.png`} title="Download"><Download size={16} /></a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="success-footer-actions">
            <button onClick={() => navigate('/buyer-dashboard')} className="btn-secondary-outline">
              <ArrowLeft size={18} /> Go to My Library
            </button>
            <button onClick={() => navigate('/generate')} className="btn-primary-gradient">
              Use in Generator
            </button>
          </div>
        </div>

        {/* Review Section - Only show if not seller and not already reviewed before this session */}
        {!isSeller && !alreadyReviewedBefore && (
          <div className="review-submission-section card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="review-section-header">
            <div className="review-icon-bg">
              <Star size={24} fill="var(--color-orange)" className="text-orange" />
            </div>
            <div>
              <h3>How was the prompt?</h3>
              <p>Your feedback helps other creators.</p>
            </div>
          </div>

          {!reviewSubmitted ? (
            <div className="review-form">
              <div className="rating-picker-row">
                <label>Rating:</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="comment-box-row">
                <textarea 
                  placeholder="Share your thoughts on this prompt... (e.g., How did it work? Any tips for others?)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="review-textarea"
                />
              </div>

              {reviewError && <p className="review-error-msg">{reviewError}</p>}

              <button 
                className={`btn-submit-review ${submittingReview ? 'loading' : ''}`}
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? <RefreshCw className="spin" size={18} /> : 'Post Review'}
              </button>
            </div>
          ) : (
            <div className="review-thanks animate-fade-in">
              <div className="thanks-icon">
                <CheckCircle size={40} className="text-green" />
              </div>
              <h4>Thank you for your review!</h4>
              <p>Your feedback has been posted successfully.</p>
            </div>
            )}
          </div>
        )}
      </div>
      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="lightbox-overlay" onClick={() => setLightboxMedia(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxMedia(null)}>&times;</button>
            {lightboxMedia.type === 'video' ? (
              <video src={lightboxMedia.url} controls autoPlay className="lightbox-media" />
            ) : (
              <img src={lightboxMedia.url} alt="Full view" className="lightbox-media" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseSuccess;
