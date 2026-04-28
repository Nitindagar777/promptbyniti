import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiModels } from '../data/promptData';
import { 
  Zap, ArrowLeft, Copy, Check, ShoppingBag, 
  Sparkles, Image, MessageSquare, Play, 
  Download, Share2, Heart, ShieldCheck,
  ChevronLeft, ChevronRight 
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

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);
      
      // Try fetching from Database
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';
          const res = await fetch(`${API_URL}/prompts/${id}`);
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
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Unlocking Prompt Secrets...</h2>
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
            </div>

            <div className="p-detail__stats card">
              <div className="stat-item">
                <span className="stat-label">Model</span>
                <span className="stat-value">{model.label}</span>
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
                <button className="btn btn-secondary" onClick={handleCopy} style={{ flex: 1 }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Template'}
                </button>
                <button className="btn btn-surface">
                  <Heart size={18} />
                </button>
                <button className="btn btn-surface">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-detail__security card">
              <div className="security-item">
                <div className="security-icon"><ShieldCheck size={24} className="text-green" /></div>
                <div>
                  <h4 style={{ color: 'white', marginBottom: '4px' }}>Verified Quality</h4>
                  <p className="text-xs text-muted">Tested on {model.label} for consistent results.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="p-detail__related section-spacing">
          <h2 className="h-display" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-lg)' }}>
            More like <span className="text-orange">this</span>
          </h2>
          <div className="related-grid">
            {state.prompts
              .filter(t => (t.category || t.keywords?.[0]) === category && (t.id || t._id) !== (template.id || template._id))
              .slice(0, 4)
              .map(t => (
                <Link key={t.id || t._id} to={`/prompt/${t.id || t._id}`} className="related-card card" style={{ textDecoration: 'none' }}>
                  <div className="related-card__media">
                    <img 
                      src={t.thumbnail || (t.samples?.[0]?.output || t.samples?.[0]) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'} 
                      alt={t.title || t.name} 
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                    />
                  </div>
                  <h4 style={{ marginTop: '12px', color: 'white' }}>{t.title || t.name}</h4>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
