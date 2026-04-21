/* TemplatesPage — Prompt templates gallery */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { promptTemplates, categories } from '../data/promptData';
import { Crown, Lock, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { useState } from 'react';
import './TemplatesPage.css';

export default function TemplatesPage() {
  const { isPremium } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredTemplates =
    selectedCat === 'all'
      ? promptTemplates
      : promptTemplates.filter(t => t.category === selectedCat);

  const templateCategories = ['all', ...new Set(promptTemplates.map(t => t.category))];

  return (
    <div className="templates-page" id="templates-page">
      <div className="container">
        {/* Header */}
        <div className="templates-page__header">
          <div className="section-tag">
            <Sparkles size={14} /> Ready-Made Templates
          </div>
          <h1 className="section-title">Prompt Templates</h1>
          <p className="section-desc">
            Start with a professionally crafted template and customize it to your needs.
            One click, perfect prompts.
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

        {/* Templates Grid */}
        <div className="templates-page__grid">
          {filteredTemplates.map((tmpl, i) => (
            <div
              key={tmpl.id}
              className="template-card card"
              id={`template-${tmpl.id}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {tmpl.premium && (
                <div className="template-card__premium">
                  <Crown size={12} /> Premium
                </div>
              )}

              <div className="template-card__emoji">{tmpl.emoji}</div>
              <h3 className="template-card__title">{tmpl.title}</h3>
              <p className="template-card__desc">{tmpl.description}</p>

              <div className="template-card__meta">
                <span className="badge badge-primary">
                  {categories.find(c => c.id === tmpl.category)?.label || tmpl.category}
                </span>
                <span className="template-card__style">{tmpl.config.style}</span>
              </div>

              <div className="template-card__preview">
                <span className="template-card__preview-label">Preview:</span>
                <p className="template-card__preview-text">
                  {tmpl.config.description}
                </p>
              </div>

              <Link
                to={tmpl.premium && !isPremium ? '/pricing' : `/generate?template=${tmpl.id}`}
                className={`btn ${tmpl.premium && !isPremium ? 'btn-ghost' : 'btn-primary'} template-card__cta`}
              >
                {tmpl.premium && !isPremium ? (
                  <><Lock size={14} /> Unlock Premium</>
                ) : (
                  <><Sparkles size={14} /> Use Template <ArrowRight size={14} /></>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
