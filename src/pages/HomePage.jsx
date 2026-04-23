/* HomePage — Premium Human Design Version */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import PromptOutput from '../components/PromptOutput';
import { ArrowRight, Sparkles, Zap, Image, Layers, Heart, Wand2, Rocket, Star, Palette, MessageSquare, ShieldCheck, Zap as ZapIcon, ShoppingBag, Coins, DollarSign } from 'lucide-react';
import { promptTemplates } from '../data/promptData';
import { useState } from 'react';
import './HomePage.css';

export default function HomePage() {
  const { state, canGenerate, useCredit, addPrompt } = useApp();
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState(null);

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
          <div className="p-playground__footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className="btn btn-primary btn-xl"
              onClick={handleDemoGenerate}
              disabled={!demoInput.trim() || state.credits < 5}
              style={{ minWidth: '320px' }}
            >
              <Wand2 size={24} /> Transform into Professional Prompt
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
               See all Prompts <ShoppingBag size={18} style={{marginLeft: '8px'}}/>
            </Link>
          </div>
          
          <div className="p-market-grid">
            {promptTemplates.slice(0, 8).map((tmpl, i) => (
              <Link
                key={tmpl.id}
                to={tmpl.premium && !state.isPremium ? '/pricing' : `/generate?template=${tmpl.id}`}
                className="template-card card reveal"
                id={`template-${tmpl.id}`}
                style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
              >
                {tmpl.thumbnail || tmpl.video ? (
                  <div className="template-card__visual">
                    {tmpl.video ? (
                      <video src={tmpl.video} autoPlay muted loop className="template-card__media template-card__media-main" />
                    ) : (
                      <>
                        <img src={tmpl.thumbnail} alt={tmpl.title} className="template-card__media template-card__media-main" />
                        {tmpl.samples && tmpl.samples.length >= 3 && (
                          <div className="template-card__gallery">
                            <div className="template-card__gallery-main">
                              <img src={tmpl.samples[0]} alt={`${tmpl.title} sample 1`} />
                            </div>
                            <div className="template-card__gallery-side">
                              <img src={tmpl.samples[1]} alt={`${tmpl.title} sample 2`} />
                              <img src={tmpl.samples[2]} alt={`${tmpl.title} sample 3`} />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Model Overlay (Top) */}
                    <div className="template-card__overlay template-card__overlay--top">
                      <span className="template-card__model-tag">
                        {tmpl.category === 'anime' ? 'Niji v6' : 'Flux.1'}
                      </span>
                    </div>
                    
                    {/* Name & Token Overlay (Bottom) */}
                    <div className="template-card__overlay template-card__overlay--bottom">
                      <h3 className="template-card__title-overlay">{tmpl.title}</h3>
                      <div className="template-card__token-badge">
                        <ZapIcon size={10} fill="currentColor" /> 5
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="template-card__content template-card__content--text">
                    {/* Model Overlay (Top) */}
                    <div className="template-card__overlay template-card__overlay--top">
                      <span className="template-card__model-tag template-card__model-tag--text">
                        {tmpl.category === 'chat' ? 'GPT-4o' : 'Claude 3.5'}
                      </span>
                    </div>

                    {/* Centered Name */}
                    <h3 className="template-card__title-center">{tmpl.title}</h3>

                    {/* Token Overlay (Bottom Right) */}
                    <div className="template-card__overlay template-card__overlay--bottom template-card__overlay--right">
                      <div className="template-card__token-badge template-card__token-badge--text">
                        <ZapIcon size={10} fill="currentColor" /> 5 Tokens
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
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
