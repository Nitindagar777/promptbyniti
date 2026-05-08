/* GeneratePage — Public prompt generator (API-focused) */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { 
  Sparkles, Info, Image as ImageIcon, 
  RefreshCw, AlertTriangle, 
  Crown, Dices, Zap, Video, Type 
} from 'lucide-react';
import './GeneratePage.css';

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const descriptionRef = useRef(null);

  const [form, setForm] = useState({
    description: '',
    characterImage: null,
    promptType: 'image'
  });

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  /* Handle incoming state from Home Page */
  useEffect(() => {
    if (location.state) {
      if (location.state.isRandom) {
        handleRandomize(location.state.initialInput);
      } else if (location.state.initialInput) {
        setForm(prev => ({ ...prev, description: location.state.initialInput }));
      }
    }
  }, [location.state]);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.description || !form.description.trim()) {
      descriptionRef.current?.focus();
      return;
    }
    if (!canGenerate) {
      setShowPaywall(true);
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8845/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || 'Failed to generate prompt');
      }
      const promptResult = await response.json();
      setResult(promptResult);
      await useCredit(1);
      addPrompt(promptResult);
    } catch (error) {
      console.error('Generation Error:', error);
      alert(error.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomize = (initialDesc = null) => {
    const selectedIdea = typeof initialDesc === 'string' 
      ? initialDesc 
      : randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    setForm(prev => ({ ...prev, description: selectedIdea }));
  };

  const handleRegenerate = () => {
    setResult(null);
    setTimeout(() => handleGenerate(), 100);
  };

  return (
    <div className="generate-page" id="generate-page">
      <div className="container">
        {/* Header */}
        <div className="generate-page__header">
          <h1 className="generate-page__title">
            Prompt <span className="text-orange">Generator</span>
          </h1>
          <p className="generate-page__subtitle">
            Describe your vision and our AI will craft the perfect prompt for you
          </p>
          <div className="generate-page__credits-bar">
            <Zap size={16} />
            <span>
              {state.plan === 'unlimited'
                ? 'Unlimited credits'
                : `${state.credits} credits remaining`}
            </span>
          </div>
        </div>

        {/* Generator Form */}
        <div className="generate-page__grid">
          <div className="generate-page__form">
            {/* Character Consistency */}
            <div className="gen-section gen-section--expanded" id="gen-consistency">
              <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem' }}>Character Consistency</h3>
              <div className="consistency-upload">
                <label className="upload-placeholder" style={{ cursor: 'pointer' }}>
                  <input 
                    type="file" 
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateForm('characterImage', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {form.characterImage ? (
                    <img src={form.characterImage} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <p className="text-sm">Upload Reference Image</p>
                      <span className="text-xs text-muted">Supports JPG, PNG</span>
                    </>
                  )}
                </label>
                <div className="consistency-info">
                  <div className="info-badge">
                    <Info size={12} /> <span>How it works</span>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Our AI identifies the character in your reference image and maintains their 
                    identity across different scenes and styles.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Description */}
            <div className={`gen-section gen-section--full ${form.description ? 'gen-section--expanded' : ''}`} id="gen-description">
              <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem' }}>Your Description</h3>
              <textarea 
                ref={descriptionRef}
                className="gen-textarea" 
                placeholder="Describe your scene here... (e.g., A futuristic cyberpunk city with neon rainy streets, cinematic lighting)"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                style={{ minHeight: '120px', fontSize: '1.1rem' }}
                id="gen-main-description"
              ></textarea>

              <div className="mt-6">
                <h4 className="text-xs uppercase text-muted mb-3 font-bold tracking-widest flex items-center gap-2">
                  <Zap size={14} color="#ff0080" /> Which kind of prompt do you want?
                </h4>
                <div className="prompt-type-selector">
                  {['image', 'video', 'text'].map((type) => (
                    <button
                      key={type}
                      className={`prompt-type-btn ${form.promptType === type ? 'active' : ''}`}
                      onClick={() => updateForm('promptType', type)}
                    >
                      <div className="prompt-type-btn__icon">
                        {type === 'image' && <ImageIcon size={20} />}
                        {type === 'video' && <Video size={20} />}
                        {type === 'text' && <Type size={20} />}
                      </div>
                      <span className="capitalize">{type} Prompt</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Actions */}
            <div className="gen-actions">
              <button 
                className="btn btn-secondary btn-lg gen-random"
                onClick={() => handleRandomize()}
                disabled={isGenerating}
              >
                <div>
                  <div className="flex items-center gap-2 justify-center">
                    <Dices size={20} /> Surprise Me
                  </div>
                  <span className="text-xs opacity-70 block mt-1" style={{ fontSize: '0.75rem', fontWeight: 400 }}>Random Generate</span>
                </div>
              </button>

              <button
                className={`btn btn-primary btn-lg gen-submit ${isGenerating ? 'gen-submit--loading' : ''} ${form.description.length > 5 ? 'gen-submit--glow' : ''}`}
                onClick={result ? handleRegenerate : handleGenerate}
                disabled={isGenerating}
                id="gen-submit-btn"
              >
                {isGenerating ? (
                  <><RefreshCw size={18} className="gen-spin" /> Crafting...</>
                ) : result ? (
                  <><RefreshCw size={18} /> Regenerate</>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Prompt
                    {state.plan !== 'unlimited' && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(-1 credit)</span>}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output / Preview panel */}
          <div className="generate-page__output">
            {result ? (
              <PromptOutput result={result} />
            ) : (
              <div className="generate-page__preview">
                <h3>
                  <span className="text-cyan">Your Prompt Will Appear Here</span>
                </h3>
                <p>Describe your vision and hit Generate to create a professional AI prompt</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="paywall-overlay" onClick={() => setShowPaywall(false)} id="paywall-modal">
          <div className="paywall-card" onClick={e => e.stopPropagation()}>
            <div className="paywall-card__icon">
              <AlertTriangle size={32} />
            </div>
            <h2 className="paywall-card__title">
              {state.credits <= 0 ? "You're Out of Credits" : "Premium Feature"}
            </h2>
            <p className="paywall-card__desc">
              {state.credits <= 0
                ? 'Upgrade your plan to continue generating amazing prompts.'
                : 'This feature is available on paid plans. Upgrade to unlock it.'}
            </p>
            <div className="paywall-card__actions">
              <Link to="/pricing" className="btn btn-primary">
                <Crown size={16} /> View Plans
              </Link>
              <button className="btn btn-ghost" onClick={() => setShowPaywall(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
