import React from 'react';

/**
 * PromptThumbnail Component
 * Handles both static images and video thumbnails for prompts.
 * For videos, it shows the first frame (metadata preload) or a poster if available.
 */
const PromptThumbnail = ({ src, alt, className, style, type, title, objectFit = 'cover' }) => {
  const srcStr = typeof src === 'string' ? src : (src?.output || '');
  
  // Sleek Dark Navy gradient to match Marketplace Cards
  const cardGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';

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
            zIndex: 1, // Lower than eye icon
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

  const isVideo = type === 'video' ||
    srcStr.toLowerCase().match(/\.(mp4|webm|ogg|mov)(\?.*)?$/) ||
    srcStr.includes('/video/upload/') || 
    srcStr.startsWith('data:video/');

  if (isVideo) {
    return (
      <video
        src={srcStr}
        className={className}
        style={{ ...style, objectFit: objectFit }}
        preload="auto"
        muted
        loop
        playsInline
        onMouseOver={(e) => e.target.play()}
        onMouseOut={(e) => {
          e.target.pause();
          e.target.currentTime = 0;
        }}
      />
    );
  }

  return (
    <img
      src={srcStr}
      alt={alt}
      className={className}
      style={{ ...style, objectFit: objectFit }}
      onError={(e) => {
        e.target.style.display = 'none';
        const parent = e.target.parentElement;
        if (parent) parent.style.background = cardGradient;
      }}
    />
  );
};

export default PromptThumbnail;
