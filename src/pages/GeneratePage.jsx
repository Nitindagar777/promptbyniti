/* GeneratePage — Public prompt generator (API-focused) */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { randomDescriptions, aiModels } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import {
  Sparkles, Info, Image as ImageIcon,
  RefreshCw, AlertTriangle,
  Crown, Dices, Zap, Video, Type, Search,
  Save, ShoppingBag, RotateCcw, Check
} from 'lucide-react';
import './GeneratePage.css';

const SESSION_KEY = 'promptgen_session';

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const descriptionRef = useRef(null);

  // Restore from sessionStorage on mount
  const getInitialForm = () => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.form || { description: '', characterImage: null, promptType: 'image', model: 'midjourney' };
      }
    } catch {}
    return { description: '', characterImage: null, promptType: 'image', model: 'midjourney' };
  };

  const getInitialResult = () => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.result || null;
      }
    } catch {}
    return null;
  };

  const [form, setForm] = useState(getInitialForm);
  const [result, setResult] = useState(getInitialResult);
  
  const [generatorMode, setGeneratorMode] = useState('prompt'); // 'prompt' or 'example'
  const [exampleTemplate, setExampleTemplate] = useState('');

  const [customModel, setCustomModel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Filter models by selected prompt type
  const typeMap = { image: 'image', video: 'video', text: 'chat' };
  const filteredModels = aiModels.filter(m => m.type === typeMap[form.promptType]);

  // When prompt type changes, auto-select first model of that type
  const handlePromptTypeChange = (type) => {
    const firstModel = aiModels.find(m => m.type === typeMap[type]);
    setForm(prev => ({ ...prev, promptType: type, model: firstModel?.id || '' }));
    setCustomModel('');
    setShowCustomInput(false);
  };

  // Persist form + result to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ form, result }));
    } catch {}
  }, [form, result]);

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
    if (generatorMode === 'prompt') {
      if (!form.description || !form.description.trim()) {
        descriptionRef.current?.focus();
        return;
      }
    } else {
      if (!exampleTemplate || !exampleTemplate.trim()) {
        return;
      }
    }

    if (!canGenerate) {
      setShowPaywall(true);
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const payload = generatorMode === 'prompt' 
        ? form 
        : { ...form, mode: 'example', description: exampleTemplate };

      const response = await fetch('http://localhost:8845/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  // ── Sell Prompt: navigate to sell page with all data ──
  const handleSellPrompt = () => {
    // Find the human-readable model label
    const modelEntry = aiModels.find(m => m.id === form.model);
    const sellData = {
      name: result.title || '',
      description: result.description || '',
      generateType: form.promptType || 'image',
      model: form.model || '',
      modelLabel: modelEntry ? modelEntry.label : form.model,
      template: result.promptTemplate || result.mainPrompt || '',
      instructions: result.instructions || '',
      keywords: result.keywords || [],
      mainPrompt: result.mainPrompt || '',
      negativePrompt: result.negativePrompt || '',
      imageAnalysis: result.imageAnalysis || '',
      // Pass generated sample prompts as INPUT text; leave output null so user uploads their own images
      samples: (result.samples || []).map((s) => ({
        input: s || '',
        output: null
      }))
    };
    navigate('/sell', { state: { fromGenerator: true, promptData: sellData } });
  };

  // ── Save Prompt: store to localStorage ──
  const handleSavePrompt = () => {
    try {
      const savedPrompts = JSON.parse(localStorage.getItem('saved_prompts') || '[]');
      const newPrompt = {
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        title: result.title || 'Untitled Prompt',
        description: result.description || '',
        promptType: form.promptType,
        model: form.model,
        characterImage: form.characterImage,
        userDescription: form.description,
        ...result
      };
      savedPrompts.unshift(newPrompt);
      localStorage.setItem('saved_prompts', JSON.stringify(savedPrompts));
      setSaveMessage('Prompt saved!');
      
      // Clear page after saving
      setTimeout(() => {
        handleRefresh();
        setSaveMessage('');
      }, 2000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save prompt.');
    }
  };

  // ── Refresh: clear everything ──
  const handleRefresh = () => {
    setForm({ description: '', characterImage: null, promptType: 'image', model: 'midjourney' });
    setResult(null);
    setCustomModel('');
    setShowCustomInput(false);
    setSaveMessage('');
    sessionStorage.removeItem(SESSION_KEY);
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

            {/* Mode Toggle */}
            <div className="gen-section gen-section--expanded" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '16px' }}>
                <button
                  className={`btn ${generatorMode === 'prompt' ? '' : 'btn-ghost'}`}
                  style={{ 
                    flex: 1, 
                    borderRadius: '12px', 
                    padding: '12px',
                    background: generatorMode === 'prompt' ? 'var(--color-cyan)' : 'transparent',
                    color: generatorMode === 'prompt' ? 'white' : 'var(--text-muted)',
                    fontWeight: generatorMode === 'prompt' ? 'bold' : 'normal',
                    border: 'none'
                  }}
                  onClick={() => { setGeneratorMode('prompt'); setResult(null); }}
                >
                  <Sparkles size={18} />
                  Prompt Generator
                </button>
                <button
                  className={`btn ${generatorMode === 'example' ? '' : 'btn-ghost'}`}
                  style={{ 
                    flex: 1, 
                    borderRadius: '12px', 
                    padding: '12px', 
                    background: generatorMode === 'example' ? 'var(--color-orange)' : 'transparent', 
                    color: generatorMode === 'example' ? 'white' : 'var(--text-muted)',
                    fontWeight: generatorMode === 'example' ? 'bold' : 'normal',
                    border: 'none'
                  }}
                  onClick={() => { setGeneratorMode('example'); setResult(null); }}
                >
                  <Type size={18} />
                  Example Generator
                </button>
              </div>
            </div>

            {generatorMode === 'prompt' ? (
              <>
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
                        const img = new Image();
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_SIZE = 1024;
                            let w = img.width, h = img.height;
                            if (w > MAX_SIZE || h > MAX_SIZE) {
                              if (w > h) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
                              else { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }
                            }
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            const compressed = canvas.toDataURL('image/jpeg', 0.85);
                            updateForm('characterImage', compressed);
                          };
                          img.src = ev.target.result;
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
              <div style={{ position: 'relative' }}>
                <textarea
                  ref={descriptionRef}
                  className="gen-textarea"
                  placeholder="Describe your scene here... (e.g., A futuristic cyberpunk city with neon rainy streets, cinematic lighting)"
                  value={form.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 450) {
                      updateForm('description', e.target.value);
                    }
                  }}
                  maxLength={450}
                  style={{ minHeight: '120px', fontSize: '1.1rem' }}
                  id="gen-main-description"
                ></textarea>
                <div style={{
                  position: 'absolute', bottom: '10px', right: '14px',
                  fontSize: '0.75rem', fontFamily: 'var(--font-display)',
                  color: form.description.length >= 420 ? '#ef4444' : 'var(--text-muted)',
                  opacity: 0.7
                }}>
                  {form.description.length}/450
                </div>
              </div>

              {/* Prompt Type Selector */}
              <div className="mt-6">
                <h4 className="text-xs uppercase text-muted mb-3 font-bold tracking-widest flex items-center gap-2">
                  <Zap size={14} color="#ff0080" /> Which kind of prompt do you want?
                </h4>
                <div className="prompt-type-selector">
                  {['image', 'video', 'text'].map((type) => (
                    <button
                      key={type}
                      className={`prompt-type-btn ${form.promptType === type ? 'active' : ''}`}
                      onClick={() => handlePromptTypeChange(type)}
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
              <br></br>
              {/* Target Model Selector */}
              <div className="mt-6">
                <h4 className="text-xs uppercase text-muted mb-3 font-bold tracking-widest flex items-center gap-2">
                  <Zap size={14} color="#a855f7" /> Select target AI model
                </h4>
                <div className="model-selector">
                  {filteredModels.map((m) => (
                    <button
                      key={m.id}
                      className={`model-chip ${form.model === m.id && !showCustomInput ? 'model-chip--active' : ''}`}
                      onClick={() => {
                        updateForm('model', m.id);
                        setShowCustomInput(false);
                        setCustomModel('');
                      }}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                  <button
                    className={`model-chip model-chip--custom ${showCustomInput ? 'model-chip--active' : ''}`}
                    onClick={() => {
                      setShowCustomInput(true);
                      updateForm('model', customModel || '');
                    }}
                  >
                    <Search size={14} />
                    <span>Other</span>
                  </button>
                </div>
                {showCustomInput && (
                  <input
                    className="model-custom-input"
                    type="text"
                    placeholder="Type your model name... (e.g., Pixart-α, SDXL Turbo)"
                    value={customModel}
                    onChange={(e) => {
                      setCustomModel(e.target.value);
                      updateForm('model', e.target.value);
                    }}
                    autoFocus
                  />
                )}
              </div>
            </div>
            </>
            ) : (
              <div className="gen-section gen-section--expanded gen-section--full" id="gen-example-mode">
                <h3 className="gen-section__title mb-4" style={{ color: 'var(--color-orange)', fontSize: '1.2rem' }}>Example Prompt Generator</h3>
                <p className="text-sm text-muted mb-4">
                  Enter a prompt template using variables in brackets, and the AI will generate 5 diverse sample variations. <br/>
                  <strong>Example:</strong> A [color] [animal] riding a [vehicle] in a [setting].
                </p>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="gen-textarea"
                    placeholder="Enter your prompt template with variables (e.g. A [size] [subject] in the [location]...)"
                    value={exampleTemplate}
                    onChange={(e) => setExampleTemplate(e.target.value)}
                    style={{ minHeight: '160px', fontSize: '1.1rem', borderColor: 'var(--color-orange)' }}
                  ></textarea>
                </div>

                {/* Target Model Selector for Example Mode */}
                <div className="mt-6">
                  <h4 className="text-xs uppercase text-muted mb-3 font-bold tracking-widest flex items-center gap-2">
                    <Zap size={14} color="#a855f7" /> Select target AI model
                  </h4>
                  <div className="model-selector">
                    {aiModels.map((m) => (
                      <button
                        key={m.id}
                        className={`model-chip ${form.model === m.id && !showCustomInput ? 'model-chip--active' : ''}`}
                        onClick={() => {
                          updateForm('model', m.id);
                          setShowCustomInput(false);
                          setCustomModel('');
                        }}
                      >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                    <button
                      className={`model-chip model-chip--custom ${showCustomInput ? 'model-chip--active' : ''}`}
                      onClick={() => {
                        setShowCustomInput(true);
                        updateForm('model', customModel || '');
                      }}
                    >
                      <Search size={14} />
                      <span>Other</span>
                    </button>
                  </div>
                  {showCustomInput && (
                    <input
                      className="model-custom-input"
                      type="text"
                      placeholder="Type your model name... (e.g., Pixart-α, SDXL Turbo)"
                      value={customModel}
                      onChange={(e) => {
                        setCustomModel(e.target.value);
                        updateForm('model', e.target.value);
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons — change based on state */}
            <div className="gen-actions">
              {result ? (
                /* ── Post-generation buttons ── */
                <>
                  <button
                    className="btn btn-lg gen-action-btn gen-action-btn--sell"
                    onClick={handleSellPrompt}
                    id="gen-sell-btn"
                  >
                    <ShoppingBag size={18} />
                    <span>Sell Prompt</span>
                  </button>

                  <button
                    className="btn btn-lg gen-action-btn gen-action-btn--save"
                    onClick={handleSavePrompt}
                    id="gen-save-btn"
                  >
                    {saveMessage ? <Check size={18} /> : <Save size={18} />}
                    <span>{saveMessage || 'Save Prompt'}</span>
                  </button>

                  <button
                    className="btn btn-lg gen-action-btn gen-action-btn--refresh"
                    onClick={handleRefresh}
                    id="gen-refresh-btn"
                  >
                    <RotateCcw size={18} />
                    <span>New Prompt</span>
                  </button>
                </>
              ) : (
                /* ── Pre-generation buttons ── */
                <>
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
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    id="gen-submit-btn"
                  >
                    {isGenerating ? (
                      <><RefreshCw size={18} className="gen-spin" /> Crafting...</>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate {generatorMode === 'example' ? 'Examples' : 'Prompt'}
                        {state.plan !== 'unlimited' && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(-1 credit)</span>}
                      </>
                    )}
                  </button>
                </>
              )}
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
