/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './HomePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';

export default function HomePage() {
  const { state, dispatch, canGenerate, useCredit, addPrompt, cache, setCachedData, setScroll, getScroll } = useApp();
  const location = useLocation();
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

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
    if (!demoInput.trim() || state.credits < 5) return;
    const result = generatePrompt({
      category: 'portrait',
      style: 'photorealistic',
      mood: 'aesthetic',
      lighting: 'golden-hour',
      camera: 'medium-shot',
      description: demoInput,
      model: 'midjourney',
    });
    setDemoResult(result);
    useCredit(5);
    addPrompt(result);
  };

  const handleRandomGenerate = () => {
    const randomPrompts = [
      "A futuristic cyberpunk city with neon lights and flying cars in the rain.",
      "An underwater kingdom with glowing jellyfish and ancient ruins.",
      "A cozy cottage in a mystical forest with talking animals and fairy dust.",
      "A majestic dragon guarding a treasure hoard in a volcanic cavern.",
      "An astronaut exploring a vibrant alien planet with purple vegetation.",
      "A Victorian steampunk laboratory filled with brass gears and steam.",
      "A peaceful Japanese garden with cherry blossoms and a koi pond.",
      "A gritty noir detective standing in a dark alley with a trench coat."
    ];
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);
    setDemoInput(randomPrompts[randomIndex]);
  };

  return (
    <div className="p-home" id="home-page">
      {/* 01. HERO */}
      <section className="p-hero container">
        <div className="p-hero__inner">
          <div><br /><br /><br /></div>
          <h1 className="p-hero__title reveal" style={{ animationDelay: '0.1s' }}>
            The <span className="text-cyan">Smartest</span> Way to <br />
            Imagine <span className="text-orange">Anything.</span>
          </h1>
          <p className="p-hero__subtitle reveal" style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', animationDelay: '0.2s', marginBottom: '10px' }}>
            <span className="text-orange">Generate.</span> <span className="text-cyan">Customize.</span> <span className="text-purple">Sell.</span>
          </p>
          <p className="reveal" style={{ color: 'white', fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '40px', animationDelay: '0.25s' }}>
            ai prompts.
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
              disabled={!demoInput.trim() || state.credits < 5}
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
          {state.credits < 5 && demoInput.trim() && (
            <p style={{ color: 'var(--color-pink)', textAlign: 'center', marginTop: '15px', fontFamily: 'var(--font-display)' }}>
              Insufficient credits (5 needed)
            </p>
          )}
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
                const s0 = tmpl.samples?.[0]?.output || tmpl.samples?.[0];
                const s1 = tmpl.samples?.[1]?.output || tmpl.samples?.[1];
                const s2 = tmpl.samples?.[2]?.output || tmpl.samples?.[2];
                const coverSrc = tmpl.thumbnail || (tmpl.generateType !== 'text' ? s0 : null);
                const isTextOnly = tmpl.generateType === 'text' || (!coverSrc && !tmpl.video);

                return (
                  <Link
                    key={tmpl.id || tmpl._id}
                    to={`/prompt/${tmpl.id || tmpl._id}`}
                    className="template-card card reveal"
                    id={`template-${tmpl.id || tmpl._id}`}
                    style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
                  >
                    {!isTextOnly ? (
                      <div className="template-card__visual">
                        {/* Main image — same as detail page */}
                        {tmpl.video || coverSrc?.toLowerCase().match(/\.(mp4|webm|ogg)$/) || tmpl.generateType === 'video' ? (
                          <video src={tmpl.video || coverSrc} autoPlay muted loop className="template-card__media template-card__media-main" />
                        ) : (
                          <img
                            src={coverSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                            alt={tmpl.title || tmpl.name}
                            className="template-card__media template-card__media-main"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'; }}
                          />
                        )}

                        {/* Hover gallery — all 3 samples, same as CSS expects */}
                        {s0 && s1 && s2 && (
                          <div className="template-card__gallery">
                            <div className="template-card__gallery-main">
                              {s0.toLowerCase().match(/\.(mp4|webm|ogg)$/) || tmpl.generateType === 'video' ? (
                                <video src={s0} autoPlay muted loop />
                              ) : (
                                <img src={s0} alt="sample 1" />
                              )}
                            </div>
                            <div className="template-card__gallery-side">
                              {s1.toLowerCase().match(/\.(mp4|webm|ogg)$/) || tmpl.generateType === 'video' ? (
                                <video src={s1} autoPlay muted loop />
                              ) : (
                                <img src={s1} alt="sample 2" />
                              )}
                              {s2.toLowerCase().match(/\.(mp4|webm|ogg)$/) || tmpl.generateType === 'video' ? (
                                <video src={s2} autoPlay muted loop />
                              ) : (
                                <img src={s2} alt="sample 3" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Model tag (top) */}
                        <div className="template-card__overlay template-card__overlay--top">
                          <span className="template-card__model-tag">
                            {tmpl.model || (tmpl.category === 'anime' ? 'Niji v6' : 'Flux.1')}
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
                          <div className="template-card__token-badge">
                            <ZapIcon size={12} fill="currentColor" /> {tmpl.priceTokens || tmpl.tokens || 5}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="template-card__content template-card__content--text">
                        <div className="template-card__overlay template-card__overlay--top">
                          <span className="template-card__model-tag template-card__model-tag--text">
                            {tmpl.model || 'GPT-4o'}
                          </span>
                          <div className="template-card__view-badge">
                            <Eye size={12} /> {tmpl.views || 0}
                          </div>
                        </div>
                        <h3 className="template-card__title-center">{tmpl.title || tmpl.name}</h3>
                        <div className="template-card__overlay template-card__overlay--bottom template-card__overlay--right">
                          <div className="template-card__token-badge template-card__token-badge--text">
                            <ZapIcon size={12} fill="currentColor" /> {tmpl.priceTokens || tmpl.tokens || 5} Tokens
                          </div>
                        </div>
                      </div>
                    )}
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
    </div>
  );
}
