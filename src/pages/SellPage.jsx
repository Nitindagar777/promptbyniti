import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Upload, CheckCircle, Info, Sparkles, ArrowLeft, ShieldCheck, Trash2, X, Image as ImageIcon, Ban, BookOpen, Loader2
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './SellPage.css';

const AI_MODEL_OPTIONS = [
  { id: 'gemini-image', name: 'Google Gemini / Imagen 3' },
  { id: 'midjourney-v6', name: 'Midjourney v6' },
  { id: 'flux-1', name: 'Flux.1 Schnell / Dev' },
  { id: 'sora', name: 'Sora Video' },
  { id: 'kling', name: 'Kling AI' },
  { id: 'runway-gen3', name: 'Runway Gen-3 Alpha' },
  { id: 'dall-e-3', name: 'DALL-E 3' },
  { id: 'gpt-4o', name: 'ChatGPT / GPT-4o' },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' }
];

export default function SellPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
  const isAdmin = state?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() || state?.user?.role === 'admin' || state?.user?.isAdmin;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/templates', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [instructions, setInstructions] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video' | 'text'
  const [selectedModel, setSelectedModel] = useState('flux-1');
  const [priceTokens, setPriceTokens] = useState(4);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // 4 Samples State: [{ input: '', output: '' }, ...]
  const [samples, setSamples] = useState([
    { input: '', output: '' },
    { input: '', output: '' },
    { input: '', output: '' },
    { input: '', output: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [generatingIdx, setGeneratingIdx] = useState(null); // idx of sample generating or 'all'
  const [cfModelName, setCfModelName] = useState('FLUX.1 Schnell (Cloudflare Workers AI)');

  // Pre-fill from generator state if navigated from /generate
  useEffect(() => {
    if (location.state?.promptData) {
      const data = location.state.promptData;
      if (data.name || data.title) setName(data.name || data.title);
      if (data.description) setDescription(data.description);
      if (data.template || data.promptTemplate) setPrompt(data.template || data.promptTemplate);
      if (data.negativePrompt) setNegativePrompt(data.negativePrompt);
      if (data.instructions) setInstructions(data.instructions);
      if (data.keywords && Array.isArray(data.keywords)) setTags(data.keywords);
      setPriceTokens(data.priceTokens && Number(data.priceTokens) > 1 ? Number(data.priceTokens) : 4);
      if (data.generateType || data.promptType) setMediaType(data.generateType || data.promptType);
      setSelectedModel(data.model && data.model !== 'gemini-image' ? data.model : 'flux-1');

      if (data.samples && Array.isArray(data.samples)) {
        const loaded = data.samples.slice(0, 4).map((s, idx) => ({
          input: typeof s === 'object' ? (s.input || s.prompt || '') : (typeof s === 'string' ? s : ''),
          output: typeof s === 'object' ? (s.output || s.url || '') : ''
        }));
        while (loaded.length < 4) {
          loaded.push({ input: '', output: '' });
        }
        setSamples(loaded);
      } else if (data.mainPrompt) {
        setSamples([
          { input: data.mainPrompt, output: '' },
          { input: '', output: '' },
          { input: '', output: '' },
          { input: '', output: '' }
        ]);
      }
    }
  }, [location.state]);

  const autoPublishTriggeredRef = useRef(false);

  // Auto-Pipeline for Admin: Auto-Generate 4 FLUX Images & Auto-Post Prompt
  useEffect(() => {
    if (location.state?.autoPublishPack && location.state?.promptData) {
      if (autoPublishTriggeredRef.current) return;
      autoPublishTriggeredRef.current = true;

      const data = location.state.promptData;
      if (data.samples && Array.isArray(data.samples) && data.samples.length > 0) {
        const sampleInputs = data.samples.slice(0, 4).map(s =>
          typeof s === 'object' ? (s.input || s.prompt || '') : (typeof s === 'string' ? s : '')
        );
        const mainText = data.mainPrompt || data.template || data.prompt || data.name || '';
        while (sampleInputs.length < 4) {
          const sampleNum = sampleInputs.length + 1;
          sampleInputs.push(`${mainText}, variation ${sampleNum}, ultra-detailed render --ar 1:1`);
        }

        if (sampleInputs.some(p => p && p.trim())) {
          console.log('🚀 [Admin Auto-Pipeline] Starting auto Cloudflare 4-image generation & auto-post...');
          autoGenerateAndPublish(sampleInputs, data);
        }
      }
    }
  }, [location.state]);

  const autoGenerateAndPublish = async (sampleInputs, promptData) => {
    try {
      setLoading(true);
      setGeneratingIdx('all');

      // 1. Call Cloudflare Workers AI for 4 images
      const imgRes = await fetch('/api/generate/batch-ai-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({
          prompts: sampleInputs,
          model: '@cf/black-forest-labs/flux-1-schnell'
        })
      });

      const imgData = await imgRes.json().catch(() => ({}));
      let finalImages = ['', '', '', ''];
      if (imgData.success && Array.isArray(imgData.images)) {
        finalImages = imgData.images;
      }

      // Fallback single retries for any missing images in batch
      for (let i = 0; i < 4; i++) {
        if (!finalImages[i] || !finalImages[i].trim()) {
          console.warn(`⚠️ Batch image #${i + 1} empty, retrying single image generation...`);
          try {
            const singleRes = await fetch('/api/generate/ai-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
              },
              body: JSON.stringify({
                prompt: sampleInputs[i] || promptData.mainPrompt || name,
                model: '@cf/black-forest-labs/flux-1-schnell'
              })
            });
            const singleData = await singleRes.json().catch(() => ({}));
            if (singleData.success && singleData.imageUrl) {
              finalImages[i] = singleData.imageUrl;
              console.log(`✅ Recovered image #${i + 1} via single failover call!`);
            }
          } catch (err) {
            console.error(`Failed single recovery for image #${i + 1}:`, err);
          }
        }
      }

      // If all 11 Cloudflare accounts failed or limit reached, auto turn OFF button
      if (finalImages.every(img => !img || !img.trim())) {
        console.error('🛑 All Cloudflare image accounts exhausted or limit reached!');
        localStorage.setItem('promptbyniti_autopilot_loop', 'false');
        alert('🛑 Auto-Pilot Turned OFF: All 11 Cloudflare accounts have reached their daily image limits!');
        setLoading(false);
        setGeneratingIdx(null);
        return;
      }

      const updatedSamples = sampleInputs.map((inputStr, i) => ({
        input: inputStr,
        output: finalImages[i] || ''
      }));
      setSamples(updatedSamples);

      // 2. Auto-Publish to MongoDB Store
      const templateContent = promptData.template || promptData.promptTemplate || promptData.prompt || prompt || name;
      const payload = {
        name: promptData.name || promptData.title || name,
        description: promptData.description || description,
        template: templateContent,
        prompt: templateContent,
        negativePrompt: promptData.negativePrompt || negativePrompt || '',
        instructions: promptData.instructions || instructions || '',
        generateType: promptData.generateType || promptData.promptType || mediaType || 'image',
        model: promptData.model || selectedModel || 'flux-1',
        priceTokens: 4,
        tags: promptData.keywords || tags || [],
        samples: updatedSamples,
        thumbnail: finalImages[0] || (updatedSamples.find(s => s.output)?.output || '')
      };

      console.log('🚀 [Admin Auto-Pipeline] Auto-publishing prompt to store...', payload.name);

      const token = localStorage.getItem('promptbyniti_token');
      const publishRes = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const pubData = await publishRes.json();
      if (publishRes.ok) {
        console.log('✅ [Admin Auto-Pipeline] Prompt pack published successfully!');
        const isAutoPilotActive = localStorage.getItem('promptbyniti_autopilot_loop') === 'true';
        setTimeout(() => {
          if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
            console.log('🤖 [Auto-Pilot] Published successfully! Auto-returning to /generate to continue infinite loop...');
            navigate('/generate', { state: { clearAndLoop: true, loopTime: Date.now() } });
          } else {
            navigate('/templates');
          }
        }, 1200);
      } else {
        console.error('❌ Auto-publish failed:', pubData.message);
        const isAutoPilotActive = localStorage.getItem('promptbyniti_autopilot_loop') === 'true';
        if (isAutoPilotActive) {
          setTimeout(() => {
            if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
              navigate('/generate', { state: { clearAndLoop: true, loopTime: Date.now() } });
            }
          }, 3000);
        } else {
          alert(pubData.message || 'Auto-publish failed. Please review fields and click Post Prompt.');
        }
      }
    } catch (err) {
      console.error('❌ Error in auto-generate & publish pipeline:', err);
      const isAutoPilotActive = localStorage.getItem('promptbyniti_autopilot_loop') === 'true';
      if (isAutoPilotActive) {
        setTimeout(() => {
          if (localStorage.getItem('promptbyniti_autopilot_loop') === 'true') {
            navigate('/generate', { state: { clearAndLoop: true, loopTime: Date.now() } });
          }
        }, 3000);
      }
    } finally {
      setLoading(false);
      setGeneratingIdx(null);
    }
  };

  // Pre-fill edit data if edit query param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('edit');
    if (id) {
      setIsEditMode(true);
      setEditId(id);
      setLoading(true);
      fetch(`/api/prompts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.prompt) {
            const p = data.prompt;
            setName(p.name || '');
            setDescription(p.description || '');
            setPrompt(p.template || '');
            setNegativePrompt(p.negativePrompt || '');
            setInstructions(p.instructions || '');
            setTags(p.keywords || []);
            setMediaType(p.generateType || 'image');
            setSelectedModel(p.model || 'midjourney-v6');
            setPriceTokens(p.priceTokens || p.tokens || 5);

            if (p.samples && Array.isArray(p.samples)) {
              const loadedSamples = p.samples.slice(0, 4).map(s => ({
                input: typeof s === 'object' ? (s.input || s.prompt || '') : '',
                output: typeof s === 'object' ? (s.output || s.url || s.image || '') : (typeof s === 'string' ? s : '')
              }));
              while (loadedSamples.length < 4) {
                loadedSamples.push({ input: '', output: '' });
              }
              setSamples(loadedSamples);
            }
          }
        })
        .catch(err => console.error("Error loading prompt for edit:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  // Tag Handlers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanVal = tagInput.trim().replace(/,/g, '');
      if (cleanVal && !tags.includes(cleanVal)) {
        setTags([...tags, cleanVal]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Sample Handlers
  const updateSampleInput = (idx, text) => {
    setSamples(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], input: text };
      return copy;
    });
  };

  const updateSampleOutput = (idx, outputUrl) => {
    setSamples(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], output: outputUrl };
      return copy;
    });
  };

  const handleSampleFileUpload = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSampleOutput(idx, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Cloudflare Workers AI Single Sample Image Generator
  const handleGenerateSingleCloudflareImage = async (idx) => {
    const sampleInput = samples[idx]?.input;
    if (!sampleInput || !sampleInput.trim()) {
      alert(`Please enter the input prompt text for Sample #${idx + 1} first!`);
      return;
    }

    try {
      setGeneratingIdx(idx);
      const res = await fetch('/api/generate/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({
          prompt: sampleInput.trim(),
          model: '@cf/black-forest-labs/flux-1-schnell'
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        updateSampleOutput(idx, data.imageUrl);
        if (data.modelName) setCfModelName(data.modelName);
      } else {
        alert(data.message || 'Failed to generate image via Cloudflare AI');
      }
    } catch (err) {
      console.error('Single image gen error:', err);
      alert('Network error while generating image with Cloudflare AI.');
    } finally {
      setGeneratingIdx(null);
    }
  };

  // Cloudflare Workers AI Batch (All 4) Image Generator
  const handleGenerateAllCloudflareImages = async () => {
    const validPrompts = samples.map(s => s.input);
    const hasAnyInput = validPrompts.some(p => p && p.trim());
    if (!hasAnyInput) {
      alert('Please enter sample input prompt texts first before generating images!');
      return;
    }

    try {
      setGeneratingIdx('all');
      const res = await fetch('/api/generate/batch-ai-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify({
          prompts: validPrompts,
          model: '@cf/black-forest-labs/flux-1-schnell'
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setSamples(prev => prev.map((s, idx) => ({
          ...s,
          output: data.images[idx] || s.output
        })));
        if (data.modelName) setCfModelName(data.modelName);
      } else {
        alert(data.message || 'Failed to batch generate images via Cloudflare AI');
      }
    } catch (err) {
      console.error('Batch image gen error:', err);
      alert('Network error while batch generating images with Cloudflare AI.');
    } finally {
      setGeneratingIdx(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasAtLeastOneImage = samples.some(s => s.output && s.output.trim() !== '');
    if (!hasAtLeastOneImage) {
      alert("Please upload at least 1 sample output image (Sample 1).");
      return;
    }

    setLoading(true);

    const mainCover = samples.find(s => s.output)?.output || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

    try {
      const payload = {
        name,
        description,
        generateType: mediaType,
        model: selectedModel,
        priceTokens: Number(priceTokens) || 5,
        template: prompt,
        negativePrompt,
        instructions,
        thumbnail: mainCover,
        samples: samples.map(s => ({
          input: s.input || prompt,
          output: s.output || mainCover
        })),
        keywords: tags
      };

      const url = isEditMode ? `/api/prompts/${editId}` : `/api/prompts`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('promptbyniti_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        alert(data.message || 'Failed to submit prompt');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleListAnother = () => {
    setName('');
    setDescription('');
    setPrompt('');
    setNegativePrompt('');
    setInstructions('');
    setTags([]);
    setPriceTokens(5);
    setSamples([
      { input: '', output: '' },
      { input: '', output: '' },
      { input: '', output: '' },
      { input: '', output: '' }
    ]);
    setSubmitted(false);
    setIsEditMode(false);
    setEditId(null);
    navigate('/sell');
  };

  if (!isAdmin) {
    return null;
  }

  if (submitted) {
    return (
      <div className="sell-page sell-page--success container">
        <div className="card text-center reveal" style={{ padding: 'var(--space-3xl) var(--space-xl)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          <div className="success-icon" style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
            <CheckCircle size={64} color="var(--color-green)" />
          </div>
          <h1 className="h-display" style={{ marginTop: '10px' }}>Post <span className="text-green">Live in Store!</span></h1>
          <p className="text-secondary" style={{ maxWidth: '600px', margin: '16px auto var(--space-xl)' }}>
            Your prompt post "{name}" is now live in the Store with 4 sample outputs, negative prompt & usage instructions!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/templates')}>View Store</button>
            <button className="btn btn-secondary" onClick={handleListAnother}>Post Another</button>
            <button className="btn btn-blue" onClick={() => navigate('/')}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page container">
      <SEOHead
        title="Create New Post — Prompt by Niti"
        description="Publish prompt templates with 4 sample input prompts, output images, negative prompts, and usage instructions to the Store."
      />
      
      <div className="sell-page__header">
        {isEditMode && (
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', left: '0', top: '5px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1 className="h-display">{isEditMode ? 'Edit Your' : 'Post to'} <span className="text-orange">the Store</span></h1>
        <p className="section-desc">
          Enter your secret prompt template, negative prompt, instructions, add 4 sample input prompts & images, and publish to the store.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Sparkles className="spin text-cyan mb-4 mx-auto" size={40} />
          <p className="text-muted">Loading post details...</p>
        </div>
      )}

      {!loading && (
        <form className="sell-form-v2" onSubmit={handleSubmit} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Post Details Card */}
          <div className="card form-card-glass">
            <h3 className="section-subtitle"><Sparkles size={20} className="text-cyan" /> Post Details</h3>
            
            <div className="form-group">
              <label>Post Title / Prompt Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Dreamy Cyberpunk Street Portrait"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                className="textarea"
                placeholder="Describe what this prompt generates and what style it specializes in..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>The Master Prompt Template (Locked Secret)</label>
              <textarea
                required
                className="textarea"
                style={{ minHeight: '110px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                placeholder="e.g. A neon-lit cyberpunk street corner in Neo-Tokyo, shot on 35mm lens, atmospheric fog, [subject details] standing under [light type]..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              ></textarea>
              <span className="input-hint"><Info size={14} /> This secret prompt template is unlocked upon token purchase.</span>
            </div>

            {/* Negative Prompt & Usage Instructions */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ban size={16} className="text-rose-400" />
                <span>Negative Prompt (Optional)</span>
              </label>
              <textarea
                className="textarea"
                style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                placeholder="e.g. blurry, low quality, distorted anatomy, extra limbs, text, watermark..."
                value={negativePrompt}
                onChange={e => setNegativePrompt(e.target.value)}
              ></textarea>
              <span className="input-hint"><Info size={14} /> Specify terms or visual elements that should be excluded when generating.</span>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} className="text-cyan" />
                <span>Usage Instructions / Notes</span>
              </label>
              <textarea
                className="textarea"
                style={{ minHeight: '90px', fontSize: '0.85rem' }}
                placeholder="e.g. 1. Replace bracketed variables with your desired subject. 2. Set aspect ratio to --ar 16:9 for landscape portraits. 3. Recommended stylize value --s 250."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              ></textarea>
              <span className="input-hint"><Info size={14} /> Step-by-step guidance for buyers on how to get the best results with this prompt.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Category / Output Type</label>
                <select className="input" value={mediaType} onChange={e => setMediaType(e.target.value)}>
                  <option value="image">Image Prompt</option>
                  <option value="video">Video Prompt</option>
                  <option value="text">Text / Code Blueprint</option>
                </select>
              </div>

              <div className="form-group">
                <label>AI Model</label>
                <select className="input" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  {AI_MODEL_OPTIONS.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Token Price (⚡)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={priceTokens}
                  onChange={e => setPriceTokens(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Tags / Keywords (Press Enter or Comma)</label>
              <div className="tags-input-container">
                <div className="tags-chips-list">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="tag-chip">
                      #{tag}
                      <button type="button" className="tag-chip-remove" onClick={() => removeTag(idx)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder={tags.length === 0 ? "Type tag and press Enter..." : "Add more tags..."}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>

          {/* Section 2: 4 Sample Input Prompts & 4 Sample Images Card */}
          <div className="card form-card-glass">
            <h3 className="section-subtitle">
              <ImageIcon size={20} className="text-orange" /> 4 Sample Inputs & Output Images
            </h3>
            <p className="text-sm text-muted mb-4">
              Provide 4 sample input prompts and their output images. Sample 1 will be used as the primary cover photo for the prompt store.
            </p>

            {/* Cloudflare Workers AI Generator Control Banner */}
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.92rem', color: '#38bdf8' }}>
                  <Sparkles size={16} /> Cloudflare Workers AI Generator Engine
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Engine Model: <strong style={{ color: '#ffffff' }}>FLUX.1 Schnell</strong> (<span style={{ fontFamily: 'monospace', color: '#f97316' }}>@cf/black-forest-labs/flux-1-schnell</span>)
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateAllCloudflareImages}
                disabled={generatingIdx !== null}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ec4899)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: generatingIdx !== null ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)'
                }}
              >
                {generatingIdx === 'all' ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Generating 4 Images with FLUX...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>⚡ Auto-Generate All 4 Images</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {samples.map((s, idx) => (
                <div key={idx} className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: idx === 0 ? 'var(--color-orange)' : 'var(--text-primary)' }}>
                      Sample #{idx + 1} {idx === 0 ? '(Main Cover)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGenerateSingleCloudflareImage(idx)}
                      disabled={generatingIdx !== null}
                      style={{
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.35)',
                        color: '#f97316',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        cursor: generatingIdx !== null ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Generate image from this sample input using Cloudflare FLUX.1 Schnell"
                    >
                      {generatingIdx === idx ? (
                        <>
                          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>⚡ Generate Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Image Drop / Preview Box */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sample Output Image/Media</label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIdx(idx);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOverIdx(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverIdx(null);
                        const files = Array.from(e.dataTransfer.files || []);
                        if (files.length > 0) {
                          files.forEach((file, fIdx) => {
                            const targetSlot = idx + fIdx;
                            if (targetSlot < 4) {
                              handleSampleFileUpload(targetSlot, file);
                            }
                          });
                        }
                      }}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '160px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: dragOverIdx === idx ? '2px dashed #f97316' : '1px dashed rgba(255,255,255,0.15)',
                        background: dragOverIdx === idx ? 'rgba(249, 115, 22, 0.15)' : '#050505',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {s.output ? (
                        <>
                          <img src={s.output} alt={`Sample ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => updateSampleOutput(idx, '')}
                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
                            title="Remove Image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <label style={{ cursor: 'pointer', textAlign: 'center', padding: '12px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <input
                            type="file"
                            hidden
                            accept="image/*,video/*"
                            onChange={(e) => handleSampleFileUpload(idx, e.target.files[0])}
                          />
                          <Upload size={24} className="text-cyan" />
                          <span style={{ fontSize: '0.8rem', color: dragOverIdx === idx ? '#f97316' : 'var(--text-secondary)' }}>
                            {dragOverIdx === idx ? 'Drop Image Here' : `Drag & Drop or Click to Upload Sample #${idx + 1}`}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Sample Input Prompt Text */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sample Input Prompt Text</label>
                    <textarea
                      className="textarea"
                      style={{ minHeight: '70px', fontSize: '0.82rem' }}
                      placeholder={`e.g. Input details used for sample #${idx + 1}...`}
                      value={s.input}
                      onChange={(e) => updateSampleInput(idx, e.target.value)}
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="publish-actions-container">
            <button
              type="submit"
              className="btn btn-primary btn-xl w-full"
              disabled={loading || !name || !description || !prompt}
              style={{ padding: '16px 32px', fontSize: '1.1rem', width: '100%' }}
            >
              <ShieldCheck size={20} style={{ marginRight: '8px' }} />
              {loading ? 'Publishing Post...' : (isEditMode ? 'Save & Update Post' : 'Publish Post to Store')}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
