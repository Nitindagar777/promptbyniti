import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Zap, Eye, Share2, Download, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PromptThumbnail from './PromptThumbnail';

/**
 * PinterestCard — A memoized card component for the Masonry feed.
 * Skips re-renders when item and index props haven't changed, preventing
 * already loaded cards and video/image elements from reloading on parent scroll.
 */
const PinterestCardComponent = ({ item, index }) => {
  const { state } = useApp();
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAdmin = state?.user?.email?.toLowerCase().trim() === 'nitindagar0800@gmail.com' || state?.user?.role === 'admin' || state?.user?.isAdmin;

  const tmpl = item.prompt;
  const promptId = tmpl?.id || tmpl?._id || 'unknown';

  // Determine aspect ratio based on keyId/promptId
  const getAspectRatio = () => {
    if (item.isTextOnly) return 'auto';
    const charCodeSum = (item.keyId || promptId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratios = ['1/1', '4/5', '3/4', '2/3', '1/1', '4/5'];
    return ratios[charCodeSum % ratios.length];
  };

  const getModelBadge = () => {
    const rawModel = (tmpl?.model || tmpl?.aiModel || tmpl?.generateType || 'flux-1').toLowerCase().trim();
    if (rawModel.includes('gemini') || rawModel.includes('imagen')) return 'Gemini';
    if (rawModel.includes('midjourney')) return 'Midjourney';
    if (rawModel.includes('sora')) return 'Sora';
    if (rawModel.includes('kling')) return 'Kling AI';
    if (rawModel.includes('runway')) return 'Runway';
    if (rawModel.includes('dall')) return 'DALL-E 3';
    if (rawModel.includes('gpt') || rawModel.includes('chatgpt')) return 'ChatGPT';
    if (rawModel.includes('claude')) return 'Claude';
    return 'Flux';
  };

  const ar = getAspectRatio();
  const tokenPrice = Math.floor(tmpl?.priceTokens || tmpl?.tokens || 5);

  const getValidMediaSrc = () => {
    let src = item.mediaSrc || tmpl?.thumbnail || tmpl?.outputImage;
    if (tmpl?.samples && tmpl.samples.length > 0) {
      const firstSample = tmpl.samples[0];
      const sampleOutput = (typeof firstSample === 'object') ? (firstSample.output || firstSample.url || firstSample.image) : firstSample;
      if (sampleOutput && typeof sampleOutput === 'string' && !sampleOutput.includes('gradient')) {
        src = sampleOutput;
      }
    }
    if (!src || typeof src !== 'string' || src.includes('gradient') || src.trim() === '') {
      const title = (tmpl?.title || tmpl?.name || '').toLowerCase();
      if (title.includes('bookstore') || title.includes('rainy')) {
        return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&fit=crop&q=80';
      }
      if (title.includes('script') || title.includes('writing') || title.includes('boy')) {
        return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80';
      }
      if (title.includes('college') || title.includes('sketching')) {
        return 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80';
      }
      if (title.includes('tea')) {
        return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80';
      }
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
    }
    return src;
  };

  const displaySrc = getValidMediaSrc();

  const getSamples = () => {
    const list = [];
    const samples = tmpl?.samples || [];
    
    samples.forEach(s => {
      const src = (typeof s === 'object') ? (s.output || s.url || s.image) : s;
      if (src && typeof src === 'string' && src.trim() !== '' && !src.includes('gradient')) {
        if (!list.includes(src)) list.push(src);
      }
    });

    if (list.length === 0 && tmpl?.sampleOutputs && Array.isArray(tmpl.sampleOutputs)) {
      tmpl.sampleOutputs.forEach(src => {
        if (src && typeof src === 'string' && src.trim() !== '' && !src.includes('gradient')) {
          if (!list.includes(src)) list.push(src);
        }
      });
    }

    const mainSrc = displaySrc || tmpl?.thumbnail || tmpl?.outputImage;
    if (mainSrc && typeof mainSrc === 'string' && !mainSrc.includes('gradient')) {
      if (!list.includes(mainSrc)) list.unshift(mainSrc);
    }

    while (list.length < 4) {
      list.push(list[0] || mainSrc);
    }

    return list.slice(0, 4);
  };

  const sampleList = getSamples();

  const handleShareLink = (e) => {
    e?.stopPropagation();
    const shareUrl = `https://promptbyniti.in/prompt/${promptId}`;
    if (navigator.share) {
      navigator.share({
        title: tmpl?.title || tmpl?.name || 'Prompt by Niti',
        text: `Check out "${tmpl?.title || tmpl?.name}" on Prompt by Niti!`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadCard = async (e) => {
    e?.stopPropagation();
    try {
      const canvas = document.createElement('canvas');
      const width = 900;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Dark Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a0c16');
      grad.addColorStop(1, '#05070e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Outer Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // 1. Ensure brand display font 'Chewy' is loaded for canvas
      try {
        await document.fonts.load('38px "Chewy"');
        await document.fonts.ready;
      } catch (e) {}

      // 2. Load Logo Icon & Sample Images
      const logoImgPromise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = '/image1.png';
      });

      const [logoImg, ...loadedImgs] = await Promise.all([
        logoImgPromise,
        ...sampleList.map(url => new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        }))
      ]);

      // 3. Header Branding (Logo Icon + Display Font Text)
      const iconSize = 44;
      const iconGap = 10;
      ctx.font = '38px "Chewy", cursive, system-ui, sans-serif';
      
      const promptByWidth = ctx.measureText('Prompt by ').width;
      const nitiWidth = ctx.measureText('Niti').width;
      const totalHeaderWidth = (logoImg ? iconSize + iconGap : 0) + promptByWidth + nitiWidth;
      
      let startX = (width - totalHeaderWidth) / 2;

      if (logoImg) {
        ctx.drawImage(logoImg, startX, 22, iconSize, iconSize);
        startX += iconSize + iconGap;
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Prompt by ', startX, 56);

      startX += promptByWidth;
      ctx.fillStyle = '#f97316';
      ctx.fillText('Niti', startX, 56);

      ctx.fillStyle = '#06b6d4';
      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('https://promptbyniti.in', width / 2, 96);

      // 3. Title
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 26px system-ui, sans-serif';
      const displayTitle = tmpl?.title || tmpl?.name || 'Prompt Template';
      ctx.fillText(displayTitle.length > 50 ? displayTitle.substring(0, 47) + '...' : displayTitle, width / 2, 148);

      // 4. Load & Draw 4 Images (2x2 Grid)
      const gridX = 45;
      const gridY = 175;
      const imgSize = 390;
      const gap = 30;

      const positions = [
        { x: gridX, y: gridY },
        { x: gridX + imgSize + gap, y: gridY },
        { x: gridX, y: gridY + imgSize + gap },
        { x: gridX + imgSize + gap, y: gridY + imgSize + gap }
      ];



      loadedImgs.forEach((img, idx) => {
        const pos = positions[idx];
        if (img && img.width > 0) {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pos.x, pos.y, imgSize, imgSize, 16);
          } else {
            ctx.rect(pos.x, pos.y, imgSize, imgSize);
          }
          ctx.clip();
          ctx.drawImage(img, pos.x, pos.y, imgSize, imgSize);
          ctx.restore();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pos.x, pos.y, imgSize, imgSize, 16);
          } else {
            ctx.rect(pos.x, pos.y, imgSize, imgSize);
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(pos.x, pos.y, imgSize, imgSize);
        }
      });

      // 5. Bottom Watermark
      ctx.fillStyle = '#64748b';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Prompt by Niti Store • https://promptbyniti.in', width / 2, height - 25);

      // Convert to PNG & Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `promptbyniti_${displayTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download card error:', err);
    }
  };

  return (
    <>
      <Link
        to={`/prompt/${promptId}?sample=${item.sampleIndex}`}
        className={`pinterest-card reveal ${item.isTextOnly ? 'pinterest-card--text-only' : ''}`}
        id={`template-${promptId}`}
        style={{
          animationDelay: `${index * 0.03}s`,
          textDecoration: 'none',
          position: 'relative'
        }}
      >
        <div 
          className={`pinterest-card__visual ${!item.isTextOnly ? 'pinterest-card__visual--has-ar' : ''}`} 
          style={!item.isTextOnly ? { aspectRatio: ar, overflow: 'hidden', position: 'relative' } : {}}
        >
          {/* Top-Left AI Model Badge with small black background */}
          <span
            className="pinterest-card__model-badge"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 10,
              padding: '3px 8px',
              borderRadius: '5px',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.4px',
              lineHeight: '1',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
              width: 'max-content',
              height: 'auto !important'
            }}
          >
            Flux/Gemini
          </span>

          {/* Small Red Eye Icon Button for Quick Preview & Share */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShowcaseModal(true);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 10,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            title="Preview 4 Images & Share"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)'; }}
          >
            <Eye size={14} style={{ color: '#ef4444' }} />
          </button>

          {item.isTextOnly ? (
            <div className="pinterest-card__text-title">{tmpl?.title || tmpl?.name}</div>
          ) : (
            <>
              <PromptThumbnail 
                src={displaySrc} 
                alt={tmpl?.title || tmpl?.name} 
                title={tmpl?.title || tmpl?.name}
                className="pinterest-card__media"
                type={tmpl?.generateType}
              />
              <div className="pinterest-card__samples-grid">
                {sampleList.map((sampleUrl, sIdx) => (
                  <img 
                    key={sIdx} 
                    src={sampleUrl} 
                    alt={`Sample ${sIdx + 1}`} 
                    className="pinterest-card__sample-img"
                    onError={(e) => { e.target.src = displaySrc; }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {!item.isTextOnly && (
          <div className="pinterest-card__content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '10px 12px' }}>
            <h3 className="pinterest-card__title" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              {tmpl?.title || tmpl?.name}
            </h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-orange, #fb923c)', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
              <Zap size={13} fill="currentColor" />
              <span>{tokenPrice}</span>
            </div>
          </div>
        )}
      </Link>

      {/* Full-Screen Showcase Lightbox Modal via Portal */}
      {showShowcaseModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
          onClick={() => setShowShowcaseModal(false)}
        >
          <div
            style={{
              background: '#0d0f18',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '92vw',
              maxHeight: '90vh',
              padding: '22px 26px',
              position: 'relative',
              boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              overflowY: 'auto',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowShowcaseModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#aaa',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            {/* Header: Website Logo Icon, Name & Link */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <img src="/image1.png" alt="Prompt by Niti Logo" style={{ height: '34px', width: 'auto', display: 'block' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 400, margin: 0, color: '#ffffff', lineHeight: 1.2, textShadow: 'none', letterSpacing: 'normal', fontFamily: "'Chewy', cursive, sans-serif" }}>
                  Prompt <span style={{ fontSize: '0.85em', fontWeight: 400, color: '#ffffff' }}>by</span> <span style={{ color: '#f97316' }}>Niti</span>
                </h2>
              </div>
              <a
                href="https://promptbyniti.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#06b6d4', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'underline', marginTop: '3px', display: 'inline-block', textShadow: 'none', letterSpacing: 'normal', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                https://promptbyniti.in
              </a>
            </div>

            {/* Prompt Title */}
            <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#f1f5f9', margin: 0, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: 'none', letterSpacing: 'normal', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {tmpl?.title || tmpl?.name}
            </h3>

            {/* 4 Sample Images (2x2 Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {sampleList.map((src, sIdx) => (
                <div key={sIdx} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#050505' }}>
                  <img src={src} alt={`Sample ${sIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {/* Action Buttons: Share Link (Center for all users) & Download Card Image (Admin Only) */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', width: '100%' }}>
              <button
                type="button"
                onClick={handleShareLink}
                style={{
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: '#f97316',
                  border: 'none',
                  borderRadius: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                  textShadow: 'none',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  letterSpacing: 'normal'
                }}
              >
                {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  style={{
                    padding: '10px 22px',
                    fontSize: '0.9rem',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    textShadow: 'none',
                    boxShadow: 'none',
                    letterSpacing: 'normal'
                  }}
                >
                  <Download size={16} />
                  <span>Download Card Image</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const PinterestCard = React.memo(PinterestCardComponent, (prevProps, nextProps) => {
  // Only re-render if the item keyId or the index changes
  return (
    prevProps.index === nextProps.index &&
    prevProps.item.keyId === nextProps.item.keyId &&
    prevProps.item.mediaSrc === nextProps.item.mediaSrc &&
    prevProps.item.isTextOnly === nextProps.item.isTextOnly &&
    prevProps.item.sampleIndex === nextProps.item.sampleIndex
  );
});

export default PinterestCard;
