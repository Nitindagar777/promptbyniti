/* TemplatesPage — Prompt templates gallery */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories } from '../data/promptData';
import { Crown, Lock, ArrowRight, Sparkles, Filter, Zap, Loader2, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import './TemplatesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';

export default function TemplatesPage() {
  const { isPremium } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCat === 'all' 
    ? prompts 
    : prompts.filter(t => (t.category || '').toLowerCase() === selectedCat.toLowerCase());

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
            filteredTemplates.map((tmpl, i) => {
                const s0 = tmpl.samples?.[0]?.output || tmpl.samples?.[0];
                const s1 = tmpl.samples?.[1]?.output || tmpl.samples?.[1];
                const s2 = tmpl.samples?.[2]?.output || tmpl.samples?.[2];
                const coverSrc = tmpl.thumbnail || s0;
                const isTextOnly = !coverSrc && !tmpl.video;

                return (
                  <Link
                    key={tmpl.id || tmpl._id}
                    to={`/prompt/${tmpl.id || tmpl._id}`}
                    className="template-card card"
                    id={`template-${tmpl.id || tmpl._id}`}
                    style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
                  >
                    {!isTextOnly ? (
                      <div className="template-card__visual">
                        {tmpl.video ? (
                          <video src={tmpl.video} autoPlay muted loop className="template-card__media template-card__media-main" />
                        ) : (
                          <img
                            src={coverSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                            alt={tmpl.title || tmpl.name}
                            className="template-card__media template-card__media-main"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'; }}
                          />
                        )}

                        {/* Hover gallery — all 3 samples */}
                        {s0 && s1 && s2 && (
                          <div className="template-card__gallery">
                            <div className="template-card__gallery-main">
                              <img src={s0} alt="sample 1" />
                            </div>
                            <div className="template-card__gallery-side">
                              <img src={s1} alt="sample 2" />
                              <img src={s2} alt="sample 3" />
                            </div>
                          </div>
                        )}

                        <div className="template-card__overlay template-card__overlay--top">
                          <span className="template-card__model-tag">
                            {tmpl.model || (tmpl.category === 'anime' ? 'Niji v6' : 'Flux.1')}
                          </span>
                        </div>
                        <div className="template-card__overlay template-card__overlay--bottom">
                          <div style={{ flex: 1 }}>
                            <h3 className="template-card__title-overlay">{tmpl.title || tmpl.name}</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div className="template-card__token-badge">
                                <Zap size={10} fill="currentColor" /> {tmpl.priceTokens || tmpl.tokens || 5}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Eye size={10} /> {tmpl.views || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="template-card__content template-card__content--text">
                        <div className="template-card__overlay template-card__overlay--top">
                          <span className="template-card__model-tag template-card__model-tag--text">
                            {tmpl.model || 'GPT-4o'}
                          </span>
                        </div>
                        <h3 className="template-card__title-center">{tmpl.title || tmpl.name}</h3>
                        <div className="template-card__overlay template-card__overlay--bottom template-card__overlay--right">
                          <div className="template-card__token-badge template-card__token-badge--text">
                            <Zap size={10} fill="currentColor" /> {tmpl.priceTokens || tmpl.tokens || 5} Tokens
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })
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
