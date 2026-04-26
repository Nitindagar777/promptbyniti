import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    generateType: 'image', // 'image', 'video', 'text'
    model: '',
    tokens: '5',
    template: '',
    keywords: [],
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 2500);
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
            <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>Go Home</button>
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
          {/* MAIN CONFIG */}
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
                    <button
                      type="button" className={`type-btn ${formData.generateType === 'image' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, generateType: 'image' })}
                    >
                      <Image size={18} /> Image
                    </button>
                    <button
                      type="button" className={`type-btn ${formData.generateType === 'video' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, generateType: 'video' })}
                    >
                      <Video size={18} /> Video
                    </button>
                    <button
                      type="button" className={`type-btn ${formData.generateType === 'text' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, generateType: 'text' })}
                    >
                      <Type size={18} /> Text
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <select
                    className="input" required
                    value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
                  >
                    {filteredModels.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                    <option value="other">Other (Custom Model)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (Tokens)</label>
                  <select
                    className="input"
                    value={formData.tokens} onChange={e => setFormData({ ...formData, tokens: e.target.value })}
                  >
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
                  <input
                    type="text" required className="input"
                    placeholder="Enter the name of the AI model used..."
                    value={formData.customModel || ''}
                    onChange={e => setFormData({ ...formData, customModel: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Prompt Template</label>
                <textarea
                  required className="textarea"
                  style={{ minHeight: '120px', fontFamily: 'monospace' }}
                  placeholder="A portrait of [subject] in [style] with [lighting]..."
                  value={formData.template} onChange={e => setFormData({ ...formData, template: e.target.value })}
                ></textarea>
                <span className="input-hint">
                  <Info size={14} /> Use <strong>[square brackets]</strong> for variables like [subject], [style], etc.
                </span>
              </div>

              <div className="form-group mt-md">
                <label>Keywords (Select at least 4)</label>
                <div className="keywords-grid">
                  {[
                    'Portrait', 'Group', 'Expression', 'Lifestyle', 
                    'AI Influencer', 'Baby', 'Old Age', 'Character', 
                    'Sci-Fi Character', 'Fantasy Character', 'Cyberpunk', 
                    'Nature', 'Architecture', 'Animal', 'Fashion'
                  ].map(kw => (
                    <button
                      key={kw}
                      type="button"
                      className={`keyword-tag ${formData.keywords?.includes(kw) ? 'active' : ''}`}
                      onClick={() => {
                        const current = formData.keywords || [];
                        if (current.includes(kw)) {
                          setFormData({ ...formData, keywords: current.filter(k => k !== kw) });
                        } else {
                          setFormData({ ...formData, keywords: [...current, kw] });
                        }
                      }}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
                {(!formData.keywords || formData.keywords.length < 4) && (
                  <span className="text-xs text-orange mt-2">
                    Please select {4 - (formData.keywords?.length || 0)} more keywords
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="sell-section reveal" style={{ animationDelay: '0.2s' }}>
            <div className="card">
              <h3 className="section-subtitle"><Sparkles size={20} className="text-cyan" /> Proof of Concept (3 Samples)</h3>
              <p className="text-sm text-muted mb-4">You must provide 3 pairs of input prompts and their actual outputs.</p>

              <div className="samples-container">
                {samples.map((sample, index) => (
                  <div key={sample.id} className={`sample-box card ${formData.generateType === 'text' ? 'sample-box--text' : ''}`}>
                    <div className="sample-header">
                      <span className="sample-num">Sample #{index + 1}</span>
                      {formData.generateType !== 'text' && (
                        <span className="sample-output-label">Output {formData.generateType === 'video' ? 'Video' : 'Media'}</span>
                      )}
                    </div>

                    {formData.generateType === 'text' ? (
                      // VERTICAL STACK FOR TEXT
                      <div className="sample-content-text">
                        <div className="form-group">
                          <label>Input Prompt</label>
                          <input 
                            type="text" required className="input input-sm" 
                            placeholder="Specific input used for this sample"
                            value={sample.input} onChange={e => handleInputChange(sample.id, e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Output Response</label>
                          <textarea 
                            required className="textarea textarea-sm" 
                            placeholder="Paste the AI's response here..."
                            value={sample.output || ''} onChange={e => handleTextOutputChange(sample.id, e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    ) : (
                      // SIDE BY SIDE FOR IMAGE/VIDEO (Input Left, Media Right)
                      <>
                        <div className="form-group">
                          <label>Input Prompt</label>
                          <input 
                            type="text" required className="input input-sm" 
                            placeholder="Specific input used for this sample"
                            value={sample.input} onChange={e => handleInputChange(sample.id, e.target.value)}
                          />
                        </div>

                        <div className="sample-media-section">
                          <div className="sample-media-upload">
                            {sample.output ? (
                              <div className="sample-media-preview">
                                {formData.generateType === 'video' ? (
                                  <video src={sample.output} autoPlay muted loop />
                                ) : (
                                  <img src={sample.output} alt={`Sample ${index + 1}`} />
                                )}
                                <button type="button" className="media-remove" onClick={() => handleTextOutputChange(sample.id, null)}>×</button>
                              </div>
                            ) : (
                              <label className="sample-upload-btn">
                                <input 
                                  type="file" hidden accept={formData.generateType === 'video' ? 'video/*' : 'image/*'}
                                  onChange={e => handleMediaChange(sample.id, e)}
                                />
                                <Upload size={20} />
                                <span>Upload</span>
                              </label>
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
          <div className="security-note">
            <ShieldCheck size={18} className="text-green" />
            <span>Verified Listing - 70% Creator Royalty</span>
          </div>
          <button type="submit" className="btn btn-primary btn-xl" disabled={loading} style={{ minWidth: '300px' }}>
            {loading ? 'Submitting Package...' : 'Publish to Store'} <ChevronRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
