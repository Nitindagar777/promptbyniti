/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign, Eye } from 'lucide-react';
import PreviewModal from '../components/PreviewModal';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PromptThumbnail from '../components/PromptThumbnail';
import SEOHead from '../components/SEOHead';
import './HomePage.css';

const API_URL = '/api';

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
      <section className="p-hero container">
        <div className="p-hero__inner">
          <div><br /><br /><br /></div>
          <h1 className="p-hero__title reveal" style={{ animationDelay: '0.1s' }}>
            The <span className="text-cyan">#1 AI Prompt</span> Generator <br />
            & <span className="text-orange">Marketplace</span>
          </h1>
          <p className="p-hero__subtitle reveal" style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', animationDelay: '0.2s', marginBottom: '10px' }}>
            <span className="text-orange">Generate.</span> <span className="text-cyan">Customize.</span> <span className="text-purple">Sell.</span>
          </p>
          <p className="reveal" style={{ color: 'white', fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '40px', animationDelay: '0.25s' }}>
            Best Prompts for Midjourney, ChatGPT, DALL·E & More...
          </p>
          <div className="p-hero__btns reveal" style={{ animationDelay: '0.3s' }}>
            <Link to="/generate" className="btn btn-primary btn-xl">
              Start Generating <ArrowRight size={20} />
            </Link>
            <Link to="/templates" className="btn btn-secondary btn-xl">
              Explore Archive
            </Link>
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
              className="btn btn-primary btn-xl"
              onClick={handleDemoGenerate}
              style={{ minWidth: '320px' }}
            >
              <Wand2 size={24} /> Transform into Professional Prompt
            </button>
            <button
              className="btn btn-sky btn-xl"
              onClick={handleRandomGenerate}
              style={{ minWidth: '220px' }}
            >
              <ZapIcon size={24} /> Randomly Generate
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

                      {/* Title + tokens (bottom) */}
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

      {/* 04. HOW IT WORKS */}
      <section className="p-benefits container section-spacing">
        <div className="p-benefits__header reveal">
          <h2 className="h-display">How it <span className="text-cyan">Works</span></h2>
          <p>Master the art of AI prompt engineering in three simple steps.</p>
        </div>
        <div className="p-benefits__grid">
          <div className="p-benefit reveal" style={{ animationDelay: '0.1s' }}>
            <div className="p-benefit__icon icon-tilt">
              <Zap size={48} color="var(--color-orange)" strokeWidth={1.5} />
            </div>
            <h3>1. <span className="text-orange">Get Tokens</span></h3>
            <p>Purchase credits to fuel your creative journey and generate high-end prompts.</p>
          </div>
          <div className="p-benefit reveal" style={{ animationDelay: '0.2s' }}>
            <div className="p-benefit__icon icon-pulse">
              <Sparkles size={48} color="var(--color-cyan)" strokeWidth={1.5} />
            </div>
            <h3>2. <span className="text-cyan">Generate</span></h3>
            <p>Transform any basic idea into a professional, optimized prompt in seconds.</p>
          </div>
          <div className="p-benefit reveal" style={{ animationDelay: '0.3s' }}>
            <div className="p-benefit__icon icon-bounce">
              <ShoppingBag size={48} color="var(--color-pink)" strokeWidth={1.5} />
            </div>
            <h3>3. <span className="text-pink">Sell & Earn</span></h3>
            <p>List your unique prompt art in our exclusive store and turn your creativity into profit.</p>
          </div>
        </div>
      </section>
      <br /> <br /> <br />
      {/* 05. TESTIMONIAL / CTA */}
      <section className="p-cta container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div className="p-cta__inner reveal">
          <div className="p-cta__content">
            <h2 className="h-display p-cta__title">Start your <span className="text-orange">journey</span> <span className="text-cyan">today!</span></h2>
            <p className="p-cta__subtitle">Join 12,000+ creators who upgraded their AI game. No more guessing, just creating.</p>
            <Link to="/generate" className="btn btn-primary btn-xl">
              Get Started for Free <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>
      {/* 06. SEO CONTENT — Keyword-rich text for search engines */}
      <section className="p-seo-content container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <h2 className="h-display" style={{ textAlign: 'center', marginBottom: '24px' }}>
            The Best <span className="text-cyan">AI Prompt</span> Platform — <span className="text-orange">Prompt by Niti</span>
          </h2>
          <div className="seo-caveat-text" style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.5rem' }}>
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

      {/* Preview Modal */}
      {previewPrompt && <PreviewModal prompt={previewPrompt} onClose={() => setPreviewPrompt(null)} />}
    </div>
  );
}
