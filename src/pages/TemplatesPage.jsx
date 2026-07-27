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

  // 1. Sync prompts whenever state.marketplace is loaded or updated
  useEffect(() => {
    if (state.marketplace && state.marketplace.length > 0) {
      setPrompts(state.marketplace);
      setLoading(false);
    }
  }, [state.marketplace]);

  // 2. Fetch fresh full dataset from /api/prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, []);

  const [error, setError] = useState(false);

  const fetchPrompts = async () => {
    if (!state.marketplace || state.marketplace.length === 0) {
      setLoading(true);
    }
    setError(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch(`${API_URL}/prompts`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts)) {
        setPrompts(data.prompts);
        dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      // If we have cached data, use it; otherwise show error
      if (!prompts || prompts.length === 0) {
        setError(true);
      }
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
      const catLower = (selectedCat || 'all').toLowerCase().trim();
      const isAllCategory = catLower === 'all' || catLower === 'default' || catLower === 'none' || catLower === '';

      const catObj = categories.find(c => c.id.toLowerCase() === catLower);
      const catLabelLower = catObj ? catObj.label.toLowerCase() : '';
      const cleanCatTerm = catLower.replace(/-/g, ' ');

      // Category match (All / Default / None matches EVERYTHING)
      const matchesCat = isAllCategory ||
        (t.category || '').toLowerCase() === catLower ||
        (catLabelLower && (t.category || '').toLowerCase() === catLabelLower) ||
        (t.generateType || '').toLowerCase() === catLower ||
        (Array.isArray(t.keywords) && t.keywords.some(k => k && (k.toLowerCase().includes(catLower) || k.toLowerCase().replace(/ /g, '-').includes(catLower) || (catLabelLower && k.toLowerCase().includes(catLabelLower))))) ||
        (typeof t.keywords === 'string' && (t.keywords.toLowerCase().includes(catLower) || (catLabelLower && t.keywords.toLowerCase().includes(catLabelLower)))) ||
        (t.title || t.name || '').toLowerCase().includes(cleanCatTerm) ||
        (catLabelLower && (t.title || t.name || '').toLowerCase().includes(cleanCatTerm)) ||
        (t.description || '').toLowerCase().includes(cleanCatTerm) ||
        (catLabelLower && (t.description || '').toLowerCase().includes(cleanCatTerm));

      if (!searchLower) return matchesCat;

      // Robust Search match (Title, Description, Instructions, Template, Category, Keywords, Samples, AI Model)
      let keywordMatch = false;
      if (Array.isArray(t.keywords)) {
        keywordMatch = t.keywords.some(k => k && String(k).toLowerCase().includes(searchLower));
      } else if (typeof t.keywords === 'string') {
        keywordMatch = t.keywords.toLowerCase().includes(searchLower);
      }

      let sampleMatch = false;
      if (Array.isArray(t.samples)) {
        sampleMatch = t.samples.some(s => {
          if (!s) return false;
          if (typeof s === 'object') {
            return (s.input || s.prompt || s.output || '').toLowerCase().includes(searchLower);
          }
          return String(s).toLowerCase().includes(searchLower);
        });
      }

      // Smart synonyms matching (e.g. girl -> woman, female, lady, portrait, model)
      let synonymMatch = false;
      if (searchLower === 'girl' || searchLower === 'girls') {
        const girlTerms = ['girl', 'woman', 'female', 'lady', 'portrait', 'she', 'her', 'model'];
        const fullText = `${t.title || ''} ${t.name || ''} ${t.description || ''} ${t.instructions || ''} ${t.template || ''} ${t.category || ''}`.toLowerCase();
        synonymMatch = girlTerms.some(term => fullText.includes(term));
      }

      const matchesSearch =
        (t.name || '').toLowerCase().includes(searchLower) ||
        (t.title || '').toLowerCase().includes(searchLower) ||
        (t.description || '').toLowerCase().includes(searchLower) ||
        (t.instructions || '').toLowerCase().includes(searchLower) ||
        (t.template || '').toLowerCase().includes(searchLower) ||
        (t.category || '').toLowerCase().includes(searchLower) ||
        (t.model || t.aiModel || '').toLowerCase().includes(searchLower) ||
        keywordMatch ||
        sampleMatch ||
        synonymMatch;

      return matchesCat && matchesSearch;
    });

    // Sort templates by createdAt descending (newest prompts first)
    const sortedTemplates = [...templates].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    sortedTemplates.forEach((tmpl, tmplIdx) => {
      const isText = tmpl.generateType === 'text';
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      const mainCover = tmpl.thumbnail || tmpl.video || sampleSrc || tmpl.image;

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

  const [visibleCount, setVisibleCount] = useState(500);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(500);
  }, [searchTerm, selectedCat]);

  // Infinite scroll event listener to load remaining items if dataset grows
  useEffect(() => {
    const handleScroll = () => {
      if (visibleCount >= feedItems.length) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setVisibleCount(prev => Math.min(prev + 50, feedItems.length));
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
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem', textAlign: 'center' }}>
            <Sparkles size={48} className="text-muted" />
            <h3 style={{ color: 'var(--text-primary)' }}>Unable to load prompts</h3>
            <p className="text-muted">Please check your connection and try again.</p>
            <button onClick={fetchPrompts} className="btn btn-secondary" style={{ marginTop: '8px' }}>
              <RotateCw size={16} style={{ marginRight: '8px' }} /> Retry
            </button>
          </div>
        ) : (
          <>
          <MasonryGrid
            columns={4}
            items={feedItems}
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
