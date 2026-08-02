import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * PromptThumbnail Component
 * Instant loading with cached image detection and zero layout jump.
 */
const PromptThumbnailComponent = ({ src, alt, className, style, type, title, objectFit = 'cover', samples }) => {
  const srcStr = typeof src === 'string' ? src : (src?.output || src?.url || src?.image || src?.src || '');
  const [loaded, setLoaded] = useState(true); // Default to loaded for zero flicker
  const mediaRef = useRef(null);

  // Sleek Dark Navy gradient
  const cardGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';

  // Handler for marking media as loaded
  const handleLoaded = useCallback(() => setLoaded(true), []);

  // ── TEXT-ONLY prompts ─────────────────────────────────────────
  if (type === 'text' || !srcStr) {
    const isSmall = style?.width && parseInt(style.width) < 60;

    return (
      <div 
        className={className} 
        style={{ 
          ...style, 
          width: style?.width || '100%',
          height: style?.height || '100%',
          background: cardGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isSmall ? '4px' : '20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {title && !isSmall && (
          <span style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            fontFamily: 'var(--font-display)',
            zIndex: 1,
            lineHeight: 1.3,
            maxWidth: '90%',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            {title}
          </span>
        )}
        {isSmall && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 'bold' }}>
            TEXT
          </div>
        )}
      </div>
    );
  }

  // ── VIDEO prompts ─────────────────────────────────────────────
  const isVideo = type === 'video' ||
    srcStr.toLowerCase().match(/\.(mp4|webm|ogg|mov)(\?.*)?$/) ||
    srcStr.includes('/video/upload/') || 
    srcStr.startsWith('data:video/');

  if (isVideo) {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '180px', background: '#0a0d16' }}>
        <video
          ref={mediaRef}
          src={srcStr}
          className={className}
          style={{
            ...style,
            objectFit: objectFit,
            opacity: 1,
            display: 'block',
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
          autoPlay
          preload="auto"
          muted
          loop
          playsInline
          onLoadedData={handleLoaded}
        />
      </div>
    );
  }

  // ── IMAGE prompts ─────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '180px', background: '#0a0d16' }}>
      <img
        ref={mediaRef}
        src={srcStr}
        alt={alt}
        className={className}
        style={{
          ...style,
          objectFit: objectFit,
          opacity: 1,
          display: 'block',
          width: '100%',
          height: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
        loading="lazy"
        decoding="async"
        onLoad={handleLoaded}
        onError={(e) => {
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent) parent.style.background = cardGradient;
        }}
      />
    </div>
  );
};

const PromptThumbnail = React.memo(PromptThumbnailComponent, (prevProps, nextProps) => {
  if (prevProps.src !== nextProps.src) return false;
  if (prevProps.alt !== nextProps.alt) return false;
  if (prevProps.className !== nextProps.className) return false;
  if (prevProps.type !== nextProps.type) return false;
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.objectFit !== nextProps.objectFit) return false;

  if (prevProps.style !== nextProps.style) {
    if (!prevProps.style || !nextProps.style) return false;
    const prevKeys = Object.keys(prevProps.style);
    const nextKeys = Object.keys(nextProps.style);
    if (prevKeys.length !== nextKeys.length) return false;
    for (const key of prevKeys) {
      if (prevProps.style[key] !== nextProps.style[key]) return false;
    }
  }

  if (prevProps.samples !== nextProps.samples) {
    if (!prevProps.samples || !nextProps.samples) return false;
    if (prevProps.samples.length !== nextProps.samples.length) return false;
    for (let i = 0; i < prevProps.samples.length; i++) {
      if (prevProps.samples[i] !== nextProps.samples[i]) return false;
    }
  }

  return true;
});

export default PromptThumbnail;
