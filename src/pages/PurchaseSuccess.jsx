import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle, Copy, ArrowLeft, Star, Clock, 
  Lock, Unlock, RefreshCw, Zap, Download, Maximize2
} from 'lucide-react';
import './PurchaseSuccess.css';

const PurchaseSuccess = () => {
  const { id } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 
    (window.location.hostname.includes('oopsverse.cloud') 
      ? 'https://oopsverse.cloud/api' 
      : 'http://localhost:8845/api');

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      const res = await fetch(`${API_BASE}/prompts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrompt(data.prompt);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="success-loading">
      <div className="loader-premium"></div>
      <p>Unlocking your premium content...</p>
    </div>
  );

  if (!prompt) return (
    <div className="success-error">
      <h2>Oops! Content not found.</h2>
      <button onClick={() => navigate('/buyer-dashboard')} className="btn-back">
        <ArrowLeft /> Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="purchase-success-page">
      <div className="container-small">
        <div className="success-header animate-fade-in">
          <div className="check-icon-wrapper">
            <CheckCircle className="check-icon" />
          </div>
          <h1>Purchase Successful!</h1>
          <p>This prompt is now permanently saved to your library.</p>
        </div>

        <div className="unlocked-card card premium-card animate-slide-up">
          <div className="card-top-row">
            <div className="badge-unlocked">
              <Unlock size={14} /> FULL ACCESS UNLOCKED
            </div>
            <div className="prompt-meta-info">
              <span><Zap size={14} /> {prompt.priceTokens || prompt.tokens || 5} Tokens</span>
              <span><Star size={14} /> {prompt.model}</span>
              <span><Clock size={14} /> {new Date(prompt.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="unlocked-content">
            <div className="prompt-header-info">
              <img src={prompt.thumbnail || prompt.image} alt={prompt.name} className="success-thumb" />
              <div className="header-text">
                <h2>{prompt.name}</h2>
                <p className="success-desc">{prompt.description}</p>
                <div className="seller-badge">
                  <span>Seller:</span> <strong>{prompt.seller?.name || 'Anonymous'}</strong>
                </div>
              </div>
            </div>

            <div className="secret-section">
              <div className="section-title">
                <h3><Lock size={18} /> The Secret Prompt</h3>
                <button 
                  className={`btn-copy-small ${copied ? 'copied' : ''}`}
                  onClick={() => handleCopy(prompt.template)}
                >
                  {copied ? 'Copied!' : <><Copy size={16} /> Copy Prompt</>}
                </button>
              </div>
              <div className="prompt-box-reveal">
                {prompt.template}
              </div>
            </div>

            {prompt.instructions && (
              <div className="secret-section">
                <div className="section-title">
                  <h3><Zap size={18} /> Instructions & Usage</h3>
                </div>
                <div className="instructions-box">
                  {prompt.instructions}
                </div>
              </div>
            )}

            {prompt.keywords && prompt.keywords.length > 0 && (
              <div className="secret-section">
                <div className="section-title">
                  <h3>Keywords</h3>
                </div>
                <div className="keywords-grid-reveal">
                  {prompt.keywords.map(kw => (
                    <span key={kw} className="keyword-tag-reveal">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {prompt.samples && prompt.samples.length > 0 && (
              <div className="secret-section">
                <div className="section-title">
                  <h3>Proof of Concept (Samples)</h3>
                </div>
                <div className="samples-grid-reveal">
                  {prompt.samples.map((sample, idx) => (
                    <div key={idx} className="sample-card-reveal">
                      <div className="sample-card-header">
                        <div className="sample-label">Sample #{idx + 1}</div>
                        <button 
                          className="btn-icon-tiny" 
                          title="Copy Input"
                          onClick={() => handleCopy(sample.input)}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      
                      <div className="sample-input">
                        <span className="label">Input:</span> {sample.input}
                      </div>

                      <div className="sample-output-wrapper">
                        {prompt.generateType === 'video' ? (
                          <div className="media-container-premium">
                            <video src={sample.output} className="sample-output-media" />
                            <div className="media-actions-overlay">
                              <button onClick={() => window.open(sample.output, '_blank')} title="Full Screen"><Maximize2 size={16} /></button>
                              <a href={sample.output} download={`sample-${idx+1}.mp4`} title="Download"><Download size={16} /></a>
                            </div>
                          </div>
                        ) : prompt.generateType === 'text' ? (
                          <div className="sample-output-text-container">
                            <div className="sample-output-text">{sample.output}</div>
                            <button className="btn-copy-text" onClick={() => handleCopy(sample.output)}>
                              <Copy size={14} /> Copy Response
                            </button>
                          </div>
                        ) : (
                          <div className="media-container-premium">
                            <img src={sample.output} alt={`Sample ${idx + 1}`} className="sample-output-media" />
                            <div className="media-actions-overlay">
                              <button onClick={() => window.open(sample.output, '_blank')} title="View Full Image"><Maximize2 size={16} /></button>
                              <a href={sample.output} download={`sample-${idx+1}.png`} title="Download"><Download size={16} /></a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="success-footer-actions">
            <button onClick={() => navigate('/buyer-dashboard')} className="btn-secondary-outline">
              <ArrowLeft size={18} /> Go to My Library
            </button>
            <button onClick={() => navigate('/generate')} className="btn-primary-gradient">
              Use in Generator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
