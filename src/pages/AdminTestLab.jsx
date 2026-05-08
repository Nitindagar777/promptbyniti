/* AdminTestLab — Admin-only page with ALL characteristics for engine testing */
import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { categories, styles, moods, lightingOptions, cameraAngles, aiModels, lensSettings, compositions, colorPalettes, qualityTags, renderingEngines, motionActions, subjectDetailsSamples, environmentSamples, negativePromptSamples, modelParameterSamples, randomDescriptions } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import {
  Sparkles, ChevronDown, ChevronUp,
  RefreshCw, Dices, Zap, Shield, FlaskConical
} from 'lucide-react';
import './AdminTestLab.css';

export default function AdminTestLab() {
  const { state, canGenerate, useCredit, addPrompt } = useApp();
  const descriptionRef = useRef(null);

  const [form, setForm] = useState({
    category: 'portrait',
    style: 'photorealistic',
    mood: 'aesthetic',
    lighting: 'golden-hour',
    camera: 'medium-shot',
    description: '',
    model: 'midjourney',
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
    promptType: 'image'
  });

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [openSections, setOpenSections] = useState({
    model: false, category: false, subject: false, action: false,
    environment: false, style: false, mood: false, lighting: false,
    camera: false, lens: false, composition: false, color: false,
    quality: false, rendering: false, negative: false, params: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.description || !form.description.trim()) {
      descriptionRef.current?.focus();
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

  const handleRandomize = () => {
    const randomPick = (list) => list[Math.floor(Math.random() * list.length)].id;
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
      description: randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)]
    }));
  };

  const handleRegenerate = () => {
    setResult(null);
    setTimeout(() => handleGenerate(), 100);
  };

  /* Reusable section renderer */
  const renderChipSection = (key, title, items, formKey, showLabel = true) => (
    <div className={`gen-section ${openSections[key] ? 'gen-section--expanded' : ''}`} key={key}>
      <div className="gen-section__header-toggle" onClick={() => toggleSection(key)}>
        <h3 className="gen-section__title">{title}</h3>
        <div className="gen-section__status">
          <span className="text-muted text-xs">Selected: {items.find(i => i.id === form[formKey])?.label}</span>
        </div>
        <div className="gen-section__chevron">
          {openSections[key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {openSections[key] && (
        <div className="gen-chips gen-chips--wrap mt-4">
          {items.map(item => (
            <button key={item.id} className={`gen-chip gen-chip--sm ${form[formKey] === item.id ? 'gen-chip--active' : ''}`} onClick={() => updateForm(formKey, item.id)}>
              {item.emoji && <span>{item.emoji}</span>} <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderTextareaSection = (key, title, formKey, placeholder) => (
    <div className={`gen-section ${openSections[key] ? 'gen-section--expanded' : ''}`} key={key}>
      <div className="gen-section__header-toggle" onClick={() => toggleSection(key)}>
        <h3 className="gen-section__title">{title}</h3>
        <div className="gen-section__status">
          <span className="text-muted text-xs">{form[formKey] ? 'Configured' : 'Optional'}</span>
        </div>
        <div className="gen-section__chevron">
          {openSections[key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {openSections[key] && (
        <div className="mt-4">
          <textarea className="textarea" placeholder={placeholder} value={form[formKey]} onChange={e => updateForm(formKey, e.target.value)} rows={2} />
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-lab" id="admin-test-lab">
      <div className="container">
        {/* Header */}
        <div className="admin-lab__header">
          <div className="admin-lab__badge">
            <Shield size={14} /> Admin Only
          </div>
          <h1 className="admin-lab__title">
            <FlaskConical size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Engine <span className="text-orange">Test Lab</span>
          </h1>
          <p className="admin-lab__subtitle">
            All characteristics exposed for prompt engine development & testing
          </p>
          <div className="generate-page__credits-bar">
            <Zap size={16} />
            <span>
              {state.plan === 'unlimited' ? 'Unlimited credits' : `${state.credits} credits remaining`}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="admin-lab__grid">
          <div className="admin-lab__form">
            {/* AI Model Format */}
            {renderChipSection('model', 'AI Model Format', aiModels, 'model')}

            {/* Category */}
            {renderChipSection('category', 'Category', categories, 'category')}

            {/* Subject Details */}
            {renderTextareaSection('subject', 'Subject Details', 'subjectDetails', 'Age, gender, ethnicity, clothing, expression...')}

            {/* Action / Pose */}
            {renderChipSection('action', 'Action / Pose', motionActions, 'action')}

            {/* Environment */}
            {renderTextareaSection('environment', 'Environment', 'environment', 'Location, weather, time of day...')}

            {/* Art Style */}
            {renderChipSection('style', 'Art Style', styles, 'style')}

            {/* Mood */}
            {renderChipSection('mood', 'Mood', moods, 'mood')}

            {/* Lighting */}
            {renderChipSection('lighting', 'Lighting', lightingOptions, 'lighting')}

            {/* Camera Angle */}
            {renderChipSection('camera', 'Camera Angle', cameraAngles, 'camera')}

            {/* Lens / Camera */}
            {renderChipSection('lens', 'Lens / Camera', lensSettings, 'lens')}

            {/* Composition */}
            {renderChipSection('composition', 'Composition', compositions, 'composition')}

            {/* Color Palette */}
            {renderChipSection('color', 'Color Palette', colorPalettes, 'color')}

            {/* Quality / Details */}
            {renderChipSection('quality', 'Quality / Details', qualityTags, 'quality')}

            {/* Rendering Engine */}
            {renderChipSection('rendering', 'Rendering Engine', renderingEngines, 'rendering')}

            {/* Negative Prompt */}
            {renderTextareaSection('negative', 'Negative Prompt', 'negativePrompt', 'What to exclude... (e.g., blurry, low quality)')}

            {/* Model Parameters */}
            <div className={`gen-section ${openSections.params ? 'gen-section--expanded' : ''}`}>
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
                  <input className="input" placeholder="e.g., --ar 16:9 --v 6 --stylize 250" value={form.modelParams} onChange={e => updateForm('modelParams', e.target.value)} />
                </div>
              )}
            </div>

            {/* Description (full width) */}
            <div className="gen-section gen-section--full" style={{ gridColumn: '1 / -1' }}>
              <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem' }}>Test Description</h3>
              <textarea
                ref={descriptionRef}
                className="gen-textarea"
                placeholder="Describe your test scene here..."
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                style={{ minHeight: '120px', fontSize: '1.1rem' }}
              />
            </div>

            {/* Actions */}
            <div className="admin-lab__actions">
              <button className="btn btn-secondary btn-lg gen-random" onClick={handleRandomize} disabled={isGenerating}>
                <div>
                  <div className="flex items-center gap-2 justify-center"><Dices size={20} /> Surprise Me</div>
                  <span className="text-xs opacity-70 block mt-1" style={{ fontSize: '0.75rem', fontWeight: 400 }}>Random Generate</span>
                </div>
              </button>
              <button
                className={`btn btn-primary btn-lg gen-submit ${isGenerating ? 'gen-submit--loading' : ''} ${form.description.length > 5 ? 'gen-submit--glow' : ''}`}
                onClick={result ? handleRegenerate : handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><RefreshCw size={18} className="gen-spin" /> Crafting...</>
                ) : result ? (
                  <><RefreshCw size={18} /> Regenerate</>
                ) : (
                  <><Sparkles size={18} /> Test Generate {state.plan !== 'unlimited' && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(-1 credit)</span>}</>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="admin-lab__output">
            {result ? (
              <PromptOutput result={result} />
            ) : (
              <div className="admin-lab__preview">
                <h3><span className="text-cyan">Test Output Will Appear Here</span></h3>
                <p>Configure all characteristics and hit Test Generate to see the engine output</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
