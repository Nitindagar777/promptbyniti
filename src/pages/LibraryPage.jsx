/* LibraryPage — Public prompt library */
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PromptOutput from '../components/PromptOutput';
import { Globe, Search, Filter, Sparkles } from 'lucide-react';
import { categories } from '../data/promptData';
import './LibraryPage.css';

export default function LibraryPage() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Since we don't have a real backend, we'll use the user's public prompts and mock some data
  const mockPublicPrompts = [
    {
      id: 'mock_1',
      mainPrompt: 'A cinematic portrait of a cyberpunk hacker in a neon-lit alleyway, rain falling, dramatic rim lighting, 8k resolution, highly detailed --ar 16:9 --v 6.0',
      negativePrompt: 'blurry, low quality, deformed, out of focus',
      structured: { subject: 'cyberpunk hacker', lighting: 'neon rim lighting', style: 'cinematic' },
      variations: [],
      category: 'portrait',
      timestamp: Date.now() - 1000000,
    },
    {
      id: 'mock_2',
      mainPrompt: 'Minimalist product photography of a luxury perfume bottle on a marble pedestal, golden hour lighting, soft shadows, photorealistic --ar 1:1 --v 6.0',
      negativePrompt: 'cluttered background, reflections, text, watermark',
      structured: { subject: 'perfume bottle', lighting: 'golden hour', style: 'minimalist' },
      variations: [],
      category: 'product',
      timestamp: Date.now() - 5000000,
    },
  ];

  // Combine real user public prompts with mock data
  const publicPrompts = [
    ...state.prompts.filter(p => !state.isPrivateMode), 
    ...mockPublicPrompts
  ];

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
                    <span className="badge badge-primary">Midjourney</span>
                    <span className="text-muted text-sm">
                      {new Date(prompt.timestamp).toLocaleDateString()}
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
