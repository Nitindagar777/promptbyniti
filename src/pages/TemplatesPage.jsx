/* TemplatesPage — Prompt templates gallery */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { promptTemplates as staticTemplates, categories } from '../data/promptData';
import { Crown, Lock, ArrowRight, Sparkles, Filter, Zap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import './TemplatesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';

export default function TemplatesPage() {
  const { isPremium } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');
  const [prompts, setPrompts] = useState(staticTemplates);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (data.success && data.prompts.length > 0) {
        // Dynamic prompts from DB at the TOP, then static ones
        setPrompts([...data.prompts, ...staticTemplates]);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates =
    selectedCat === 'all'
      ? prompts
      : prompts.filter(t => t.category === selectedCat);

  const templateCategories = ['all', ...categories.filter(c => c.id !== 'default' && c.id !== 'none').map(c => c.id)];

  return (
    <div className="templates-page" id="templates-page">
      <div className="container">
        {/* Header */}
        <div className="templates-page__header">
          <h1 className="section-title">Prompt <span className="text-cyan">Store</span></h1>
          <p className="section-desc">
            Token-Powered Prompt Marketplace. Spend tokens to own the industry's most powerful, ready-to-generate prompt configurations.
          </p>
        </div>

        {/* Category Filters */}
        <div className="templates-page__filters" id="template-filters">
          <Filter size={16} className="templates-page__filter-icon" />
          {templateCategories.map(cat => (
            <button
              key={cat}
              className={`gen-chip gen-chip--sm ${selectedCat === cat ? 'gen-chip--active' : ''}`}
              onClick={() => setSelectedCat(cat)}
              id={`filter-${cat}`}
            >
              {cat === 'all' ? 'All' : categories.find(c => c.id === cat)?.label || cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
            <Loader2 className="animate-spin text-cyan" size={48} />
            <p className="text-muted">Loading premium prompts...</p>
          </div>
        ) : (
          <div className="templates-page__grid">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((tmpl, i) => (
                <Link
                  key={tmpl.id || tmpl._id}
                  to={`/prompt/${tmpl.id || tmpl._id}`}
                  className="template-card card"
                  id={`template-${tmpl.id || tmpl._id}`}
                  style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
                >
                  {tmpl.thumbnail || tmpl.video || (tmpl.samples && (tmpl.samples[0]?.output || tmpl.samples[0])) ? (
                    <div className="template-card__visual">
                      {tmpl.video || (tmpl.samples && (tmpl.samples[0]?.output || tmpl.samples[0])?.toString().includes('mp4')) ? (
                        <video src={tmpl.video || (tmpl.samples[0]?.output || tmpl.samples[0])} autoPlay muted loop className="template-card__media template-card__media-main" />
                      ) : (
                        <>
                          <img src={tmpl.thumbnail || (tmpl.samples?.[0]?.output || tmpl.samples?.[0])} alt={tmpl.title || tmpl.name} className="template-card__media template-card__media-main" />
                          {tmpl.samples && tmpl.samples.length >= 3 && (
                            <div className="template-card__gallery">
                              <div className="template-card__gallery-main">
                                <img src={tmpl.samples[0]?.output || tmpl.samples[0]} alt="sample 1" />
                              </div>
                              <div className="template-card__gallery-side">
                                <img src={tmpl.samples[1]?.output || tmpl.samples[1]} alt="sample 2" />
                                <img src={tmpl.samples[2]?.output || tmpl.samples[2]} alt="sample 3" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Model Overlay (Top) */}
                      <div className="template-card__overlay template-card__overlay--top">
                        <span className="template-card__model-tag">
                          {tmpl.category === 'anime' ? 'Niji v6' : 'Flux.1'}
                        </span>
                      </div>
                      
                      {/* Name & Token Overlay (Bottom) */}
                      <div className="template-card__overlay template-card__overlay--bottom">
                        <h3 className="template-card__title-overlay">{tmpl.title}</h3>
                        <div className="template-card__token-badge">
                          <Zap size={10} fill="currentColor" /> {tmpl.priceTokens || 5}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="template-card__content template-card__content--text">
                      {/* Model Overlay (Top) */}
                      <div className="template-card__overlay template-card__overlay--top">
                        <span className="template-card__model-tag template-card__model-tag--text">
                          {tmpl.category === 'chat' ? 'GPT-4o' : 'Claude 3.5'}
                        </span>
                      </div>

                      {/* Centered Name */}
                      <h3 className="template-card__title-center">{tmpl.title}</h3>

                      {/* Token Overlay (Bottom Right) */}
                      <div className="template-card__overlay template-card__overlay--bottom template-card__overlay--right">
                        <div className="template-card__token-badge template-card__token-badge--text">
                          <Zap size={10} fill="currentColor" /> {tmpl.priceTokens || 5} Tokens
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="templates-page__empty">
                <Sparkles size={48} className="text-muted mb-4 mx-auto" />
                <h3>No prompts found</h3>
                <p>Try selecting another category to discover more premium prompts.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
