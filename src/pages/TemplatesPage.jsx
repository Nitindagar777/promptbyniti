/* TemplatesPage — Prompt templates gallery */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { promptTemplates, categories } from '../data/promptData';
import { Crown, Lock, ArrowRight, Sparkles, Filter, Zap } from 'lucide-react';
import { useState } from 'react';
import './TemplatesPage.css';

export default function TemplatesPage() {
  const { isPremium } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredTemplates =
    selectedCat === 'all'
      ? promptTemplates
      : promptTemplates.filter(t => t.category === selectedCat);

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

        <div className="templates-page__grid">
          {filteredTemplates.map((tmpl, i) => (
            <Link
              key={tmpl.id}
              to={tmpl.premium && !isPremium ? '/pricing' : `/generate?template=${tmpl.id}`}
              className="template-card card"
              id={`template-${tmpl.id}`}
              style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none' }}
            >
              {tmpl.thumbnail || tmpl.video ? (
                <div className="template-card__visual">
                  {tmpl.video ? (
                    <video src={tmpl.video} autoPlay muted loop className="template-card__media" />
                  ) : (
                    <img src={tmpl.thumbnail} alt={tmpl.title} className="template-card__media" />
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
                      <Zap size={10} fill="currentColor" /> 5
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
                      <Zap size={10} fill="currentColor" /> 5 Tokens
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
