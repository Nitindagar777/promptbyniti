/* GeneratePage — Public prompt generator (API-focused) */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { randomDescriptions, aiModels, textCategories } from '../data/promptData';
import PromptOutput from '../components/PromptOutput';
import PromptThumbnail from '../components/PromptThumbnail';
import SEOHead from '../components/SEOHead';
import {
  Sparkles, Info, Image as ImageIcon,
  RefreshCw, AlertTriangle,
  Crown, Dices, Zap, Video, Type, Search, Layers,
  Save, ShoppingBag, RotateCcw, Check,
  Lock, Repeat, Camera, LayoutGrid,
  Bot, Code, PenTool, Megaphone, Briefcase, Microscope,
  GraduationCap, Palette, MessageSquare, ShoppingCart, Settings
} from 'lucide-react';
import './GeneratePage.css';

const SESSION_KEY = 'promptgen_session';

const categoryIconMap = {
  'bot': Bot,
  'code': Code,
  'pen-tool': PenTool,
  'megaphone': Megaphone,
  'briefcase': Briefcase,
  'microscope': Microscope,
  'graduation-cap': GraduationCap,
  'zap': Zap,
  'palette': Palette,
  'message-square': MessageSquare,
  'shopping-cart': ShoppingCart,
  'settings': Settings
};

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const isGuest = !state.user;
  const [guestCount, setGuestCount] = useState(() => {
    return parseInt(localStorage.getItem('guestGenerations') || '0', 10);
  });
  const GUEST_LIMIT = 3;
  const [showDemoLimitModal, setShowDemoLimitModal] = useState(false);
  const isFirstFree = state.user && state.user.hasUsedFreePrompt === false;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const descriptionRef = useRef(null);

  // Restore from sessionStorage on mount
  const getInitialState = () => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          form: {
            description: '',
            characterImage: null,
            promptType: 'image',
            model: 'midjourney',
            aspectRatio: '1:1',
            ...(parsed.form || {})
          },
          result: parsed.result || null,
          generatorMode: parsed.generatorMode || 'prompt',
          exampleTemplate: parsed.exampleTemplate || '',
          characterMode: parsed.characterMode || 'fixed',
          activeCategory: parsed.activeCategory || null,
          selectedSubcategory: parsed.selectedSubcategory || null
        };
      }
    } catch { }
    return {
      form: { description: '', characterImage: null, promptType: 'image', model: 'midjourney', aspectRatio: '1:1' },
      result: null,
      generatorMode: 'prompt',
      exampleTemplate: '',
      characterMode: 'fixed',
      activeCategory: null,
      selectedSubcategory: null
    };
  };

  const initialState = getInitialState();
  const [form, setForm] = useState(initialState.form);
  const [result, setResult] = useState(initialState.result);
  const [generatorMode, setGeneratorMode] = useState(initialState.generatorMode);
  const [exampleTemplate, setExampleTemplate] = useState(initialState.exampleTemplate);
  const [characterMode, setCharacterMode] = useState(initialState.characterMode);
  const [hoveredMode, setHoveredMode] = useState(null);
  const [activeCategory, setActiveCategory] = useState(initialState.activeCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialState.selectedSubcategory);

  const [customModel, setCustomModel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(() => sessionStorage.getItem('isGenerating') === 'true');
  const [showPaywall, setShowPaywall] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [aiPower, setAiPower] = useState('normal'); // 'normal', 'super', 'power'

  // Recover state if background generation finished while we were mounted or just navigated back
  useEffect(() => {
    if (isGenerating && sessionStorage.getItem('isGenerating') !== 'true') {
      setIsGenerating(false);
      try {
        const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        if (saved.result) setResult(saved.result);
      } catch (e) {}
    } else if (!result && sessionStorage.getItem('isGenerating') !== 'true') {
      // Just a safety check in case we mounted after it finished
      try {
        const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        if (saved.result) setResult(saved.result);
      } catch (e) {}
    }
  }, [state.prompts, isGenerating]);

  // Filter models by selected prompt type
  const typeMap = { image: 'image', video: 'video', text: 'chat' };
  const filteredModels = aiModels.filter(m => m.type === typeMap[form.promptType]);

  // When prompt type changes, auto-select first model of that type
  const handlePromptTypeChange = (type) => {
    const firstModel = aiModels.find(m => m.type === typeMap[type]);
    setForm(prev => {
      let nextAR = prev.aspectRatio;
      if (type === 'video') {
        if (nextAR !== '9:16' && nextAR !== '16:9') {
          nextAR = '16:9';
        }
      } else if (type === 'image') {
        const validImageRatios = ['16:9', '4:3', '1:1', '3:4', '9:16'];
        if (!validImageRatios.includes(nextAR)) {
          nextAR = '1:1';
        }
      } else {
        nextAR = '';
      }
      return {
        ...prev,
        promptType: type,
        model: firstModel?.id || '',
        aspectRatio: nextAR
      };
    });
    setCustomModel('');
    setShowCustomInput(false);

    // Map characterMode between image and video modes dynamically
    setCharacterMode(prev => {
      if (type === 'video') {
        if (prev === 'sameScene') return 'sameSceneLoop';
        if (prev === 'different') return 'differentScenes';
        if (prev === 'fixed') return 'fixedCharacterMotion';
      } else {
        if (prev === 'sameSceneLoop') return 'sameScene';
        if (prev === 'differentScenes') return 'different';
        if (prev === 'fixedCharacterMotion') return 'fixed';
      }
      return prev;
    });
    setActiveCategory(null);
    setSelectedSubcategory(null);
  };

  // Persist everything to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ 
        form, 
        result, 
        generatorMode, 
        exampleTemplate,
        characterMode,
        activeCategory,
        selectedSubcategory
      }));
    } catch { }
  }, [form, result, generatorMode, exampleTemplate, characterMode, activeCategory, selectedSubcategory]);

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
      const hasDescription = form.description && form.description.trim();
      const hasSelection = !!selectedSubcategory;
      if (!hasDescription && !hasSelection) {
        descriptionRef.current?.focus();
        return;
      }
    } else {
      if (!exampleTemplate || !exampleTemplate.trim()) {
        return;
      }
    }

    // Guest demo mode: check limit before proceeding
    if (isGuest) {
      if (guestCount >= GUEST_LIMIT) {
        setShowDemoLimitModal(true);
        return;
      }
    } else {
      const creditCost = aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1;
      const hasEnoughCredits = state.plan === 'unlimited' || state.credits >= creditCost || (isFirstFree && state.credits >= 0);

      if (!canGenerate || !hasEnoughCredits) {
        setShowPaywall(true);
        return;
      }
    }
    setIsGenerating(true);
    sessionStorage.setItem('isGenerating', 'true');
    setResult(null);
    try {
      // Resolve human-readable model name for the API
      const modelEntry = aiModels.find(m => m.id === form.model);
      const modelLabel = modelEntry ? modelEntry.label : (form.model || 'midjourney');

      const duration = form.promptType === 'video' 
        ? (aiPower === 'power' ? '20s' : aiPower === 'super' ? '10s' : '5s') 
        : undefined;

      const payload = {
        ...form,
        aiPower,
        modelLabel,
        characterMode,
        duration,
        selectedCategory: selectedSubcategory ? selectedSubcategory.category : null,
        selectedSubcategory: selectedSubcategory ? selectedSubcategory.name : null,
        selectedTemplate: selectedSubcategory ? selectedSubcategory.template : null
      };

      if (generatorMode !== 'prompt') {
        payload.mode = 'example';
        payload.description = exampleTemplate;
      }

      const API_BASE = '/api';
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || 'Failed to generate prompt');
      }
      const promptResult = await response.json();
      
      // Force update sessionStorage immediately to survive unmounts
      try {
        const currentSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          ...currentSession,
          result: promptResult
        }));
      } catch (e) {}

      setResult(promptResult);
      if (isGuest) {
        const newCount = guestCount + 1;
        setGuestCount(newCount);
        localStorage.setItem('guestGenerations', String(newCount));
      } else {
        const creditCost = aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1;
        await useCredit(creditCost, null, isFirstFree);
        addPrompt(promptResult);
      }
    } catch (error) {
      console.error('Generation Error:', error);
      alert(error.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
      sessionStorage.removeItem('isGenerating');
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
    setForm({ description: '', characterImage: null, promptType: 'image', model: 'midjourney', aspectRatio: '1:1' });
    setResult(null);
    setExampleTemplate('');
    setCustomModel('');
    setShowCustomInput(false);
    setSaveMessage('');
    setCharacterMode('fixed');
    setActiveCategory(null);
    setSelectedSubcategory(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const renderVisualGuide = () => {
    if (result || isGenerating) return null;
    const activePreviewMode = hoveredMode || characterMode || (form.promptType === 'video' ? 'sameSceneLoop' : 'sameScene');
    return (
      <div className={`ref-mode-preview ref-mode-preview-side-by-side ref-mode-preview--${activePreviewMode}`} style={{ border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div className="ref-mode-preview__badge">
          <span>Reference Mode Visual Guide {form.promptType === 'video' ? '(Video)' : ''}</span>
        </div>
        <h3 className="ref-mode-preview__title">
          {(activePreviewMode === 'sameScene' || activePreviewMode === 'sameSceneLoop') && (form.promptType === 'video' ? "🎥 Same Scene Loop" : "📸 Same Scene / Photoshoot")}
          {(activePreviewMode === 'different' || activePreviewMode === 'differentScenes') && (form.promptType === 'video' ? "🔄 Different Scenes" : "🔄 Different Characters")}
          {(activePreviewMode === 'fixed' || activePreviewMode === 'fixedCharacterMotion') && (form.promptType === 'video' ? "📽️ Fixed Character + Motion" : "🔒 Fixed Character")}
        </h3>
        <p className="ref-mode-preview__desc">
          {activePreviewMode === 'sameScene' && "Keeps every single detail identical across generations, only modifying the subject's poses, camera angles, or expressions."}
          {activePreviewMode === 'sameSceneLoop' && "Keeps the background, character(s), and composition completely identical; only the motion, animation, and timing vary."}
          {activePreviewMode === 'different' && "Keeps the exact same artistic style, composition, and visual medium, while swapping the main character or subject completely."}
          {activePreviewMode === 'differentScenes' && "Maintains character identity and art style across completely different locations, camera angles, and actions."}
          {activePreviewMode === 'fixed' && "Locks the exact identity, clothing, and details of your character, and places them in entirely new environments and locations."}
          {activePreviewMode === 'fixedCharacterMotion' && "Locks the character look and outfit while moving the camera dynamically around them (pan, zoom, orbit)."}
        </p>

        <div className="ref-mode-preview__image-container">
          {/* Always render videos in DOM for preloading/instant show */}
          <div className={`ref-mode-preview__media-group ${form.promptType === 'video' ? 'ref-mode-preview__media-group--visible' : 'ref-mode-preview__media-group--hidden'}`}>
            <video 
              src="/Same_Scene_Video_ref.mp4" 
              className={`ref-mode-preview__img ${activePreviewMode === 'sameSceneLoop' ? 'ref-mode-preview__img--active' : ''}`}
              autoPlay 
              muted 
              loop 
              playsInline
              preload="auto"
            />
            <video 
              src="/Different_Character_Video_ref.mp4" 
              className={`ref-mode-preview__img ${activePreviewMode === 'differentScenes' ? 'ref-mode-preview__img--active' : ''}`}
              autoPlay 
              muted 
              loop 
              playsInline
              preload="auto"
            />
            <video 
              src="/Fixed_Character_Motion_Video_ref.mp4" 
              className={`ref-mode-preview__img ${activePreviewMode === 'fixedCharacterMotion' ? 'ref-mode-preview__img--active' : ''}`}
              autoPlay 
              muted 
              loop 
              playsInline
              preload="auto"
            />
          </div>
          {/* Always render images in DOM for preloading/instant show */}
          <div className={`ref-mode-preview__media-group ${form.promptType !== 'video' ? 'ref-mode-preview__media-group--visible' : 'ref-mode-preview__media-group--hidden'}`}>
            <img 
              src="/same_scene_ref.png" 
              alt="Same Scene" 
              className={`ref-mode-preview__img ${activePreviewMode === 'sameScene' ? 'ref-mode-preview__img--active' : ''}`}
            />
            <img 
              src="/diff_characters_ref.png" 
              alt="Different Characters" 
              className={`ref-mode-preview__img ${activePreviewMode === 'different' ? 'ref-mode-preview__img--active' : ''}`}
            />
            <img 
              src="/fixed_character_ref.png" 
              alt="Fixed Character" 
              className={`ref-mode-preview__img ${activePreviewMode === 'fixed' ? 'ref-mode-preview__img--active' : ''}`}
            />
          </div>
        </div>

        <div className="ref-mode-preview__rules-grid">
          <div className="ref-mode-preview__rules-col ref-mode-preview__rules-col--same">
            <h4>🔒 What Stays SAME</h4>
            <ul>
              {(activePreviewMode === 'sameScene' || activePreviewMode === 'sameSceneLoop') && (
                <>
                  <li><strong>Subject:</strong> Age, hair, face features, identity</li>
                  <li><strong>Outfit:</strong> All clothes, accessories, colors</li>
                  <li><strong>Art Style:</strong> Medium & photography composition</li>
                  <li><strong>Scene:</strong> Background details, scenery elements</li>
                </>
              )}
              {(activePreviewMode === 'different' || activePreviewMode === 'differentScenes') && (
                <>
                  {activePreviewMode === 'differentScenes' ? (
                    <>
                      <li><strong>Identity:</strong> Face, hair style/color, facial features</li>
                      <li><strong>Art Style:</strong> Same cinematic/artistic style, visual style</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Artistic Style:</strong> Geometric, stained-glass line art</li>
                      <li><strong>Composition:</strong> Single-subject centered profile layout</li>
                      <li><strong>Medium:</strong> Stylized digital vector illustration</li>
                    </>
                  )}
                </>
              )}
              {(activePreviewMode === 'fixed' || activePreviewMode === 'fixedCharacterMotion') && (
                <>
                  <li><strong>Identity:</strong> Face, hair color, body structure</li>
                  <li><strong>Exact Outfit:</strong> Teal sporty jacket, helmet, sunglasses</li>
                  {activePreviewMode === 'fixed' ? (
                    <li><strong>Accessories:</strong> Dark pants, black shoes, skateboard</li>
                  ) : (
                    <li><strong>Pose/Stance:</strong> Stays in same relative position</li>
                  )}
                </>
              )}
            </ul>
          </div>
          <div className="ref-mode-preview__rules-col ref-mode-preview__rules-col--changes">
            <h4>⚡ What CHANGES</h4>
            <ul>
              {(activePreviewMode === 'sameScene' || activePreviewMode === 'sameSceneLoop') && (
                <>
                  {activePreviewMode === 'sameSceneLoop' ? (
                    <>
                      <li><strong>Animation:</strong> Motion, gestures, blinking, wind blowing</li>
                      <li><strong>Timing:</strong> Pace, velocity, frame consistency</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Pose:</strong> Stand, sit, look back, hands in pocket</li>
                      <li><strong>Expression:</strong> Smile, serious, looking side, laughing</li>
                      <li><strong>Framing:</strong> Medium shot, full body, camera distance</li>
                    </>
                  )}
                </>
              )}
              {(activePreviewMode === 'different' || activePreviewMode === 'differentScenes') && (
                <>
                  {activePreviewMode === 'differentScenes' ? (
                    <>
                      <li><strong>Location:</strong> Completely different backgrounds/scenery</li>
                      <li><strong>Action:</strong> Running, sitting, talking, different activities</li>
                      <li><strong>Camera:</strong> Lenses, camera angles, panning</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Main Subject:</strong> New animal (Leopard ➔ Fox ➔ Owl)</li>
                      <li><strong>Color Palette:</strong> Adapts per character</li>
                      <li><strong>Background Tone:</strong> Dark backdrop matching the style</li>
                    </>
                  )}
                </>
              )}
              {(activePreviewMode === 'fixed' || activePreviewMode === 'fixedCharacterMotion') && (
                <>
                  {activePreviewMode === 'fixedCharacterMotion' ? (
                    <>
                      <li><strong>Camera:</strong> Orbital rotation, dynamic pan, zoom-in/out</li>
                      <li><strong>Lighting:</strong> Shifts naturally around the moving camera</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Background:</strong> Sunny beach, concrete stairs, city streets</li>
                      <li><strong>Action & Pose:</strong> Crouched cruising, mid-air jump, standing</li>
                      <li><strong>Lighting:</strong> Sunny flare, overcast shadow, urban daylight</li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="generate-page" id="generate-page">
      <SEOHead
        title="Free AI Prompt Generator — Image, Video & Code Prompts"
        description="Free AI prompt generator for consistent text-to-image, image-to-video, and text-to-code prompts. Supports Midjourney cref/sref, Sora motion anchors, Flux, Kling, Luma, Runway Gen-3, AIDA copywriting, React code blueprints & AI agent personas. Generate studio-quality prompts instantly."
        keywords="free AI prompt generator, AI prompt creator, text to image prompt generator, image to video prompt generator, text to code prompt generator, consistent character prompts, midjourney cref generator, midjourney sref generator, sora video prompt builder, flux prompt maker, kling prompt generator, luma dream machine prompts, runway gen-3 prompts, AIDA copywriting prompts, PAS framework prompts, react code prompt generator, python code prompt generator, AI agent persona generator, system prompt builder, prompt engineering tool, free prompt maker, prompt builder online"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'AI Prompt Generator', url: '/generate' }
        ]}
        noIndex={false}
      />
      <div className="container">
        {/* Demo Banner for Guests */}
        {isGuest && (
          <div className="demo-banner">
            <span className="demo-banner__icon">🎁</span>
            <span className="demo-banner__text">
              Free Demo Mode — <strong>{GUEST_LIMIT - guestCount} of {GUEST_LIMIT} free generations remaining</strong>
            </span>
            <a href="/login" className="demo-banner__cta">Create Free Account →</a>
          </div>
        )}
        {/* Header */}
        <div className="generate-page__header">
          <h1 className="generate-page__title">
            Prompt <span className="text-orange">Generator</span>
          </h1>
          <p className="generate-page__subtitle">
            Describe your vision and our AI will craft the perfect prompt for you
          </p>
          {!isGuest && (
            <div className="generate-page__credits-bar">
              <Zap size={16} />
              <span>
                {state.plan === 'unlimited'
                  ? 'Unlimited credits'
                  : `${state.credits} credits remaining`}
              </span>
            </div>
          )}
        </div>

        {/* Generator Form */}
        <div className="generate-page__grid">
          <div className="generate-page__form">

            {/* Clean Page Button (Dynamic Visibility) */}
            {(form.description.trim() || form.characterImage || exampleTemplate.trim() || result) && (
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginBottom: '16px', 
                  gridColumn: '1 / -1',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <button
                  className="btn btn-sm"
                  onClick={handleRefresh}
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: '#ef4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <RotateCcw size={14} />
                  Clean Page
                </button>
              </div>
            )}

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
                    fontWeight: 'bold',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => { setGeneratorMode('prompt'); }}
                >
                  <Sparkles size={18} color={generatorMode === 'prompt' ? '#001a1e' : 'var(--color-cyan)'} />
                  Prompt Generator
                </button>
                <button
                  className={`btn ${generatorMode === 'example' ? '' : 'btn-ghost'}`}
                  style={{
                    flex: 1,
                    borderRadius: '12px',
                    padding: '12px',
                    background: generatorMode === 'example' ? 'var(--color-orange)' : 'transparent',
                    color: generatorMode === 'example' ? '#1e0d00' : 'var(--text-muted)',
                    fontWeight: 'bold',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => { setGeneratorMode('example'); }}
                >
                  <Type size={18} color={generatorMode === 'example' ? '#1e0d00' : 'var(--color-orange)'} />
                  Example Generator
                </button>
              </div>
            </div>

            {generatorMode === 'prompt' ? (
              <>
                {/* 1. Which kind of prompt do you want? */}
                <div className="gen-section gen-section--expanded" id="gen-prompt-type">
                  <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} color="#ff0080" /> Which kind of prompt do you want?
                  </h3>
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


                {/* 2. Upload Image */}
                <div className="gen-section gen-section--expanded" id="gen-consistency">
                  <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem' }}>Upload Image</h3>
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

                {/* Character Mode Toggle — only show when reference image is uploaded and prompt type is not text */}
                {form.characterImage && form.promptType !== 'text' && (
                  <div className="gen-section gen-section--expanded gen-section--full character-mode-section" id="gen-character-mode" style={{ animation: 'fadeInUp 0.4s ease' }}>
                    <h3 className="gen-section__title mb-3" style={{ color: '#a855f7', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Repeat size={20} className="icon-pulse" style={{ color: '#a855f7' }} /> Reference Mode
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      Choose how the AI uses your reference image when generating prompt variations.
                    </p>
                    <div className="character-mode-toggle character-mode-toggle--three">
                      {(form.promptType === 'video' ? [
                        {
                          id: 'sameSceneLoop',
                          styleClass: 'sameScene',
                          icon: <Video size={22} />,
                          label: 'Same Scene Loop',
                          desc: 'Everything identical — only motion & timing changes'
                        },
                        {
                          id: 'differentScenes',
                          styleClass: 'different',
                          icon: <Repeat size={22} />,
                          label: 'Different Scenes',
                          desc: 'Same art style & character, completely different locations/actions'
                        },
                        {
                          id: 'fixedCharacterMotion',
                          styleClass: 'fixed',
                          icon: <Lock size={22} />,
                          label: 'Fixed Character + Motion',
                          desc: 'Same character & outfit, camera moves around them'
                        }
                      ] : [
                        {
                          id: 'sameScene',
                          styleClass: 'sameScene',
                          icon: <Camera size={22} />,
                          label: 'Same Scene',
                          desc: 'Everything identical — only pose & gesture changes'
                        },
                        {
                          id: 'different',
                          styleClass: 'different',
                          icon: <Repeat size={22} />,
                          label: 'Different Characters',
                          desc: 'Same art style & composition, completely different characters'
                        },
                        {
                          id: 'fixed',
                          styleClass: 'fixed',
                          icon: <Lock size={22} />,
                          label: 'Fixed Character',
                          desc: 'Same character & outfit, different locations & backgrounds'
                        }
                      ]).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          className={`character-mode-btn ${characterMode === mode.id ? `character-mode-btn--active character-mode-btn--${mode.styleClass}` : ''}`}
                          onClick={() => setCharacterMode(mode.id)}
                          onMouseEnter={() => setHoveredMode(mode.id)}
                          onMouseLeave={() => setHoveredMode(null)}
                        >
                          <div className={`character-mode-btn__icon-wrap character-mode-btn__icon-wrap--${mode.styleClass}`}>
                            {mode.icon}
                          </div>
                          <div className="character-mode-btn__content">
                            <span className="character-mode-btn__label">{mode.label}</span>
                            <span className="character-mode-btn__desc">{mode.desc}</span>
                          </div>
                          {characterMode === mode.id && (
                            <div className="character-mode-btn__check">
                              <Check size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {renderVisualGuide()}
                  </div>
                )}

                {/* 3. Description */}
                <div className={`gen-section gen-section--full ${form.description ? 'gen-section--expanded' : ''}`} id="gen-description">
                  <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem' }}>Your Description</h3>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      ref={descriptionRef}
                      className="gen-textarea"
                      placeholder={
                        form.promptType === 'text' 
                          ? "Describe the role, task, or prompt you want to build... (e.g., A customer support agent that handles refund requests, or a Python script that automates backups)"
                          : form.promptType === 'video'
                            ? "Describe your video scene here... (e.g., A drone shot soaring over a volcanic eruption, realistic motion)"
                            : "Describe your image scene here... (e.g., A futuristic cyberpunk city with neon rainy streets, cinematic lighting)"
                      }
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
                </div>

                {/* Aspect Ratio */}
                {form.promptType !== 'text' && (
                  <div className="gen-section gen-section--expanded" id="gen-aspect-ratio" style={{ animation: 'fadeInUp 0.3s ease' }}>
                    <h3 className="gen-section__title mb-4" style={{ color: '#ff0080', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutGrid size={20} color="#ff0080" /> Aspect Ratio
                    </h3>
                    <div className="aspect-ratio-selector">
                      {(form.promptType === 'video' ? ['9:16', '16:9'] : ['16:9', '4:3', '1:1', '3:4', '9:16']).map((ratio) => (
                        <button
                          key={ratio}
                          className={`aspect-ratio-btn ${form.aspectRatio === ratio ? 'active' : ''}`}
                          onClick={() => updateForm('aspectRatio', ratio)}
                          type="button"
                        >
                          <div className={`aspect-ratio-icon ratio-${ratio.replace(':', '-')}`} />
                          <span className="aspect-ratio-label">{ratio}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Select target AI model */}
                <div className="gen-section gen-section--expanded gen-section--full" id="gen-target-model">
                  <h3 className="gen-section__title mb-4" style={{ color: '#a855f7', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} color="#a855f7" /> Select target AI model
                  </h3>
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
              </>
            ) : (
              <>
                <div className="gen-section gen-section--expanded gen-section--full" id="gen-example-mode">
                <h3 className="gen-section__title mb-4" style={{ color: 'var(--color-orange)', fontSize: '1.2rem' }}>Example Prompt Generator</h3>
                <p className="text-sm text-muted mb-4">
                  Enter a prompt template using variables in brackets, and the AI will generate 5 diverse sample variations. <br />
                  <strong>Example:</strong> A [color] [animal] riding a [vehicle] in a [setting].
                </p>
                <br></br>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="gen-textarea"
                    placeholder="Enter your prompt template with variables (e.g. A [size] [subject] in the [location]...)"
                    value={exampleTemplate}
                    onChange={(e) => setExampleTemplate(e.target.value)}
                    style={{ minHeight: '160px', fontSize: '1.1rem', borderColor: 'var(--color-orange)' }}
                  ></textarea>
                </div>
                <br></br>
                {/* Purchased Prompts Library for Example Mode */}
                <div className="mt-6">
                  <h4 className="text-xs uppercase text-muted mb-4 font-bold tracking-widest flex items-center gap-2">
                    <Layers size={14} color="var(--color-orange)" /> Choice from Purchased Prompts
                  </h4>
                  <br></br>
                  <div className="purchased-mini-grid custom-scrollbar" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '12px',
                    maxHeight: '300px', // Perfectly fits ~2 rows (8 cards) before scrolling
                    overflowY: 'auto',
                    padding: '4px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--color-orange) transparent'
                  }}>
                    {state.library && state.library.length > 0 ? (
                      state.library.map((p) => {
                        const promptName = p.name || p.title || 'Untitled';
                        const promptType = p.generateType || p.promptType || p.type || 'image';
                        const promptThumb = p.thumbnail || p.coverImage || p.video || (p.samples?.[0]?.output || p.samples?.[0]);

                        return (
                          <div
                            key={p.id || p._id}
                            className="purchased-mini-card"
                            onClick={() => {
                              const secretPrompt = p.template || p.promptTemplate || p.mainPrompt || '';
                              setExampleTemplate(secretPrompt);
                              
                            }}
                            style={{
                              aspectRatio: '1/1',
                              borderRadius: '12px',
                              background: 'var(--dark-lighter)',
                              border: '1px solid var(--dark-accent)',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-orange)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 146, 60, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--dark-accent)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                            }}
                          >
                            <div style={{ flex: 1, background: '#000', position: 'relative' }}>
                              <PromptThumbnail
                                src={promptThumb}
                                alt={promptName}
                                title={promptName}
                                type={promptType}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div style={{ padding: '6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'rgba(0,0,0,0.8)', textAlign: 'center', fontWeight: '500' }}>
                              {promptName}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-muted text-xs p-4 border border-dashed border-dark-accent rounded-lg text-center col-span-full">
                        You haven't purchased any prompts yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reference Mode Toggle for Example Generator */}
              <div className="gen-section gen-section--expanded gen-section--full character-mode-section" id="gen-character-mode-example" style={{ marginTop: '24px', animation: 'fadeInUp 0.4s ease' }}>
                <h3 className="gen-section__title mb-3" style={{ color: '#a855f7', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Repeat size={20} className="icon-pulse" style={{ color: '#a855f7' }} /> Reference Mode
                </h3>
                <p className="text-sm text-muted mb-4">
                  Choose how the AI handles variables in your template when generating 5 unique variations.
                </p>
                <div className="character-mode-toggle character-mode-toggle--three">
                  {/* Button 1: Same Scene */}
                  <button
                    type="button"
                    className={`character-mode-btn ${characterMode === 'sameScene' ? 'character-mode-btn--active character-mode-btn--sameScene' : ''}`}
                    onClick={() => setCharacterMode('sameScene')}
                    onMouseEnter={() => setHoveredMode('sameScene')}
                    onMouseLeave={() => setHoveredMode(null)}
                  >
                    <div className="character-mode-btn__icon-wrap character-mode-btn__icon-wrap--sameScene">
                      <Camera size={22} />
                    </div>
                    <div className="character-mode-btn__content">
                      <span className="character-mode-btn__label">Same Scene</span>
                      <span className="character-mode-btn__desc">
                        Lock subject, outfit, background, and style variables — only vary pose/action variables
                      </span>
                    </div>
                    {characterMode === 'sameScene' && (
                      <div className="character-mode-btn__check">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                  {/* Button 2: Different Characters */}
                  <button
                    type="button"
                    className={`character-mode-btn ${characterMode === 'different' ? 'character-mode-btn--active character-mode-btn--different' : ''}`}
                    onClick={() => setCharacterMode('different')}
                    onMouseEnter={() => setHoveredMode('different')}
                    onMouseLeave={() => setHoveredMode(null)}
                  >
                    <div className="character-mode-btn__icon-wrap character-mode-btn__icon-wrap--different">
                      <Repeat size={22} />
                    </div>
                    <div className="character-mode-btn__content">
                      <span className="character-mode-btn__label">Different Characters</span>
                      <span className="character-mode-btn__desc">
                        Vary all variables (subjects, outfits, backgrounds) completely per sample
                      </span>
                    </div>
                    {characterMode === 'different' && (
                      <div className="character-mode-btn__check">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                  {/* Button 3: Fixed Character */}
                  <button
                    type="button"
                    className={`character-mode-btn ${characterMode === 'fixed' ? 'character-mode-btn--active character-mode-btn--fixed' : ''}`}
                    onClick={() => setCharacterMode('fixed')}
                    onMouseEnter={() => setHoveredMode('fixed')}
                    onMouseLeave={() => setHoveredMode(null)}
                  >
                    <div className="character-mode-btn__icon-wrap character-mode-btn__icon-wrap--fixed">
                      <Lock size={22} />
                    </div>
                    <div className="character-mode-btn__content">
                      <span className="character-mode-btn__label">Fixed Character</span>
                      <span className="character-mode-btn__desc">
                        Lock subject and outfit variables — vary backgrounds, poses, and locations per sample
                      </span>
                    </div>
                    {characterMode === 'fixed' && (
                      <div className="character-mode-btn__check">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                </div>
                {renderVisualGuide()}
              </div>
            </>)}

            {/* Power of AI Selection */}
            {!result && (
              <div className="gen-section gen-section--expanded gen-section--full" style={{ marginBottom: '24px', animation: 'fadeIn 0.4s ease' }}>
                {form.promptType === 'video' ? (
                  <>
                    <h3 className="gen-section__title mb-3" style={{ color: '#06b6d4', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={20} className="icon-pulse text-cyan" /> Power of AI (Duration)
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      Select the video duration. Longer duration requires more credit computational power.
                    </p>
                    <br></br>
                    <div className="power-selector-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                      {/* Top Row: 5s and 10s */}
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
                        {[
                          { id: 'normal', label: '5s', credits: 1, color: 'var(--color-green)', desc: '1 credit' },
                          { id: 'super', label: '10s', credits: 3, color: 'var(--color-cyan)', desc: '3 credits', locked: isGuest }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={p.locked}
                            title={p.locked ? 'Sign up to unlock' : undefined}
                            onClick={() => !p.locked && setAiPower(p.id)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '16px',
                              background: aiPower === p.id ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.02)',
                              border: aiPower === p.id ? `2px solid ${p.color}` : '2px solid var(--border-color)',
                              color: aiPower === p.id ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: aiPower === p.id ? `0 8px 24px rgba(0, 0, 0, 0.3)` : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              width: 'calc(50% - 8px)',
                              minWidth: '140px'
                            }}
                            className="power-btn"
                          >
                            <span style={{ 
                              fontSize: '1.05rem', 
                              fontFamily: 'var(--font-display)', 
                              color: aiPower === p.id ? 'white' : 'var(--text-secondary)',
                              transition: 'color 0.3s'
                            }}>
                              Duration — {p.label}
                            </span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              opacity: 0.7, 
                              textAlign: 'center', 
                              fontWeight: 'normal',
                              fontFamily: 'var(--font-body)'
                            }}>
                              {p.desc}
                            </span>
                            {aiPower === p.id && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 24px 24px 0',
                                borderColor: `transparent ${p.color} transparent transparent`
                              }} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Bottom Row: 20s centered */}
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {[
                          { id: 'power', label: '20s', credits: 5, color: 'var(--color-purple)', desc: '5 credits', locked: isGuest }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={p.locked}
                            title={p.locked ? 'Sign up to unlock' : undefined}
                            onClick={() => !p.locked && setAiPower(p.id)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '16px',
                              background: aiPower === p.id ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.02)',
                              border: aiPower === p.id ? `2px solid ${p.color}` : '2px solid var(--border-color)',
                              color: aiPower === p.id ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: aiPower === p.id ? `0 8px 24px rgba(0, 0, 0, 0.3)` : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              width: 'calc(50% - 8px)',
                              minWidth: '140px',
                              margin: '0 auto'
                            }}
                            className="power-btn"
                          >
                            <span style={{ 
                              fontSize: '1.05rem', 
                              fontFamily: 'var(--font-display)', 
                              color: aiPower === p.id ? 'white' : 'var(--text-secondary)',
                              transition: 'color 0.3s'
                            }}>
                              Duration — {p.label}
                            </span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              opacity: 0.7, 
                              textAlign: 'center', 
                              fontWeight: 'normal',
                              fontFamily: 'var(--font-body)'
                            }}>
                              {p.desc}
                            </span>
                            {aiPower === p.id && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 24px 24px 0',
                                borderColor: `transparent ${p.color} transparent transparent`
                              }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="gen-section__title mb-3" style={{ color: '#06b6d4', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={20} className="icon-pulse text-cyan" /> Power of AI
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      Select the computational strength and creativity depth of the AI generation.
                    </p>
                    <br></br>
                    <div className="power-selector-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                      {/* Top Row: Normal and Super */}
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
                        {[
                          { id: 'normal', label: 'Normal', credits: 1, color: 'var(--color-green)', desc: 'Standard quality' },
                          { id: 'super', label: 'Super', credits: 3, color: 'var(--color-cyan)', desc: 'Enhanced details', locked: isGuest }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={p.locked}
                            title={p.locked ? 'Sign up to unlock' : undefined}
                            onClick={() => !p.locked && setAiPower(p.id)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '16px',
                              background: aiPower === p.id ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.02)',
                              border: aiPower === p.id ? `2px solid ${p.color}` : '2px solid var(--border-color)',
                              color: aiPower === p.id ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: aiPower === p.id ? `0 8px 24px rgba(0, 0, 0, 0.3)` : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              width: 'calc(50% - 8px)',
                              minWidth: '140px'
                            }}
                            className="power-btn"
                          >
                            <span style={{ 
                              fontSize: '1.05rem', 
                              fontFamily: 'var(--font-display)', 
                              color: aiPower === p.id ? 'white' : 'var(--text-secondary)',
                              transition: 'color 0.3s'
                            }}>
                              {p.credits} Credit{p.credits > 1 ? 's' : ''} — {p.label}
                            </span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              opacity: 0.7, 
                              textAlign: 'center', 
                              fontWeight: 'normal',
                              fontFamily: 'var(--font-body)'
                            }}>
                              {p.desc}
                            </span>
                            {aiPower === p.id && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 24px 24px 0',
                                borderColor: `transparent ${p.color} transparent transparent`
                              }} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Bottom Row: Power centered */}
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {[
                          { id: 'power', label: 'Power', credits: 5, color: 'var(--color-purple)', desc: 'Maximum precision', locked: isGuest }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={p.locked}
                            title={p.locked ? 'Sign up to unlock' : undefined}
                            onClick={() => !p.locked && setAiPower(p.id)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '16px',
                              background: aiPower === p.id ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.02)',
                              border: aiPower === p.id ? `2px solid ${p.color}` : '2px solid var(--border-color)',
                              color: aiPower === p.id ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: aiPower === p.id ? `0 8px 24px rgba(0, 0, 0, 0.3)` : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              width: 'calc(50% - 8px)',
                              minWidth: '140px',
                              margin: '0 auto'
                            }}
                            className="power-btn"
                          >
                            <span style={{ 
                              fontSize: '1.05rem', 
                              fontFamily: 'var(--font-display)', 
                              color: aiPower === p.id ? 'white' : 'var(--text-secondary)',
                              transition: 'color 0.3s'
                            }}>
                              {p.credits} Credit{p.credits > 1 ? 's' : ''} — {p.label}
                            </span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              opacity: 0.7, 
                              textAlign: 'center', 
                              fontWeight: 'normal',
                              fontFamily: 'var(--font-body)'
                            }}>
                              {p.desc}
                            </span>
                            {aiPower === p.id && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 24px 24px 0',
                                borderColor: `transparent ${p.color} transparent transparent`
                              }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons — change based on state */}
            <div className="gen-actions">
              {result ? (
                /* ── Post-generation buttons ── */
                <>
                  {generatorMode !== 'example' && !isGuest && (
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
                    </>
                  )}
 
                  <button
                    className="btn btn-lg gen-action-btn gen-action-btn--refresh"
                    onClick={handleRefresh}
                    id="gen-refresh-btn"
                  >
                    <RotateCcw size={18} />
                    <span>{generatorMode === 'example' ? 'Clear' : 'New Prompt'}</span>
                  </button>
 
                  {generatorMode === 'example' && (
                    <button
                      className="btn btn-lg gen-action-btn gen-action-btn--save"
                      style={{ background: 'var(--color-orange)', border: 'none' }}
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      <Sparkles size={18} />
                      <span>Generate More 5</span>
                    </button>
                  )}
                </>
              ) : (
                /* ── Pre-generation buttons ── */
                <>
                  {generatorMode === 'prompt' && (
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
                  )}
 
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
                        {isGuest ? (
                          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {' '}(Demo)
                          </span>
                        ) : state.plan !== 'unlimited' && (
                          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {isFirstFree ? ' (Free)' : ` (-${aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1} credit${(aiPower === 'power' || aiPower === 'super') ? 's' : ''})`}
                          </span>
                        )}
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
              <PromptOutput result={result} mode={generatorMode} />
            ) : form.promptType === 'text' && generatorMode === 'prompt' && !isGenerating ? (
              /* ── Text Prompt Categories Browser ── */
              <div className="text-cat-panel">
                <div className="text-cat-panel__header">
                  <h3 className="text-cat-panel__title">
                    <Type size={20} /> Text Prompt <span style={{ color: '#a855f7' }}>Categories</span>
                  </h3>
                  <p className="text-cat-panel__subtitle">Choose any working type of prompt you want, choose it</p>
                </div>
                <div className="text-cat-panel__list custom-scrollbar">
                  {!activeCategory ? (
                    <div className="text-cat-grid">
                      {Object.entries(textCategories).map(([catName, catData]) => {
                        const hasSelection = selectedSubcategory && selectedSubcategory.category === catName;
                        return (
                          <div
                            key={catName}
                            className={`text-cat-card ${hasSelection ? 'text-cat-card--selected' : ''}`}
                            style={{ '--cat-color': catData.color }}
                            onClick={() => setActiveCategory(catName)}
                          >
                            <span className="text-cat-card__name">
                              {catName}
                              {hasSelection && <span className="text-cat-card__select-dot" />}
                            </span>
                            <div className="text-cat-card__meta-below">
                              <div className="text-cat-card__icon-wrap">
                                {(() => {
                                  const IconComponent = categoryIconMap[catData.icon];
                                  return IconComponent ? <IconComponent size={14} /> : null;
                                })()}
                              </div>
                              <span className="text-cat-card__count">
                                {hasSelection ? 'Selected' : `${catData.items.length} Prompts`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    (() => {
                      const activeCatData = textCategories[activeCategory];
                      if (!activeCatData) return null;
                      return (
                        <div className="text-cat-detail-view" style={{ '--cat-color': activeCatData.color }}>
                          <div className="text-cat-detail-header-row">
                            {!selectedSubcategory && (
                              <button
                                type="button"
                                className="text-cat-back-btn"
                                onClick={() => setActiveCategory(null)}
                              >
                                <span className="text-cat-back-btn__text">← Back to Categories</span>
                                <span className="text-cat-back-btn__arrow">←</span>
                              </button>
                            )}
                            <div className="text-cat-detail-header">
                              <span className="text-cat-detail-icon">
                                {(() => {
                                  const IconComponent = categoryIconMap[activeCatData.icon];
                                  return IconComponent ? <IconComponent size={20} /> : null;
                                })()}
                              </span>
                              <h4 className="text-cat-detail-title">{activeCategory}</h4>
                            </div>
                          </div>
                          <div className="text-cat-item-list">
                            {activeCatData.items
                              .filter((item) => {
                                const isSelectionActiveInThisCat = selectedSubcategory && selectedSubcategory.category === activeCategory;
                                if (isSelectionActiveInThisCat) {
                                  return selectedSubcategory.name === item.name;
                                }
                                return true;
                              })
                              .map((item) => {
                                const isSelected = selectedSubcategory && 
                                                   selectedSubcategory.category === activeCategory && 
                                                   selectedSubcategory.name === item.name;
                                if (isSelected) {
                                  return (
                                    <div key={item.name} className="text-cat-selected-container">
                                      <span className="text-cat-selected-label">Selected:</span>
                                      <div className="text-cat-selected-wrapper">
                                        <button
                                          type="button"
                                          className="text-cat-item text-cat-item--selected"
                                          onClick={() => setSelectedSubcategory(null)}
                                        >
                                          <span className="text-cat-item__dot" />
                                          <span className="text-cat-item__name">{item.name}</span>
                                        </button>
                                        <button
                                          type="button"
                                          className="text-cat-item-clear-btn"
                                          onClick={() => setSelectedSubcategory(null)}
                                          title="Clear selection"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <button
                                    key={item.name}
                                    type="button"
                                    className="text-cat-item"
                                    onClick={() => {
                                      setSelectedSubcategory({
                                        category: activeCategory,
                                        name: item.name,
                                        template: item.template
                                      });
                                    }}
                                  >
                                    <span className="text-cat-item__dot" />
                                    <span className="text-cat-item__name">{item.name}</span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ) : (
              <div className="generate-page__preview">
                {generatorMode === 'prompt' ? (
                  <>
                    <h3>
                      <span className="text-cyan">Your Prompt Will Appear Here</span>
                    </h3>
                    <p>Describe your vision and hit Generate to create a professional AI prompt</p>
                  </>
                ) : (
                  <>
                    <h3>
                      <span className="text-orange">Your 5 Sample Variations Will Appear Here</span>
                    </h3>
                    <p>Enter your prompt template with variables and hit Generate to create 5 unique examples</p>
                  </>
                )}
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

      {/* Demo Limit Modal */}
      {showDemoLimitModal && (
        <div className="demo-limit-overlay" onClick={() => setShowDemoLimitModal(false)}>
          <div className="demo-limit-modal" onClick={e => e.stopPropagation()}>
            <div className="demo-limit-modal__icon">🚀</div>
            <h2>You've Used All Free Demos!</h2>
            <p>Create a free account to continue generating prompts. You'll get your first generation free plus access to all features.</p>
            <div className="demo-limit-modal__benefits">
              <div>✅ First prompt generation free</div>
              <div>✅ Save prompts to your library</div>
              <div>✅ Sell prompts & earn 80%</div>
              <div>✅ Access all AI models</div>
            </div>
            <a href="/login" className="btn btn--primary demo-limit-modal__cta">Create Free Account</a>
            <button onClick={() => setShowDemoLimitModal(false)} className="demo-limit-modal__close">Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}
