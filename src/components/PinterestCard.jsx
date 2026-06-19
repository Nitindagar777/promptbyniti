import React from 'react';
import { Link } from 'react-router-dom';
import PromptThumbnail from './PromptThumbnail';

/**
 * PinterestCard — A memoized card component for the Masonry feed.
 * Skips re-renders when item and index props haven't changed, preventing
 * already loaded cards and video/image elements from reloading on parent scroll.
 */
const PinterestCardComponent = ({ item, index }) => {
  const tmpl = item.prompt;
  const promptId = tmpl?.id || tmpl?._id || 'unknown';

  // Determine aspect ratio based on keyId/promptId
  const getAspectRatio = () => {
    if (item.isTextOnly) return 'auto';
    const charCodeSum = (item.keyId || promptId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratios = ['1/1', '4/5', '3/4', '2/3', '1/1', '4/5'];
    return ratios[charCodeSum % ratios.length];
  };

  const ar = getAspectRatio();

  return (
    <Link
      to={`/prompt/${promptId}?sample=${item.sampleIndex}`}
      className={`pinterest-card reveal ${item.isTextOnly ? 'pinterest-card--text-only' : ''}`}
      id={`template-${promptId}`}
      style={{
        animationDelay: `${index * 0.03}s`,
        textDecoration: 'none'
      }}
    >
      <div 
        className={`pinterest-card__visual ${!item.isTextOnly ? 'pinterest-card__visual--has-ar' : ''}`} 
        style={!item.isTextOnly ? { aspectRatio: ar, overflow: 'hidden' } : {}}
      >
        {item.isTextOnly ? (
          <div className="pinterest-card__text-title">{tmpl?.title || tmpl?.name}</div>
        ) : (
          <PromptThumbnail 
            src={item.mediaSrc} 
            alt={tmpl?.title || tmpl?.name} 
            title={tmpl?.title || tmpl?.name}
            className="pinterest-card__media"
            type={tmpl?.generateType}
          />
        )}
      </div>
      {!item.isTextOnly && (
        <div className="pinterest-card__content">
          <h3 className="pinterest-card__title" style={{ margin: 0 }}>{tmpl?.title || tmpl?.name}</h3>
        </div>
      )}
    </Link>
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
