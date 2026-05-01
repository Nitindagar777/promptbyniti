import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiCheckCircle, FiCopy, FiArrowLeft, FiStar, FiClock, FiLock, FiUnlock } from 'react-icons/fi';
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
        <FiArrowLeft /> Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="purchase-success-page">
      <div className="container-small">
        <div className="success-header animate-fade-in">
          <div className="check-icon-wrapper">
            <FiCheckCircle className="check-icon" />
          </div>
          <h1>Purchase Successful!</h1>
          <p>This prompt is now permanently saved to your library.</p>
        </div>

        <div className="unlocked-card card premium-card animate-slide-up">
          <div className="card-top-row">
            <div className="badge-unlocked">
              <FiUnlock /> FULL ACCESS UNLOCKED
            </div>
            <div className="prompt-meta-info">
              <span><FiStar /> {prompt.category}</span>
              <span><FiClock /> {new Date(prompt.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="unlocked-content">
            <div className="prompt-header-info">
              <img src={prompt.image} alt={prompt.name} className="success-thumb" />
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
                <h3><FiLock /> The Secret Prompt</h3>
                <button 
                  className={`btn-copy-small ${copied ? 'copied' : ''}`}
                  onClick={() => handleCopy(prompt.template)}
                >
                  {copied ? 'Copied!' : <><FiCopy /> Copy Prompt</>}
                </button>
              </div>
              <div className="prompt-box-reveal">
                {prompt.template}
              </div>
            </div>

            {prompt.instructions && (
              <div className="secret-section">
                <div className="section-title">
                  <h3>Instructions & Usage</h3>
                </div>
                <div className="instructions-box">
                  {prompt.instructions}
                </div>
              </div>
            )}
          </div>

          <div className="success-footer-actions">
            <button onClick={() => navigate('/buyer-dashboard')} className="btn-secondary-outline">
              <FiArrowLeft /> Go to My Library
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
