/* PreviewModal — Quick-preview gallery for prompt samples */
import { X, Share2, ImageOff, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PromptThumbnail from './PromptThumbnail';

export default function PreviewModal({ prompt, onClose }) {
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!prompt) return null;

  const s0 = prompt.samples?.[0];
  const s1 = prompt.samples?.[1];
  const s2 = prompt.samples?.[2];
  const title = prompt.title || prompt.name || 'Preview';
  const hasSamples = s0 || s1 || s2;
  const promptId = prompt.id || prompt._id;

  const handleShare = () => {
    const url = `${window.location.origin}/prompt/${promptId}`;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setToast(true);
        setTimeout(() => setToast(false), 2500);
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const goToDetail = () => {
    onClose();
    navigate(`/prompt/${promptId}`);
  };

  return (
    <div className="preview-modal-overlay" onClick={handleOverlayClick}>
      <div className="preview-modal">
        {/* Header */}
        <div className="preview-modal__header">
          <h3 className="preview-modal__title">{title}</h3>
          <div className="preview-modal__actions">
            <button className="preview-modal__detail-btn" onClick={goToDetail}>
              View Details <ArrowRight size={14} />
            </button>
            <button className="preview-modal__share-btn" onClick={handleShare}>
              <Share2 size={16} /> Share
            </button>
            <button className="preview-modal__close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body — clicking the gallery opens prompt detail */}
        <div className="preview-modal__body" onClick={goToDetail} style={{ cursor: 'pointer' }}>
          {hasSamples ? (
            <div className="preview-modal__gallery">
              <div className="preview-modal__gallery-left">
                {s0 ? (
                  <PromptThumbnail src={s0} alt="Sample 1" type={prompt.generateType} />
                ) : (
                  <div className="preview-modal__no-samples"><ImageOff size={32} /></div>
                )}
              </div>
              <div className="preview-modal__gallery-right">
                <div className="preview-modal__gallery-right-item">
                  {s1 ? (
                    <PromptThumbnail src={s1} alt="Sample 2" type={prompt.generateType} />
                  ) : (
                    <div className="preview-modal__no-samples"><ImageOff size={24} /></div>
                  )}
                </div>
                <div className="preview-modal__gallery-right-item">
                  {s2 ? (
                    <PromptThumbnail src={s2} alt="Sample 3" type={prompt.generateType} />
                  ) : (
                    <div className="preview-modal__no-samples"><ImageOff size={24} /></div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-modal__no-samples">
              <ImageOff size={40} style={{ marginRight: '12px' }} /> No sample images available
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="preview-modal__toast">Link copied to clipboard!</div>}
    </div>
  );
}
