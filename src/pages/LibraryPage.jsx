/* LibraryPage — Public prompt library */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PromptOutput from '../components/PromptOutput';
import { Globe, Search, Filter, Sparkles } from 'lucide-react';
import { categories } from '../data/promptData';
import './LibraryPage.css';

export default function LibraryPage() {
  const { state, setScroll, getScroll } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  
  useEffect(() => {
    const savedPos = getScroll(location.pathname);
    if (savedPos) {
      setTimeout(() => window.scrollTo(0, savedPos), 100);
    }
    
    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, []);

  // The single free prompt given to new users
  const freePrompt = {
    id: 'free_welcome_prompt',
    mainPrompt: 'Masterpiece, highly detailed portrait of a [CHARACTER_DESCRIPTION] wearing [CLOTHING_STYLE], standing in [BACKGROUND_SETTING], cinematic [LIGHTING_STYLE] lighting, 8k resolution, photorealistic, octane render --ar 16:9 --v 6.0',
    negativePrompt: 'blurry, low quality, deformed, out of focus, watermark, text, 3d render, cartoon',
    structured: { subject: '[CHARACTER_DESCRIPTION]', lighting: '[LIGHTING_STYLE]', style: 'photorealistic' },
    variations: [],
    category: 'portrait',
    model: 'Midjourney v6',
    timestamp: Date.now(),
  };

  // Logic: If user has EVER purchased a token, their plan is upgraded from 'free'. 
  // We hide the free prompt from users who have purchased.
  const hasPurchasedTokens = state.user && state.user.plan !== 'free';
  
  // Show ONLY the free prompt with variables for new/free users. Paid users get an empty library (or they go to the marketplace).
  const publicPrompts = hasPurchasedTokens ? [] : [freePrompt];

  const filteredPrompts = publicPrompts.filter(p => {
    const searchLower = searchTerm.toLowerCase().trim();
    const catLower = activeCat.toLowerCase();

    // Check category match
    const matchesCat = activeCat === 'all' || 
      (p.category || '').toLowerCase() === catLower ||
      (p.structured && p.structured.subject && p.structured.subject.toLowerCase().includes(catLower));

    if (!searchLower) return matchesCat;

    const matchesSearch = 
      (p.mainPrompt || '').toLowerCase().includes(searchLower) ||
      (p.structured && p.structured.subject && p.structured.subject.toLowerCase().includes(searchLower)) ||
      (p.structured && p.structured.style && p.structured.style.toLowerCase().includes(searchLower));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="library-page" id="library-page">
      <div className="container">
        {/* Header */}
        <div className="library-page__header">
          <h1 className="section-title">
            <span className="text-purple">Free</span> Prompts
          </h1>
          <div className="library-page__header-row">
            <p className="section-desc">
              Discover prompts created by the community. Access world-class generation formulas for free.
            </p>

            <div className="library-page__search-container">
              <div className="compact-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="clear-search">×</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="library-page__filters" id="library-filters">
          <Filter size={16} className="library-page__filter-icon" />
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`gen-chip gen-chip--sm ${activeCat === cat.id ? 'gen-chip--active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="library-page__grid">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt, i) => (
              <div key={prompt.id} className="library-card card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="library-card__body">
                  <div className="library-card__meta">
                    <span className="badge badge-primary">{prompt.model || 'Midjourney v6'}</span>
                    <span className="text-muted text-sm">
                      {new Date(prompt.timestamp || prompt.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="library-card__prompt-text">
                    "{prompt.mainPrompt}"
                  </p>
                </div>
                  <div className="library-card__footer">
                    <button 
                      className="btn btn-primary btn-sm btn-copy-black"
                      onClick={() => {
                        navigator.clipboard.writeText(prompt.mainPrompt);
                        setCopiedId(prompt.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                    >
                      {copiedId === prompt.id ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
              </div>
            ))
          ) : (
            <div className="library-page__empty">
              <Sparkles size={48} className="text-muted mb-4 mx-auto" />
              <h3>No prompts found</h3>
              <p>Try adjusting your search or filters to discover more prompts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
