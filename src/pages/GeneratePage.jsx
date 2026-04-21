/* GeneratePage — Main prompt generator */
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { categories, styles, moods, lightingOptions, cameraAngles, aiModels, promptTemplates } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { Sparkles, Zap, AlertTriangle, Lock, Crown, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';
import './GeneratePage.css';

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    category: 'portrait',
    style: 'photorealistic',
    mood: 'aesthetic',
    lighting: 'golden-hour',
    camera: 'medium-shot',
    description: '',
    model: 'midjourney',
  });

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showMoreModels, setShowMoreModels] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  /* Load template if passed in URL */
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = promptTemplates.find(t => t.id === templateId);
      if (template) {
        if (template.premium && !isPremium) {
          setShowPaywall(true);
          return;
        }
        setForm(prev => ({
          ...prev,
          ...template.config,
        }));
      }
    }
  }, [searchParams, isPremium]);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    // Simulate a brief processing feel
    setTimeout(() => {
      const promptResult = generatePrompt(form);
      setResult(promptResult);
      useCredit();
      addPrompt(promptResult);
      setIsGenerating(false);
    }, 800);
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
            Select your preferences and describe your vision — we'll craft the perfect prompt
          </p>

          <div className="generate-page__credits-bar">
            <Zap size={16} />
            <span>
              {state.plan === 'unlimited'
                ? 'Unlimited credits'
                : `${state.credits} credits remaining`}
            </span>
            {!isPremium && (
              <Link to="/pricing" className="generate-page__upgrade">
                <Crown size={12} /> Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Generator Form */}
        <div className="generate-page__grid">
          <div className="generate-page__form">
            {/* AI Model Selection */}
            <div className="gen-section" id="gen-model">
              <h3 className="gen-section__title">AI Model Format</h3>
              <div className="gen-chips gen-chips--wrap">
                {aiModels.slice(0, showMoreModels ? aiModels.length : 6).map(m => (
                  <button
                    key={m.id}
                    className={`gen-chip ${form.model === m.id ? 'gen-chip--active' : ''} ${m.premium && !isPremium ? 'gen-chip--locked' : ''}`}
                    onClick={() => {
                      if (m.premium && !isPremium) {
                        setShowPaywall(true);
                        return;
                      }
                      updateForm('model', m.id);
                    }}
                    id={`model-${m.id}`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                    {m.premium && !isPremium && <Lock size={12} />}
                  </button>
                ))}
                <button 
                  className="gen-chip gen-chip--toggle" 
                  onClick={() => setShowMoreModels(!showMoreModels)}
                >
                  {showMoreModels ? 'Show Less' : `+${aiModels.length - 6} More Models`}
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="gen-section" id="gen-category">
              <h3 className="gen-section__title">Category</h3>
              <div className="gen-chips gen-chips--wrap">
                {categories.slice(0, showMoreCategories ? categories.length : 12).map(cat => (
                  <button
                    key={cat.id}
                    className={`gen-chip ${form.category === cat.id ? 'gen-chip--active' : ''}`}
                    onClick={() => updateForm('category', cat.id)}
                    title={cat.desc}
                    id={`cat-${cat.id}`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
                <button 
                  className="gen-chip gen-chip--toggle" 
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                >
                  {showMoreCategories ? 'Show Less' : `+${categories.length - 12} More Categories`}
                </button>
              </div>
            </div>

            {/* Style */}
            <div className="gen-section" id="gen-style">
              <h3 className="gen-section__title">Art Style</h3>
              <div className="gen-chips gen-chips--wrap">
                {styles.map(s => (
                  <button
                    key={s.id}
                    className={`gen-chip gen-chip--sm ${form.style === s.id ? 'gen-chip--active' : ''}`}
                    onClick={() => updateForm('style', s.id)}
                    id={`style-${s.id}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="gen-section" id="gen-mood">
              <h3 className="gen-section__title">Mood</h3>
              <div className="gen-chips gen-chips--wrap">
                {moods.map(m => (
                  <button
                    key={m.id}
                    className={`gen-chip gen-chip--sm ${form.mood === m.id ? 'gen-chip--active' : ''}`}
                    onClick={() => updateForm('mood', m.id)}
                    id={`mood-${m.id}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="gen-section" id="gen-lighting">
              <h3 className="gen-section__title">Lighting</h3>
              <div className="gen-chips gen-chips--wrap">
                {lightingOptions.map(l => (
                  <button
                    key={l.id}
                    className={`gen-chip gen-chip--sm ${form.lighting === l.id ? 'gen-chip--active' : ''}`}
                    onClick={() => updateForm('lighting', l.id)}
                    id={`light-${l.id}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angle */}
            <div className="gen-section" id="gen-camera">
              <h3 className="gen-section__title">Camera Angle</h3>
              <div className="gen-chips gen-chips--wrap">
                {cameraAngles.map(c => (
                  <button
                    key={c.id}
                    className={`gen-chip gen-chip--sm ${form.camera === c.id ? 'gen-chip--active' : ''}`}
                    onClick={() => updateForm('camera', c.id)}
                    id={`cam-${c.id}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Character Consistency (Premium) */}
            <div className="gen-section gen-section--premium" id="gen-consistency">
              <div className="gen-section__header-flex">
                <h3 className="gen-section__title">Character Consistency</h3>
                <span className="badge badge-warning"><Crown size={10} /> Premium</span>
              </div>
              <div className="consistency-upload">
                <div className="upload-placeholder">
                  <ImageIcon size={24} />
                  <p className="text-sm">Upload Reference Image</p>
                  <span className="text-xs text-muted">Supports JPG, PNG</span>
                </div>
                <div className="consistency-info">
                  <div className="info-badge">
                    <Info size={12} />
                    <span>How it works</span>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Our AI identifies the character in your reference image and maintains their 
                    identity across different scenes and styles.
                  </p>
                </div>
              </div>
              {!isPremium && <div className="section-lock-overlay">
                <button className="btn btn-primary btn-sm" onClick={() => setShowPaywall(true)}>
                  <Lock size={12} /> Unlock Feature
                </button>
              </div>}
            </div>

            {/* Description */}
            <div className="gen-section" id="gen-description">
              <h3 className="gen-section__title">Your Description</h3>
              <textarea
                className="textarea"
                placeholder="Describe what you want to create in detail... The more specific, the better your prompt!"
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                rows={4}
                id="gen-desc-input"
              />
            </div>

            {/* Generate Button */}
            <button
              className={`btn btn-primary btn-lg gen-submit ${isGenerating ? 'gen-submit--loading' : ''}`}
              onClick={result ? handleRegenerate : handleGenerate}
              disabled={isGenerating}
              id="gen-submit-btn"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="gen-spin" />
                  Crafting Your Prompt...
                </>
              ) : result ? (
                <>
                  <RefreshCw size={18} />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Prompt
                  {state.plan !== 'unlimited' && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(-1 credit)</span>}
                </>
              )}
            </button>
          </div>

          {/* Output / Preview panel */}
          <div className="generate-page__output">
            {result ? (
              <PromptOutput result={result} />
            ) : (
              <div className="generate-page__preview">
                <div className="generate-page__preview-icon animate-float">
                  <Sparkles size={48} />
                </div>
                <h3>Your Prompt Will Appear Here</h3>
                <p>Select your preferences and hit Generate to create a professional AI prompt</p>
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
