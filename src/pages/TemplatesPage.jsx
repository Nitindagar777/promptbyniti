/* TemplatesPage — Prompt templates gallery */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories } from '../data/promptData';
import { Crown, Lock, ArrowRight, Sparkles, Filter, Zap, Loader2, Eye, Search, RotateCw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PromptThumbnail from '../components/PromptThumbnail';
import MasonryGrid from '../components/MasonryGrid';
import PinterestCard from '../components/PinterestCard';
import PreviewModal from '../components/PreviewModal';
import SEOHead from '../components/SEOHead';
import './TemplatesPage.css';

// Random shuffle — non-deterministic order for different dataset loads so refresh changes card order
const randomShuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const API_URL = '/api';

export default function TemplatesPage() {
  const { state, dispatch, isPremium, setScroll, getScroll } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState(state.marketplace || []);
  const [loading, setLoading] = useState(!state.marketplace || state.marketplace.length === 0);
  const [previewPrompt, setPreviewPrompt] = useState(null);

  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
      setSelectedCat('all');
    } else if (location.state?.category) {
      setSelectedCat(location.state.category);
      setSearchTerm('');
    }
  }, [location.state]);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrompts();

    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
      }
    } catch (err) {
      console.error('Failed to refresh prompts:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const feedItems = useMemo(() => {
    const items = [];
    const templates = prompts.filter(t => {
      const searchLower = searchTerm.toLowerCase().trim();
      const catLower = selectedCat.toLowerCase();

      // Check category match (Primary category OR in keywords)
      const matchesCat = selectedCat === 'all' ||
        (t.category || '').toLowerCase() === catLower ||
        (Array.isArray(t.keywords) && t.keywords.some(k => k && k.toLowerCase().replace(/ /g, '-') === catLower)) ||
        (typeof t.keywords === 'string' && t.keywords.toLowerCase().replace(/ /g, '-').includes(catLower));

      if (!searchLower) return matchesCat;

      // Robust keyword check (handles both arrays and strings)
      let keywordMatch = false;
      if (Array.isArray(t.keywords)) {
        keywordMatch = t.keywords.some(k => k && k.toLowerCase().includes(searchLower));
      } else if (typeof t.keywords === 'string') {
        keywordMatch = t.keywords.toLowerCase().includes(searchLower);
      }

      const matchesSearch =
        (t.name || '').toLowerCase().includes(searchLower) ||
        (t.title || '').toLowerCase().includes(searchLower) ||
        (t.description || '').toLowerCase().includes(searchLower) ||
        keywordMatch;

      return matchesCat && matchesSearch;
    });

    templates.forEach((tmpl, tmplIdx) => {
      const isText = tmpl.generateType === 'text';
      const mainCover = tmpl.thumbnail || tmpl.video || (tmpl.samples?.[0]?.output || tmpl.samples?.[0]) || tmpl.image;

      items.push({
        prompt: tmpl,
        mediaSrc: isText ? null : mainCover,
        isTextOnly: isText || !mainCover,
        sampleIndex: 0,
        keyId: tmpl.id || tmpl._id || `tmpl-${tmplIdx}`
      });
    });

    return items;
  }, [prompts, searchTerm, selectedCat]);

  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedCat]);

  // Infinite scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (visibleCount >= feedItems.length) return;
      // Trigger load more when user scrolls to within 300px of the page bottom
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setVisibleCount(prev => Math.min(prev + 12, feedItems.length));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, feedItems.length]);

  const templateCategories = ['all', ...categories.filter(c => c.id !== 'default' && c.id !== 'none').map(c => c.id)];

  return (
    <div className="templates-page" id="templates-page">
      <SEOHead
        title="Prompt Store — Premium AI Prompts & Templates"
        description="Browse and discover high-converting, professional AI prompt templates for Midjourney, ChatGPT, DALL·E, Stable Diffusion, Flux, Sora, Kling & more. Verified prompt templates with sample outputs."
        keywords="prompt store, prompt marketplace, AI prompts, Midjourney prompts, ChatGPT prompts, DALL-E prompts, Sora video prompts, Flux prompts, prompt templates, prompt shop, AI art prompts, premium prompts"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Store', url: '/templates' }
        ]}
      />
      <div className="container">
        {/* Header */}
        <div className="templates-page__header">
          <h1 className="section-title">Prompt <span className="text-orange">Store</span></h1>
          <div className="templates-page__header-row">
            <p className="section-desc">
              Discover and unlock high-converting, professional AI prompt templates for any model.
            </p>

            <div className="templates-page__search-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={handleRefresh} 
                className="btn-refresh" 
                title="Shuffle & Refresh Feed"
                style={{
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  e.currentTarget.style.color = 'var(--color-cyan)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <RotateCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
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
          <>
          <MasonryGrid
            columns={4}
            items={feedItems.slice(0, visibleCount)}
            renderItem={(item, i) => (
              <PinterestCard key={item.keyId} item={item} index={i} />
            )}
          />
          {feedItems.length === 0 && (
            <div className="templates-page__empty">
              <Sparkles size={48} className="text-muted mb-4 mx-auto" />
              <h3>No prompts found</h3>
              <p>Try selecting another category to discover more prompts.</p>
            </div>
          )}
          </>
        )}
      </div>
      {/* Preview Modal */}
      {previewPrompt && <PreviewModal prompt={previewPrompt} onClose={() => setPreviewPrompt(null)} />}
    </div>
  );
}
