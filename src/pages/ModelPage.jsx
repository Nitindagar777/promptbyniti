/* ModelPage — Shows ALL model prompts in a premium grid */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2, RotateCw, Search, Crown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import MasonryGrid from '../components/MasonryGrid';
import PinterestCard from '../components/PinterestCard';
import PreviewModal from '../components/PreviewModal';
import SEOHead from '../components/SEOHead';
import './ModelPage.css';

const API_URL = '/api';

export default function ModelPage() {
  const { state, dispatch, setScroll, getScroll } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState(state.marketplace || []);
  const [loading, setLoading] = useState(!state.marketplace || state.marketplace.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState(null);

  // Check global visibility setting and redirect if hidden
  useEffect(() => {
    const checkVisibility = async () => {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.modelSectionVisible === false) {
            navigate('/', { replace: true });
          }
        }
      } catch (err) { }
    };
    checkVisibility();
  }, [navigate]);

  // Sync prompts whenever state.marketplace is loaded or updated
  useEffect(() => {
    if (state.marketplace && state.marketplace.length > 0) {
      setPrompts(state.marketplace);
      setLoading(false);
    }
  }, [state.marketplace]);

  // Fetch fresh data on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    return () => {
      setScroll(location.pathname, window.scrollY);
    };
  }, []);

  const fetchPrompts = async () => {
    if (!state.marketplace || state.marketplace.length === 0) {
      setLoading(true);
    }
    setError(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/prompts`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts)) {
        setPrompts(data.prompts);
        dispatch({ type: 'PRELOAD_DATA', payload: { marketplace: data.prompts } });
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
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

  // Filter ALL prompts to model category and apply search — NO LIMIT, show all
  const feedItems = useMemo(() => {
    const items = [];
    const searchLower = searchTerm.toLowerCase().trim();

    // Filter for model-related prompts
    const modelPrompts = prompts.filter(t => {
      const cat = (t.category || '').toLowerCase();
      const keywords = Array.isArray(t.keywords) ? t.keywords.map(k => (k || '').toLowerCase()) : [];
      const name = (t.name || t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const model = (t.model || t.aiModel || '').toLowerCase();

      // Match model category prompts strictly
      const isModel = cat === 'model' || cat === 'models';

      if (!searchLower) return isModel;

      // Also apply search filter
      let keywordMatch = keywords.some(k => k.includes(searchLower));
      const matchesSearch =
        name.includes(searchLower) ||
        (t.title || '').toLowerCase().includes(searchLower) ||
        desc.includes(searchLower) ||
        (t.instructions || '').toLowerCase().includes(searchLower) ||
        (t.template || '').toLowerCase().includes(searchLower) ||
        cat.includes(searchLower) ||
        (t.model || t.aiModel || '').toLowerCase().includes(searchLower) ||
        keywordMatch;

      return isModel && matchesSearch;
    });

    // Sort by newest first
    const sorted = [...modelPrompts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Show ALL model prompts — no slice limit
    sorted.forEach((tmpl, tmplIdx) => {
      const isText = tmpl.generateType === 'text';
      const firstSample = tmpl.samples?.[0];
      const sampleSrc = typeof firstSample === 'object' ? (firstSample?.output || firstSample?.url || firstSample?.image) : firstSample;
      const mainCover = tmpl.thumbnail || tmpl.video || sampleSrc || tmpl.image;

      items.push({
        prompt: tmpl,
        mediaSrc: isText ? null : mainCover,
        isTextOnly: isText || !mainCover,
        sampleIndex: 0,
        keyId: tmpl.id || tmpl._id || `model-${tmplIdx}`
      });
    });

    return items;
  }, [prompts, searchTerm]);

  return (
    <div className="model-page" id="model-page">
      <SEOHead
        title="Model Prompts — Premium AI Model Generation"
        description="Browse all premium AI model prompts for Gemini, Flux & more. Generate stunning, photorealistic model images with our curated premium prompts."
        keywords="model prompts, AI model, Gemini prompts, Flux prompts, photorealistic model, premium AI prompts, model generation"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Model', url: '/model' }
        ]}
      />
      <div className="container">
        {/* Header */}
        <div className="model-page__header">
          <div className="model-page__title-row">
            <Crown size={28} className="model-page__crown-icon" />
            <h1 className="section-title">Model <span className="text-pink">Prompts</span></h1>
          </div>
          <div className="model-page__header-row">
            <p className="section-desc">
              Premium AI model generation — browse all curated model prompts powered by Gemini & Flux.
            </p>

            <div className="model-page__search-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                  e.currentTarget.style.borderColor = 'var(--color-pink)';
                  e.currentTarget.style.color = 'var(--color-pink)';
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
                  placeholder="Search model prompts..."
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

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
            <Loader2 className="animate-spin text-pink" size={48} />
            <p className="text-muted">Loading model prompts...</p>
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
              <div className="model-page__empty">
                <Crown size={48} className="text-muted mb-4 mx-auto" />
                <h3>No model prompts found</h3>
                <p>Model prompts will appear here once they are generated and published.</p>
              </div>
            )}
          </>
        )}
      </div>
      {previewPrompt && <PreviewModal prompt={previewPrompt} onClose={() => setPreviewPrompt(null)} />}
    </div>
  );
}
