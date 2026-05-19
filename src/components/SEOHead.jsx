/**
 * SEO Head — Dynamic page-level SEO for each route
 * Updates document.title and meta description per page to boost search rankings.
 * 
 * Usage: <SEOHead title="..." description="..." keywords="..." />
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_TITLE = 'Prompt by Niti';
const BASE_URL = 'https://promptbyniti.in';

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex = false
}) {
  const location = useLocation();

  useEffect(() => {
    // --- Title ---
    document.title = title 
      ? `${title} | ${BASE_TITLE}` 
      : `${BASE_TITLE} — #1 AI Prompt Generator & Marketplace`;

    // --- Meta Description ---
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }

    // --- Meta Keywords ---
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw && keywords) {
      metaKw.setAttribute('content', keywords);
    }

    // --- Canonical URL ---
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${BASE_URL}${location.pathname}`);
    }

    // --- OG Tags ---
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', ogTitle || title || `${BASE_TITLE} — #1 AI Prompt Generator & Marketplace`);
    }

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag && (ogDescription || description)) {
      ogDescTag.setAttribute('content', ogDescription || description);
    }

    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute('content', `${BASE_URL}${location.pathname}`);
    }

    if (ogImage) {
      const ogImgTag = document.querySelector('meta[property="og:image"]');
      if (ogImgTag) ogImgTag.setAttribute('content', ogImage);
    }

    // --- Twitter tags ---
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute('content', ogTitle || title || `${BASE_TITLE} — #1 AI Prompt Generator & Marketplace`);
    }

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && (ogDescription || description)) {
      twDesc.setAttribute('content', ogDescription || description);
    }

    // --- Robots (for noIndex pages) ---
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && noIndex) {
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta && !noIndex) {
      robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, noIndex, location.pathname]);

  return null; // This component renders nothing
}
