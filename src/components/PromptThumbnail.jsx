import React from 'react';

/**
 * PromptThumbnail Component
 * Handles both static images and video thumbnails for prompts.
 * For videos, it shows the first frame (metadata preload) or a poster if available.
 */
const PromptThumbnail = ({ src, alt, className, style, type, samples, objectFit = 'cover' }) => {
  const isVideo = type === 'video' ||
    src?.toLowerCase().match(/\.(mp4|webm|ogg|mov)(\?.*)?$/) ||
    (src && src.startsWith('data:video/'));

  const isText = type === 'text' || (!src && !type) || (type === 'image' && (!src || src.includes('placeholder') || src.includes('unsplash')));

  const previewSamples = (samples || []).slice(0, 6);

  if (isText) {
    return (
      <div 
        className={className} 
        style={{ 
          ...style, 
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden',
          position: 'relative',
          padding: '15px'
        }}
      >
        {/* Sample Background Overlay - Moved to bottom and spread out */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px', 
          width: '100%', 
          position: 'absolute',
          bottom: '15px',
          left: '10px',
          right: '10px',
          opacity: 0.2
        }}>
          {previewSamples.map((s, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              height: '40px', 
              borderRadius: '4px',
              fontSize: '5px',
              padding: '5px',
              color: 'rgba(255,255,255,0.3)',
              overflow: 'hidden',
              textAlign: 'left'
            }}>
              {s.output || s}
            </div>
          ))}
        </div>

        {/* Centered Title */}
        <span style={{ 
          color: '#fff', 
          fontSize: '0.9rem', 
          fontFamily: 'var(--font-display)', 
          textAlign: 'center', 
          textTransform: 'uppercase',
          lineHeight: '1.3',
          letterSpacing: '0.1em',
          fontWeight: '900',
          textShadow: '0 0 15px rgba(0,255,255,0.4)',
          zIndex: 2,
          maxWidth: '90%',
          marginTop: '-10px' // Slight adjustment to feel perfectly centered
        }}>
          {alt}
        </span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={src}
        className={className}
        style={{ ...style, objectFit: objectFit }}
        preload="metadata"
        muted
        playsInline
      />
    );
  }

  return (
    <img
      src={src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'}
      alt={alt}
      className={className}
      style={{ ...style, objectFit: objectFit }}
      onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
      }}
    />
  );
};

export default PromptThumbnail;
