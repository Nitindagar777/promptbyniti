import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiModels } from '../data/promptData';
import {
  ShoppingBag, Zap, Image, Video,
  Upload, CheckCircle, AlertCircle, Info,
  Wand2, ShieldCheck, DollarSign, Type,
  Plus, Trash2, ChevronRight, Sparkles
} from 'lucide-react';
import './SellPage.css';

export default function SellPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    generateType: 'image', // 'image', 'video', 'text'
    model: '',
    tokens: '5',
    template: '',
    instructions: '',
    keywords: [],
  });

  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');

  const ALL_KEYWORDS = [
    'Portrait', 'Group', 'Expression', 'Lifestyle', 'AI Influencer', 'Baby', 'Old Age',
    'Character', 'Sci-Fi Character', 'Fantasy Character', 'Horror Character', 'Cosplay',
    'Professional Headshot', 'Selfie', 'Fashion', 'Streetwear', 'Luxury Fashion', 'Beauty',
    'Hairstyle', 'Makeup', 'Outfit Design', 'Product', 'E-commerce', 'Advertisement',
    'Branding', 'Marketing', 'Social Media Post', 'Thumbnail', 'App UI', 'Website UI',
    'Poster', 'Book Cover', 'Movie Poster', 'Landscape', 'Sunset', 'Sunrise', 'Cityscape',
    'Urban', 'Night City', 'Space', 'Nature', 'Forest', 'Tropical', 'Desert', 'Mountains',
    'Ocean', 'Snow', 'Volcano', 'Architecture', 'Interior Design', 'Exterior Design',
    'Building Concept', 'Historical', 'Futuristic Architecture', 'Food', 'Fast Food',
    'Dessert', 'Drinks', 'Coffee Art', 'Fine Dining', 'Tattoo', 'Illustration', 'Digital Art',
    'Painting', 'Line Art', 'Sketch', '3D Render', 'Isometric', 'Abstract', 'Colorful',
    'Geometric', 'Surreal', 'Psychedelic', 'Minimalist', 'Anime', 'Game Art', 'Pixel Art',
    'Cartoon', 'Comic', 'Superhero', 'Fantasy', 'Mythology', 'Vehicles', 'Cars', 'Sports Cars',
    'Spaceships', 'Aircraft', 'Ships', 'Animals', 'Pets', 'Wildlife', 'Creatures',
    'Underwater Life', 'Action', 'Explosion', 'War', 'Medieval', 'Apocalypse', 'Emotions',
    'Sad', 'Love', 'Angry', 'Funny', 'Celebration', 'Education', 'Infographic',
    'Data Visualization', 'Science', 'Medical', 'Music', 'Concert', 'Band', 'Album Cover',
    'Cinematic', 'Film Still', 'Documentary', 'Scene Design', 'Travel', 'Adventure',
    'Camping', 'Exploration', 'Wellness', 'Fitness', 'Mental Health', 'Spa', 'Festival',
    'Christmas', 'Halloween', 'Diwali', 'Futuristic', 'Cyberpunk', 'Metaverse', 'AI Generated World'
  ];

  const [samples, setSamples] = useState([
    { id: 1, input: '', output: null },
    { id: 2, input: '', output: null },
    { id: 3, input: '', output: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Filter models based on generate type
  const filteredModels = aiModels.filter(m => {
    if (formData.generateType === 'image') return m.type === 'image';
    if (formData.generateType === 'video') return m.type === 'video';
    if (formData.generateType === 'text') return m.type === 'chat';
    return true;
  });

  useEffect(() => {
    if (filteredModels.length > 0) {
      setFormData(prev => ({ ...prev, model: filteredModels[0].id }));
    }
  }, [formData.generateType]);

  const handleMediaChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSamples = samples.map(s =>
          s.id === id ? { ...s, output: reader.result } : s
        );
        setSamples(newSamples);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextOutputChange = (id, value) => {
    const newSamples = samples.map(s =>
      s.id === id ? { ...s, output: value } : s
    );
    setSamples(newSamples);
  };

  const handleInputChange = (id, value) => {
    const newSamples = samples.map(s =>
      s.id === id ? { ...s, input: value } : s
    );
    setSamples(newSamples);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        samples: samples.map(s => ({ input: s.input, output: s.output }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8844/api'}/prompts`, {
        method: 'POST',
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

  if (submitted) {
    return (
      <div className="sell-page sell-page--success container">
        <div className="card text-center reveal" style={{ padding: 'var(--space-3xl) var(--space-xl)' }}>
          <div className="success-icon">
            <CheckCircle size={80} color="var(--color-green)" />
          </div>
          <h1 className="h-display" style={{ marginTop: '24px' }}>Submission <span className="text-green">Received!</span></h1>
          <p className="text-secondary" style={{ maxWidth: '600px', margin: '16px auto var(--space-xl)' }}>
            Your prompt package "{formData.name}" is now being reviewed by our quality team. You will be notified once it goes live in the Store.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>List Another</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page container">
      <div className="sell-page__header reveal">
        <h1 className="h-display">Sell Your <span className="text-orange">AI Excellence</span></h1>
        <p className="section-desc">Create a listing with 3 samples to prove your prompt's power and start earning tokens.</p>
      </div>
      <form className="sell-form-v2" onSubmit={handleSubmit}>
        <div className="sell-page__grid">
          <div className="sell-section reveal" style={{ animationDelay: '0.1s' }}>
            <div className="card">
              <h3 className="section-subtitle"><Zap size={20} className="text-orange" /> Basic Information</h3>
              <div className="form-group">
                <label>Prompt Name</label>
                <input
                  type="text" required className="input" placeholder="e.g. Masterpiece Oil Portrait"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  required className="textarea" placeholder="Describe what makes this prompt unique..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Generate Type</label>
                  <div className="type-selector">
                    <button type="button" className={`type-btn ${formData.generateType === 'image' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, generateType: 'image' })}><Image size={18} /> Image</button>
                    <button type="button" className={`type-btn ${formData.generateType === 'video' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, generateType: 'video' })}><Video size={18} /> Video</button>
                    <button type="button" className={`type-btn ${formData.generateType === 'text' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, generateType: 'text' })}><Type size={18} /> Text</button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <select className="input" required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}>
                    {filteredModels.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    <option value="other">Other (Custom Model)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (Tokens)</label>
                  <select className="input" value={formData.tokens} onChange={e => setFormData({ ...formData, tokens: e.target.value })}>
                    <option value="5">5 Tokens</option>
                    <option value="10">10 Tokens</option>
                    <option value="25">25 Tokens</option>
                    <option value="50">50 Tokens</option>
                    <option value="75">75 Tokens</option>
                    <option value="100">100 Tokens</option>
                  </select>
                </div>
              </div>
              {formData.model === 'other' && (
                <div className="form-group reveal">
                  <label>Custom Model Name</label>
                  <input type="text" required className="input" placeholder="Enter the name of the AI model used..." value={formData.customModel || ''} onChange={e => setFormData({ ...formData, customModel: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Prompt Template</label>
                <textarea required className="textarea" style={{ minHeight: '120px', fontFamily: 'monospace' }} placeholder="A portrait of [subject] in [style] with [lighting]..." value={formData.template} onChange={e => setFormData({ ...formData, template: e.target.value })}></textarea>
                <span className="input-hint"><Info size={14} /> Use <strong>[square brackets]</strong> for variables.</span>
              </div>
              <div className="form-group">
                <label>Prompt Instructions</label>
                <textarea required className="textarea" style={{ minHeight: '100px' }} placeholder="e.g. For best results, use aspect ratio 16:9 and set stylize to 250..." value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })}></textarea>
                <span className="input-hint"><Info size={14} /> Tips for the buyer on how to use this prompt.</span>
              </div>
              <div className="form-group mt-md">
                <label>Keywords (Select at least 4)</label>
                <div className="selected-keywords-preview">
                  {formData.keywords?.length > 0 ? (
                    <div className="keywords-grid">
                      {formData.keywords.map(kw => (
                        <span key={kw} className="keyword-tag active">
                          {kw}
                          <button type="button" className="kw-remove" onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== kw) })}>×</button>
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted">No keywords selected yet.</p>}
                  <button type="button" className="btn btn-secondary btn-sm mt-md" onClick={() => setShowKeywordModal(true)}><Plus size={16} /> Add Keywords</button>
                </div>
                {(!formData.keywords || formData.keywords.length < 4) && (
                  <span className="text-xs text-orange mt-2">Please select {Math.max(0, 4 - (formData.keywords?.length || 0))} more keywords</span>
                )}
              </div>
            </div>
          </div>
          <div className="sell-section reveal" style={{ animationDelay: '0.2s' }}>
            <div className="card">
              <h3 className="section-subtitle"><Sparkles size={20} className="text-cyan" /> Proof of Concept (3 Samples)</h3>
              <p className="text-sm text-muted mb-4">Provide 3 input prompts and their actual outputs.</p>
              <div className="samples-container">
                {samples.map((sample, index) => (
                  <div key={sample.id} className={`sample-box card ${formData.generateType === 'text' ? 'sample-box--text' : ''}`}>
                    <div className="sample-header">
                      <span className="sample-num">Sample #{index + 1}</span>
                      {formData.generateType !== 'text' && <span className="sample-output-label">Output {formData.generateType === 'video' ? 'Video' : 'Media'}</span>}
                    </div>
                    {formData.generateType === 'text' ? (
                      <div className="sample-content-text">
                        <div className="form-group"><label>Input Prompt</label><input type="text" required className="input input-sm" placeholder="Input used" value={sample.input} onChange={e => handleInputChange(sample.id, e.target.value)} /></div>
                        <div className="form-group"><label>Output Response</label><textarea required className="textarea textarea-sm" placeholder="AI's response" value={sample.output || ''} onChange={e => handleTextOutputChange(sample.id, e.target.value)}></textarea></div>
                      </div>
                    ) : (
                      <>
                        <div className="form-group"><label>Input Prompt</label><input type="text" required className="input input-sm" placeholder="Input used" value={sample.input} onChange={e => handleInputChange(sample.id, e.target.value)} /></div>
                        <div className="sample-media-section">
                          <div className="sample-media-upload">
                            {sample.output ? (
                              <div className="sample-media-preview">
                                {formData.generateType === 'video' ? <video src={sample.output} autoPlay muted loop /> : <img src={sample.output} alt="Sample" />}
                                <button type="button" className="media-remove" onClick={() => handleTextOutputChange(sample.id, null)}>×</button>
                              </div>
                            ) : (
                              <label className="sample-upload-btn"><input type="file" hidden accept={formData.generateType === 'video' ? 'video/*' : 'image/*'} onChange={e => handleMediaChange(sample.id, e)} /><Upload size={20} /><span>Upload</span></label>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="sell-footer mt-2xl">
          <div className="security-note"><ShieldCheck size={18} className="text-green" /><span>Verified Listing - 70% Creator Royalty</span></div>
          <button type="submit" className="btn btn-primary btn-xl" disabled={loading} style={{ minWidth: '300px' }}>{loading ? 'Submitting...' : 'Publish to Store'} <ChevronRight size={20} /></button>
        </div>
      </form>
      {showKeywordModal && (
        <div className="keyword-modal-overlay" onClick={() => setShowKeywordModal(false)}>
          <div className="keyword-modal card" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><Plus size={24} className="text-cyan" /> Select Keywords</h3><button className="modal-close" onClick={() => setShowKeywordModal(false)}>×</button></div>

            <div className="custom-keyword-row mb-4">
              <input
                type="text"
                className="input input-sm"
                placeholder="Search or add custom keyword..."
                value={customKeyword}
                onChange={e => setCustomKeyword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customKeyword.trim()) {
                      const current = formData.keywords || [];
                      if (!current.includes(customKeyword.trim())) {
                        setFormData({ ...formData, keywords: [...current, customKeyword.trim()] });
                      }
                      setCustomKeyword('');
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (customKeyword.trim()) {
                    const current = formData.keywords || [];
                    if (!current.includes(customKeyword.trim())) {
                      setFormData({ ...formData, keywords: [...current, customKeyword.trim()] });
                    }
                    setCustomKeyword('');
                  }
                }}
              >
                Add
              </button>
            </div>

            <p className="text-muted mb-4">
              {customKeyword ? `Matching keywords (${ALL_KEYWORDS.filter(k => k.toLowerCase().includes(customKeyword.toLowerCase())).length}):` : 'Or select from our categories:'}
            </p>
            <div className="modal-keywords-grid">
              {ALL_KEYWORDS
                .filter(kw => kw.toLowerCase().includes(customKeyword.toLowerCase()))
                .map(kw => (
                  <button key={kw} type="button" className={`keyword-tag ${formData.keywords?.includes(kw) ? 'active' : ''}`} onClick={() => {
                    const current = formData.keywords || [];
                    if (current.includes(kw)) setFormData({ ...formData, keywords: current.filter(k => k !== kw) });
                    else setFormData({ ...formData, keywords: [...current, kw] });
                  }}>{kw}</button>
                ))}
              {customKeyword && ALL_KEYWORDS.filter(k => k.toLowerCase().includes(customKeyword.toLowerCase())).length === 0 && (
                <p className="text-sm text-muted w-full text-center py-4">No matching categories found. Click "Add" to create this as a custom keyword!</p>
              )}
            </div>
            <div className="modal-footer mt-lg">
              <div className="selection-status"><span className={formData.keywords?.length >= 4 ? 'text-green' : 'text-orange'}>{formData.keywords?.length || 0} selected</span>{formData.keywords?.length < 4 && <span className="text-xs ml-2">(Need {4 - formData.keywords.length} more)</span>}</div>
              <button className="btn btn-primary" onClick={() => setShowKeywordModal(false)} disabled={formData.keywords?.length < 4}>Save Selection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
