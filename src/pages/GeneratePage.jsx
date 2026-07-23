/* GeneratePage — Public prompt generator (API-focused) */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { randomDescriptions, aiModels, textCategories, generateRandomSurprise } from '../data/promptData';
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

function CustomSelect({ value, onChange, options, icon: Icon, iconColor, title, isRefMode, result, isGenerating, isRefModeClass, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`console-select-wrapper ${isRefModeClass ? 'ref-mode-select-wrapper' : ''} ${disabled ? 'disabled' : ''}`} ref={containerRef} title={title}>
      {Icon && <Icon size={14} className="console-select-icon" style={{ color: disabled ? 'var(--text-muted)' : iconColor }} />}
      <button
        type="button"
        className={`console-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
      >
        <span>{selectedOption?.label}</span>
      </button>

      {isOpen && (
        <div className="console-select-dropdown-menu">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`console-select-dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                disabled={opt.disabled}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {isRefMode && !result && !isGenerating && (
        <div className="ref-mode-pointer-arrow">
          <svg width="200" height="220" viewBox="0 0 200 220" fill="none">
            <path
              d="M160,0 Q60,110 40,210"
              stroke="var(--color-pink)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="none"
              className="ref-arrow-path"
            />
            <path
              d="M33,202 L40,213 L47,202 Z"
              stroke="var(--color-pink)"
              strokeWidth="2.5"
              fill="var(--color-pink)"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ref-arrow-head"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  const { state, canGenerate, useCredit, addPrompt, isPremium } = useApp();
  const isGuest = !state.user;
  const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
  const isAdmin = state?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() || state?.user?.role === 'admin' || state?.user?.isAdmin;
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
            model: 'gemini-image',
            aspectRatio: '1:1',
            ...(parsed.form || {})
          },
          result: parsed.result || null,
          generatorMode: parsed.generatorMode || 'prompt',
          exampleTemplate: parsed.exampleTemplate || '',
          characterMode: parsed.characterMode || 'sameScene',
          activeCategory: parsed.activeCategory || null,
          selectedSubcategory: parsed.selectedSubcategory || null
        };
      }
    } catch { }
    return {
      form: { description: '', characterImage: null, promptType: 'image', model: 'gemini-image', aspectRatio: '1:1' },
      result: null,
      generatorMode: 'prompt',
      exampleTemplate: '',
      characterMode: 'sameScene',
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
  const [isPackGenerating, setIsPackGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [aiPower, setAiPower] = useState('normal'); // 'normal', 'super', 'power'
  const [isAutoPilot, setIsAutoPilot] = useState(() => localStorage.getItem('promptbyniti_autopilot_loop') === 'true');
  const autoLoopTimerRef = useRef(null);

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

  /* Handle incoming state from Home Page or Auto-Pilot return loop */
  useEffect(() => {
    if (location.state) {
      if (location.state.clearAndLoop) {
        if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
          if (autoLoopTimerRef.current) clearTimeout(autoLoopTimerRef.current);
          autoLoopTimerRef.current = setTimeout(() => {
            triggerAutoPilotStep();
          }, 600);
        }
      } else if (location.state.isRandom) {
        handleRandomize(location.state.initialInput);
      } else if (location.state.initialInput) {
        setForm(prev => ({ ...prev, description: location.state.initialInput }));
      }
    }
  }, [location.state]);

  const toggleAutoPilot = () => {
    const nextVal = !isAutoPilot;
    setIsAutoPilot(nextVal);
    localStorage.setItem('promptbyniti_autopilot_loop', nextVal ? 'true' : 'false');
    if (autoLoopTimerRef.current) {
      clearTimeout(autoLoopTimerRef.current);
    }
    if (nextVal) {
      triggerAutoPilotStep();
    }
  };

  const triggerAutoPilotStep = () => {
    if (localStorage.getItem('promptbyniti_autopilot_loop') !== 'true') return;

    // 1. Clean Page / Reset state
    setForm({ description: '', characterImage: null, promptType: 'image', model: 'gemini-image', aspectRatio: '1:1' });
    setResult(null);
    setExampleTemplate('');
    setCustomModel('');
    setShowCustomInput(false);
    setSaveMessage('');
    setCharacterMode('sameScene');
    setActiveCategory(null);
    setSelectedSubcategory(null);
    sessionStorage.removeItem(SESSION_KEY);

    // 2. Click "Surprise Me" (random prompt)
    const randomPrompt = generateRandomSurprise();
    setForm(prev => ({ ...prev, description: randomPrompt }));

    // 3. Click Generate Button automatically
    if (autoLoopTimerRef.current) clearTimeout(autoLoopTimerRef.current);
    autoLoopTimerRef.current = setTimeout(() => {
      if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
        handleGenerate(true, randomPrompt);
      }
    }, 500);
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async (forcePack = false, overrideDesc = null) => {
    // For Admin user ONLY: directly generate the complete pack! For regular users: forcePack or direct prompt
    const isPack = isAdmin ? true : (forcePack === true);
    const descToUse = overrideDesc !== null ? overrideDesc : form.description;

    if (generatorMode === 'prompt') {
      const hasDescription = descToUse && descToUse.trim();
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

    // Redirect to login if user is guest
    if (isGuest) {
      navigate('/login');
      return;
    }

    const fullCost = aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1;
    const requiredCredits = isPack ? Math.max(0, fullCost - 1) : 1;
    const hasEnoughCredits = state.plan === 'unlimited' || state.credits >= requiredCredits;

    if (!canGenerate || !hasEnoughCredits) {
      setShowPaywall(true);
      return;
    }
    setIsGenerating(true);
    if (isPack) {
      setIsPackGenerating(true);
    }
    sessionStorage.setItem('isGenerating', 'true');
    if (!isPack) {
      setResult(null);
    }
    try {
      // Resolve human-readable model name for the API
      const modelEntry = aiModels.find(m => m.id === form.model);
      const modelLabel = modelEntry ? modelEntry.label : (form.model || 'midjourney');

      const duration = form.promptType === 'video' 
        ? (aiPower === 'power' ? '20s' : aiPower === 'super' ? '10s' : '5s') 
        : undefined;

      const payload = {
        ...form,
        description: descToUse,
        aiPower,
        modelLabel,
        characterMode,
        duration,
        selectedCategory: selectedSubcategory ? selectedSubcategory.category : null,
        selectedSubcategory: selectedSubcategory ? selectedSubcategory.name : null,
        selectedTemplate: selectedSubcategory ? selectedSubcategory.template : null,
        generatePack: isPack
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

      // Credit deduction:
      const finalCost = isPack ? Math.max(0, fullCost - 1) : 1;
      await useCredit(finalCost);
      addPrompt(promptResult);

      // Auto-open post page for Admin or Auto-Pilot IMMEDIATELY with pre-filled generated prompt data and auto-publish pipeline
      const isAutoPilotActive = localStorage.getItem('promptbyniti_autopilot_loop') === 'true';
      const userEmail = state?.user?.email || localStorage.getItem('promptbyniti_user_email') || '';
      const isUserAdmin = isAdmin || isAutoPilotActive || userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

      if (isUserAdmin) {
        setIsGenerating(false);
        setIsPackGenerating(false);
        sessionStorage.removeItem('isGenerating');
        navigate('/sell', { state: { promptData: promptResult, autoPublishPack: true } });
        return;
      }

      // Smoothly scroll down to the generated prompt output for non-admin users
      setTimeout(() => {
        const outputElement = document.getElementById('prompt-output');
        if (outputElement) {
          outputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (error) {
      console.error('Generation Error:', error);
      const isAutoPilotActive = localStorage.getItem('promptbyniti_autopilot_loop') === 'true';
      if (isAutoPilotActive) {
        console.warn('🤖 [Auto-Pilot] Retrying prompt generation silently in 2s...');
        setTimeout(() => {
          if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
            handleRandomize();
            setTimeout(() => handleGenerate(), 500);
          }
        }, 2000);
      } else {
        console.warn('Generation Notice:', error.message);
      }
    } finally {
      setIsGenerating(false);
      setIsPackGenerating(false);
      sessionStorage.removeItem('isGenerating');
    }
  };

  const handleRandomize = (initialDesc = null) => {
    const selectedIdea = typeof initialDesc === 'string'
      ? initialDesc
      : generateRandomSurprise();
    setForm(prev => ({ ...prev, description: selectedIdea }));
    return selectedIdea;
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
    setForm({ description: '', characterImage: null, promptType: 'image', model: 'gemini-image', aspectRatio: '1:1' });
    setResult(null);
    setExampleTemplate('');
    setCustomModel('');
    setShowCustomInput(false);
    setSaveMessage('');
    setCharacterMode('sameScene');
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

  const referenceModeOptions = form.promptType === 'video' ? [
    { value: 'sameSceneLoop', label: 'Same Scene Loop' },
    { value: 'differentScenes', label: 'Different Scenes' },
    { value: 'fixedCharacterMotion', label: 'Fixed Character + Motion' }
  ] : [
    { value: 'sameScene', label: 'Same Scene' },
    { value: 'different', label: 'Different Characters' },
    { value: 'fixed', label: 'Fixed Character' }
  ];

  const aspectRatioOptions = form.promptType === 'video' ? [
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '16:9', label: '16:9 (Landscape)' }
  ] : [
    { value: '16:9', label: '16:9 (Landscape)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '3:4', label: '3:4 (Portrait)' },
    { value: '9:16', label: '9:16 (Story)' }
  ];

  const modelOptions = [
    ...filteredModels.map(m => ({ value: m.id, label: m.label })),
    { value: 'custom', label: 'Other Model...' }
  ];

  const aiPowerOptions = form.promptType === 'video' ? [
    { value: 'normal', label: '5s (1 Credit)' },
    { value: 'super', label: '10s (3 Credits)', disabled: isGuest },
    { value: 'power', label: '20s (5 Credits)', disabled: isGuest }
  ] : [
    { value: 'normal', label: 'Normal (1 Credit)' },
    { value: 'super', label: 'Super (3 Credits)', disabled: isGuest },
    { value: 'power', label: 'Power (5 Credits)', disabled: isGuest }
  ];

  const categoryOptions = [
    { value: '', label: 'Choose Category' },
    ...Object.keys(textCategories).map(catName => ({
      value: catName,
      label: catName
    }))
  ];

  const subcategoryOptions = [
    { value: '', label: 'Choose Subcategory' },
    ...(activeCategory && textCategories[activeCategory]
      ? textCategories[activeCategory].items.map(item => ({
          value: item.name,
          label: item.name
        }))
      : [])
  ];

  const activeCatData = textCategories[activeCategory];
  const activeCatIcon = activeCatData ? categoryIconMap[activeCatData.icon] : Layers;
  const activeCatColor = activeCatData ? activeCatData.color : 'var(--text-secondary)';

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

        {/* Centered Console Layout */}
        <div className="generate-page__console-container">
          
          {/* Main Prompt Console Card */}
          <div className="prompt-console-card">
            {/* TOP ROW: Mode Toggle + Prompt Type Tabs */}
            <div className="console-top-row">
              {/* Mode switch (Prompt vs Example) */}
              <div className="console-mode-toggle">
                <button
                  type="button"
                  className={`console-mode-btn ${generatorMode === 'prompt' ? 'active active-prompt' : ''}`}
                  onClick={() => setGeneratorMode('prompt')}
                >
                  <Sparkles size={14} />
                  <span>Prompt Mode</span>
                </button>
                <button
                  type="button"
                  className={`console-mode-btn ${generatorMode === 'example' ? 'active active-example' : ''}`}
                  onClick={() => setGeneratorMode('example')}
                >
                  <Type size={14} />
                  <span>Example Mode</span>
                </button>
              </div>

              {/* Prompt Type selector (Image, Video, Text) - only in Prompt mode */}
              {generatorMode === 'prompt' && (
                <div className="console-type-selector">
                  {[
                    { id: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                    { id: 'video', label: 'Video', icon: <Video size={14} /> },
                    { id: 'text', label: 'Text', icon: <Type size={14} /> }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`console-type-btn ${form.promptType === t.id ? 'active' : ''}`}
                      onClick={() => handlePromptTypeChange(t.id)}
                      title={`${t.label} Prompt`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MAIN TEXT AREA BLOCK */}
            <div className="console-input-area">
              {generatorMode === 'prompt' ? (
                <textarea
                  ref={descriptionRef}
                  className="console-textarea"
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
                  id="gen-main-description"
                />
              ) : (
                <textarea
                  className="console-textarea"
                  placeholder="Enter your prompt template with variables (e.g. A [size] [subject] in the [location]...)"
                  value={exampleTemplate}
                  onChange={(e) => setExampleTemplate(e.target.value)}
                  id="gen-example-template"
                />
              )}

              {/* Character image preview thumbnail (if uploaded) */}
              {form.characterImage && form.promptType !== 'text' && (
                <div className="console-image-preview">
                  <img src={form.characterImage} alt="Reference Preview" />
                  <button
                    type="button"
                    className="console-image-clear"
                    onClick={() => updateForm('characterImage', null)}
                    title="Remove reference image"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Text Counter */}
              {generatorMode === 'prompt' && (
                <div className="console-char-counter">
                  {form.description.length}/450
                </div>
              )}
            </div>

            {/* BOTTOM CONTROLS TOOLBAR */}
            <div className="console-toolbar">
              {/* Upload Image Button (Not for Text mode) */}
              {form.promptType !== 'text' && (
                <label className="console-tool-btn upload-btn" title="Upload Reference Image" style={{ cursor: 'pointer' }}>
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
                  <Camera size={14} style={{ color: '#f43f5e' }} />
                  <span>Upload Image</span>
                </label>
              )}

              {/* Reference Mode Dropdown (Small & visible if image uploaded, or generally show it with alert if no image uploaded) */}
              {form.promptType !== 'text' && (
                <CustomSelect
                  value={characterMode}
                  onChange={(val) => setCharacterMode(val)}
                  options={referenceModeOptions}
                  icon={Repeat}
                  iconColor="#a855f7"
                  title="Reference Mode Consistency"
                  isRefMode={generatorMode === 'prompt'}
                  result={result}
                  isGenerating={isGenerating}
                  isRefModeClass={true}
                />
              )}

              {/* Aspect Ratio Dropdown (Not for Text mode) */}
              {form.promptType !== 'text' && (
                <CustomSelect
                  value={form.aspectRatio}
                  onChange={(val) => updateForm('aspectRatio', val)}
                  options={aspectRatioOptions}
                  icon={LayoutGrid}
                  iconColor="#06b6d4"
                  title="Aspect Ratio"
                />
              )}

              {/* Category Dropdown (Only for Text mode in Prompt mode) */}
              {form.promptType === 'text' && generatorMode === 'prompt' && (
                <CustomSelect
                  value={activeCategory || ''}
                  onChange={(val) => {
                    setActiveCategory(val || null);
                    setSelectedSubcategory(null);
                  }}
                  options={categoryOptions}
                  icon={activeCatIcon}
                  iconColor={activeCatColor}
                  title="Prompt Category"
                />
              )}

              {/* Subcategory Dropdown (Only for Text mode in Prompt mode) */}
              {form.promptType === 'text' && generatorMode === 'prompt' && (
                <CustomSelect
                  value={selectedSubcategory?.name || ''}
                  onChange={(val) => {
                    if (!val) {
                      setSelectedSubcategory(null);
                    } else {
                      const item = textCategories[activeCategory]?.items.find(i => i.name === val);
                      if (item) {
                        setSelectedSubcategory({
                          category: activeCategory,
                          name: item.name,
                          template: item.template
                        });
                      }
                    }
                  }}
                  options={subcategoryOptions}
                  icon={Type}
                  iconColor="#a855f7"
                  title="Prompt Subcategory"
                  disabled={!activeCategory}
                />
              )}

              {/* Target AI Model Dropdown */}
              <CustomSelect
                value={showCustomInput ? 'custom' : form.model}
                onChange={(val) => {
                  if (val === 'custom') {
                    setShowCustomInput(true);
                    updateForm('model', customModel || '');
                  } else {
                    setShowCustomInput(false);
                    updateForm('model', val);
                  }
                }}
                options={modelOptions}
                icon={Bot}
                iconColor="#10b981"
                title="Target AI Model"
              />

              {/* AI Power Dropdown */}
              <CustomSelect
                value={aiPower}
                onChange={(val) => {
                  if (isGuest && val !== 'normal') {
                    setShowPaywall(true);
                    return;
                  }
                  setAiPower(val);
                }}
                options={aiPowerOptions}
                icon={Zap}
                iconColor="#eab308"
                title="Power of AI Strength"
              />

              {/* Toolbar Right Actions (Surprise Me, Reset) */}
              <div className="console-toolbar-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Surprise Me Button (Only for Prompt mode and NOT for Text mode) */}
                {generatorMode === 'prompt' && form.promptType !== 'text' && (
                  <button
                    type="button"
                    className="console-icon-btn"
                    onClick={() => handleRandomize()}
                    disabled={isGenerating}
                    title="Surprise Me (Random Prompt)"
                  >
                    <Dices size={15} style={{ color: '#f97316' }} />
                  </button>
                )}

                {/* Clean Page / Refresh Button */}
                {(form.description.trim() || form.characterImage || exampleTemplate.trim() || result) && (
                  <button
                    type="button"
                    className="console-icon-btn console-icon-btn--danger"
                    onClick={handleRefresh}
                    title="Clean Page (Reset All)"
                  >
                    <RotateCcw size={15} style={{ color: '#ef4444' }} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Custom Model Input (shown under Console Card if custom model chosen) */}
          {showCustomInput && (
            <div className="console-custom-model-box animate-fade-in-up">
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
            </div>
          )}

          {/* Generate / Action Buttons Row */}
          <div className="console-action-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button
                type="button"
                className={`autopilot-toggle-btn ${isAutoPilot ? 'autopilot-active' : ''}`}
                onClick={toggleAutoPilot}
                title={isAutoPilot ? "Click to Turn OFF Continuous Auto Loop" : "Click to Turn ON Continuous Auto Loop"}
                id="gen-autopilot-btn"
              >
                <span className={`autopilot-dot ${isAutoPilot ? 'dot-active' : ''}`}></span>
                <span className="autopilot-text">
                  Auto Loop: <strong style={{ color: isAutoPilot ? '#22c55e' : '#ef4444', textTransform: 'uppercase', marginLeft: '4px' }}>{isAutoPilot ? 'ON' : 'OFF'}</strong>
                </span>
              </button>
            )}
            {result ? (
              <div className="console-post-actions">
                {generatorMode !== 'example' && !isGuest && (
                  <button
                    className="btn btn-lg console-post-btn console-post-btn--save"
                    onClick={handleSavePrompt}
                    id="gen-save-btn"
                  >
                    {saveMessage ? <Check size={18} /> : <Save size={18} />}
                    <span>{saveMessage || 'Save Prompt'}</span>
                  </button>
                )}

                {generatorMode !== 'example' ? (
                  <>
                    <button
                      className="btn btn-lg console-post-btn console-post-btn--refresh"
                      onClick={() => setResult(null)}
                      id="gen-new-prompt-btn"
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    >
                      <RotateCcw size={18} style={{ color: 'var(--color-cyan)' }} />
                      <span>New Prompt</span>
                    </button>

                    <button
                      className="btn btn-lg console-post-btn console-post-btn--danger"
                      onClick={handleRefresh}
                      id="gen-clear-btn"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444' }}
                    >
                      <RotateCcw size={18} style={{ color: '#ef4444' }} />
                      <span>Clear Page</span>
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-lg console-post-btn console-post-btn--refresh"
                    onClick={handleRefresh}
                    id="gen-refresh-btn"
                  >
                    <RotateCcw size={18} />
                    <span>Clear</span>
                  </button>
                )}

                {generatorMode === 'example' && (
                  <button
                    className="btn btn-lg console-post-btn console-post-btn--save"
                    style={{ background: 'var(--color-orange)', border: 'none', color: '#fff' }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Sparkles size={18} />
                    <span>Generate More 5</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                className={`btn btn-primary btn-lg console-submit-btn ${isGenerating ? 'loading' : ''} ${form.description.length > 5 ? 'glow' : ''}`}
                onClick={handleGenerate}
                disabled={isGenerating}
                id="gen-submit-btn"
              >
                {isGenerating ? (
                  <><RefreshCw size={18} className="gen-spin" /> Crafting...</>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate {isAdmin ? 'Complete Pack' : (generatorMode === 'example' ? 'Examples' : 'Prompt')}</span>
                    {state.plan !== 'unlimited' && (
                      <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '8px' }}>
                        {` (-${aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1} credit${(aiPower === 'power' || aiPower === 'super') ? 's' : ''})`}
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Unlocked Prompts Library for Example Mode */}
          {generatorMode === 'example' && !result && (
            <div className="console-library-section animate-fade-in-up">
              <h4 className="text-xs uppercase text-muted mb-4 font-bold tracking-widest flex items-center gap-2">
                <Layers size={14} color="var(--color-orange)" /> Choice from Unlocked Prompts
              </h4>
              <div className="purchased-mini-grid custom-scrollbar">
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
                  <div className="text-muted text-xs p-4 border border-dashed border-dark-accent rounded-lg text-center col-span-full" style={{ width: '100%' }}>
                    You haven't unlocked any prompts yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reference Mode Visual Guide */}
          {form.promptType !== 'text' && !result && !isGenerating && (
            <div className="console-visual-guide-wrap animate-fade-in-up">
              {renderVisualGuide()}
            </div>
          )}

          {/* Output / Preview panel (takes complete page width below the console) */}
          {(result || isGenerating) && (
            <div className="generate-page__output">
              {result ? (
                <>
                  <PromptOutput result={result} mode={generatorMode} />
                  {!result.promptTemplate && generatorMode === 'prompt' && (
                    <div className="generate-pack-upgrade-wrap animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-orange), var(--color-pink))',
                          border: 'none',
                          color: '#000000',
                          padding: '12px 28px',
                          borderRadius: '30px',
                          fontWeight: '800',
                          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                        onClick={() => handleGenerate(true)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <RefreshCw size={16} className="gen-spin" style={{ color: '#000000' }} />
                        ) : (
                          <Sparkles size={16} style={{ color: '#000000' }} />
                        )}
                        <span style={{ color: '#000000' }}>
                          {isGenerating ? "Generating Pack..." : "Want a Complete Pack? Generate Complete Pack"}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="generate-page__preview animate-pulse">
                  <RefreshCw size={24} className="gen-spin text-cyan mb-2" style={{ margin: '0 auto' }} />
                  <h3>
                    <span className="text-cyan">
                      {isPackGenerating ? "Crafting Your Complete Prompt Pack..." : "Crafting Your AI Prompt..."}
                    </span>
                  </h3>
                  <p>Our AI is analyzing your inputs and generating consistent metadata, instructions, and samples.</p>
                </div>
              )}
            </div>
          )}

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
