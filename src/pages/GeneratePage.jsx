/* GeneratePage — Main prompt generator */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePrompt } from '../data/promptEngine';
import { categories, styles, moods, lightingOptions, cameraAngles, aiModels, promptTemplates, lensSettings, compositions, colorPalettes, qualityTags, renderingEngines, motionActions, subjectDetailsSamples, environmentSamples, negativePromptSamples, modelParameterSamples, randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import { 
  Sparkles, Info, Image as ImageIcon, ChevronDown, ChevronUp, 
  RefreshCw, Copy, Check, Download, Share2, Wand2, AlertTriangle, 
  Crown, Dices, Zap 
} from 'lucide-react';
import './GeneratePage.css';

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const descriptionRef = useRef(null);

  const [form, setForm] = useState({
    category: 'portrait',
    style: 'photorealistic',
    mood: 'aesthetic',
    lighting: 'golden-hour',
    camera: 'medium-shot',
    description: '',
    model: 'midjourney',
    // New Fields
    subjectDetails: '',
    action: 'default',
    environment: '',
    lens: 'default',
    composition: 'default',
    color: 'default',
    quality: 'default',
    rendering: 'default',
    negativePrompt: '',
    modelParams: '',
    characterImage: null
  });

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showMoreLighting, setShowMoreLighting] = useState(false);
  const [showMoreCamera, setShowMoreCamera] = useState(false);
  const [showMoreLens, setShowMoreLens] = useState(false);
  const [showMoreComposition, setShowMoreComposition] = useState(false);
  const [showMoreColor, setShowMoreColor] = useState(false);
  const [showMoreQuality, setShowMoreQuality] = useState(false);
  const [showMoreRendering, setShowMoreRendering] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  
  // Collapse state for sections
  const [openSections, setOpenSections] = useState({
    model: false,
    category: false,
    subject: false,
    action: false,
    environment: false,
    style: false,
    mood: false,
    lighting: false,
    camera: false,
    lens: false,
    composition: false,
    color: false,
    quality: false,
    rendering: false,
    negative: false,
    params: false,
    consistency: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  /* Handle incoming state from Home Page */
  useEffect(() => {
    if (location.state) {
      if (location.state.isRandom) {
        handleRandomize(location.state.initialInput);
      } else if (location.state.initialInput) {
        // Manual input: Set description and reset all categories to default
        setForm(prev => ({
          ...prev,
          description: location.state.initialInput,
          category: 'default',
          style: 'default',
          mood: 'default',
          lighting: 'default',
          camera: 'default',
          lens: 'default',
          composition: 'default',
          color: 'default',
          quality: 'default',
          rendering: 'default',
          action: 'default',
          subjectDetails: '',
          environment: '',
          negativePrompt: '',
          modelParams: ''
        }));
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

    const templateId = searchParams.get('template');
    
    try {
      const response = await fetch('http://localhost:8845/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const promptResult = await response.json();
      setResult(promptResult);
      
      // If using a template, deduct 5 credits and redirect to success page
      const cost = templateId ? 5 : 1;
      await useCredit(cost, templateId);
      addPrompt(promptResult);
      
      if (templateId) {
        navigate(`/purchase-success/${templateId}`);
      }
    } catch (error) {
      console.error('Generation Error:', error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomize = (initialDesc = null) => {
    const randomPick = (list) => list[Math.floor(Math.random() * list.length)].id;
    
    const selectedIdea = typeof initialDesc === 'string' 
      ? initialDesc 
      : randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    
    setForm(prev => ({
      ...prev,
      model: randomPick(aiModels),
      category: randomPick(categories),
      style: randomPick(styles),
      mood: randomPick(moods),
      lighting: randomPick(lightingOptions),
      camera: randomPick(cameraAngles),
      lens: randomPick(lensSettings),
      composition: randomPick(compositions),
      color: randomPick(colorPalettes),
      quality: randomPick(qualityTags),
      rendering: randomPick(renderingEngines),
      action: randomPick(motionActions),
      subjectDetails: subjectDetailsSamples[Math.floor(Math.random() * subjectDetailsSamples.length)],
      environment: environmentSamples[Math.floor(Math.random() * environmentSamples.length)],
      negativePrompt: negativePromptSamples[Math.floor(Math.random() * negativePromptSamples.length)],
      modelParams: modelParameterSamples[Math.floor(Math.random() * modelParameterSamples.length)],
      description: selectedIdea
    }));
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
          </div>
        </div>

        {/* Generator Form */}
        <div className="generate-page__grid">
          <div className="generate-page__form">
            {/* AI Model Selection */}
            <div className={`gen-section ${openSections.model ? 'gen-section--expanded' : ''}`} id="gen-model">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('model')}>
                <h3 className="gen-section__title">AI Model Format</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {aiModels.find(m => m.id === form.model)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.model ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.model && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {aiModels.map(m => (
                    <button key={m.id} className={`gen-chip ${form.model === m.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('model', m.id)}>
                      <span>{m.icon}</span> <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div className={`gen-section ${openSections.category ? 'gen-section--expanded' : ''}`} id="gen-category">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('category')}>
                <h3 className="gen-section__title">Category</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {categories.find(c => c.id === form.category)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.category && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {categories.map(cat => (
                    <button key={cat.id} className={`gen-chip ${form.category === cat.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('category', cat.id)} title={cat.desc}>
                      <span>{cat.emoji}</span> <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Details */}
            <div className={`gen-section ${openSections.subject ? 'gen-section--expanded' : ''}`} id="gen-subject">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('subject')}>
                <h3 className="gen-section__title">Subject Details</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">{form.subjectDetails ? 'Configured' : 'Optional'}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.subject ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.subject && (
                <div className="mt-4">
                  <textarea 
                    className="textarea" 
                    placeholder="Age, gender, ethnicity, clothing, expression, accessories... (e.g., 25-year-old Japanese woman in leather jacket)"
                    value={form.subjectDetails}
                    onChange={e => updateForm('subjectDetails', e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Action / Pose */}
            <div className={`gen-section ${openSections.action ? 'gen-section--expanded' : ''}`} id="gen-action">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('action')}>
                <h3 className="gen-section__title">Action / Pose</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {motionActions.find(a => a.id === form.action)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.action ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.action && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {motionActions.map(a => (
                    <button key={a.id} className={`gen-chip gen-chip--sm ${form.action === a.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('action', a.id)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Environment */}
            <div className={`gen-section ${openSections.environment ? 'gen-section--expanded' : ''}`} id="gen-environment">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('environment')}>
                <h3 className="gen-section__title">Environment</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">{form.environment ? 'Configured' : 'Optional'}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.environment ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.environment && (
                <div className="mt-4">
                  <textarea 
                    className="textarea" 
                    placeholder="Location, weather, time of day... (e.g., foggy cyberpunk city street at night)"
                    value={form.environment}
                    onChange={e => updateForm('environment', e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Style */}
            <div className={`gen-section ${openSections.style ? 'gen-section--expanded' : ''}`} id="gen-style">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('style')}>
                <h3 className="gen-section__title">Art Style</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {styles.find(s => s.id === form.style)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.style ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.style && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {styles.map(s => (
                    <button key={s.id} className={`gen-chip gen-chip--sm ${form.style === s.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('style', s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mood */}
            <div className={`gen-section ${openSections.mood ? 'gen-section--expanded' : ''}`} id="gen-mood">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('mood')}>
                <h3 className="gen-section__title">Mood</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {moods.find(m => m.id === form.mood)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.mood ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.mood && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {moods.map(m => (
                    <button key={m.id} className={`gen-chip gen-chip--sm ${form.mood === m.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('mood', m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lighting */}
            <div className={`gen-section ${openSections.lighting ? 'gen-section--expanded' : ''}`} id="gen-lighting">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('lighting')}>
                <h3 className="gen-section__title">Lighting</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {lightingOptions.find(l => l.id === form.lighting)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.lighting ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.lighting && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {lightingOptions.map(l => (
                    <button key={l.id} className={`gen-chip gen-chip--sm ${form.lighting === l.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('lighting', l.id)}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Camera Angle */}
            <div className={`gen-section ${openSections.camera ? 'gen-section--expanded' : ''}`} id="gen-camera">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('camera')}>
                <h3 className="gen-section__title">Camera Angle</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {cameraAngles.find(c => c.id === form.camera)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.camera ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.camera && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {cameraAngles.map(c => (
                    <button key={c.id} className={`gen-chip gen-chip--sm ${form.camera === c.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('camera', c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lens / Camera Settings */}
            <div className={`gen-section ${openSections.lens ? 'gen-section--expanded' : ''}`} id="gen-lens">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('lens')}>
                <h3 className="gen-section__title">Lens / Camera</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {lensSettings.find(l => l.id === form.lens)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.lens ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.lens && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {lensSettings.map(l => (
                    <button key={l.id} className={`gen-chip gen-chip--sm ${form.lens === l.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('lens', l.id)}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Composition */}
            <div className={`gen-section ${openSections.composition ? 'gen-section--expanded' : ''}`} id="gen-composition">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('composition')}>
                <h3 className="gen-section__title">Composition</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {compositions.find(c => c.id === form.composition)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.composition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.composition && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {compositions.map(c => (
                    <button key={c.id} className={`gen-chip gen-chip--sm ${form.composition === c.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('composition', c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Palette */}
            <div className={`gen-section ${openSections.color ? 'gen-section--expanded' : ''}`} id="gen-color">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('color')}>
                <h3 className="gen-section__title">Color Palette</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {colorPalettes.find(c => c.id === form.color)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.color && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {colorPalettes.map(c => (
                    <button key={c.id} className={`gen-chip gen-chip--sm ${form.color === c.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('color', c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality / Details */}
            <div className={`gen-section ${openSections.quality ? 'gen-section--expanded' : ''}`} id="gen-quality">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('quality')}>
                <h3 className="gen-section__title">Quality / Details</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {qualityTags.find(q => q.id === form.quality)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.quality ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.quality && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {qualityTags.map(q => (
                    <button key={q.id} className={`gen-chip gen-chip--sm ${form.quality === q.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('quality', q.id)}>
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rendering Engine */}
            <div className={`gen-section ${openSections.rendering ? 'gen-section--expanded' : ''}`} id="gen-rendering">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('rendering')}>
                <h3 className="gen-section__title">Rendering Engine</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">Selected: {renderingEngines.find(r => r.id === form.rendering)?.label}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.rendering ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.rendering && (
                <div className="gen-chips gen-chips--wrap mt-4">
                  {renderingEngines.map(r => (
                    <button key={r.id} className={`gen-chip gen-chip--sm ${form.rendering === r.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm('rendering', r.id)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Negative Prompt */}
            <div className={`gen-section ${openSections.negative ? 'gen-section--expanded' : ''}`} id="gen-negative">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('negative')}>
                <h3 className="gen-section__title">Negative Prompt</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">{form.negativePrompt ? 'Configured' : 'Optional'}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.negative ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.negative && (
                <div className="mt-4">
                  <textarea 
                    className="textarea" 
                    placeholder="What to exclude... (e.g., blurry, low quality, distorted face, extra limbs)"
                    value={form.negativePrompt}
                    onChange={e => updateForm('negativePrompt', e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Model Parameters */}
            <div className={`gen-section ${openSections.params ? 'gen-section--expanded' : ''}`} id="gen-params">
              <div className="gen-section__header-toggle" onClick={() => toggleSection('params')}>
                <h3 className="gen-section__title">Model Parameters</h3>
                <div className="gen-section__status">
                  <span className="text-muted text-xs">{form.modelParams ? 'Set' : '--ar, --v, CFG...'}</span>
                </div>
                <div className="gen-section__chevron">
                  {openSections.params ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {openSections.params && (
                <div className="mt-4">
                  <input 
                    className="input" 
                    placeholder="e.g., --ar 16:9 --v 6 --stylize 250 (Midjourney) or CFG: 7, Steps: 30 (SD)"
                    value={form.modelParams}
                    onChange={e => updateForm('modelParams', e.target.value)}
                  />
                </div>
              )}
            </div>

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
            </div>

            {/* Generate Actions */}
            <div className="gen-actions">
              <button 
                className="btn btn-secondary btn-lg gen-random"
                onClick={handleRandomize}
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
                  <>
                    <RefreshCw size={18} className="gen-spin" />
                    Crafting...
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
