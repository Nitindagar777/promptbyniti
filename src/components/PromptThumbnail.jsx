import React from 'react';

/**
 * PromptThumbnail Component
 * Handles both static images and video thumbnails for prompts.
 * For videos, it shows the first frame (metadata preload) or a poster if available.
 */
const PromptThumbnail = ({ src, alt, className, style, type }) => {
  const isVideo = type === 'video' ||
    src?.toLowerCase().match(/\.(mp4|webm|ogg|mov)(\?.*)?$/) ||
    (src && src.startsWith('data:video/'));

  if (isVideo) {
    return (
      <video
        src={src}
        className={className}
        style={{ ...style, objectFit: 'cover' }}
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
      style={style}
      onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
      }}
    />
  );
};

export default PromptThumbnail;
