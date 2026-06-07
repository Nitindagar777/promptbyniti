/**
 * SEO Head — Dynamic page-level SEO for each route
 * Updates document.title, meta description, OG tags, Twitter cards,
 * canonical URLs, robots, and JSON-LD structured data per page.
 * 
 * Usage: <SEOHead title="..." description="..." keywords="..." />
 * 
 * Advanced:
 *   schema={...}      — Extra JSON-LD schema (object or array)
 *   breadcrumbs={[{ name: "Home", url: "/" }, { name: "Generate", url: "/generate" }]}
 *   ogType="product"  — Override default og:type (default: "website")
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
  ogType,
  noIndex = false,
  schema = null,
  breadcrumbs = null
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
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag && ogType) {
      ogTypeTag.setAttribute('content', ogType);
    } else if (ogTypeTag) {
      ogTypeTag.setAttribute('content', 'website');
    }

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

    // --- Dynamic JSON-LD Schema Injection ---
    // Only remove dynamically-injected schemas (marked with data-dynamic attribute)
    const existingDynamic = document.querySelectorAll('script[data-seo-dynamic="true"]');
    existingDynamic.forEach(el => el.remove());

    const dynamicSchemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Prompt by Niti",
        "url": BASE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/templates?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Prompt by Niti — AI Prompt Generator",
        "operatingSystem": "All",
        "applicationCategory": "DesignApplication",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD"
        },
        "description": "Professional AI prompt generator with 3 consistency engines — Text-to-Image (cref/sref), Image-to-Video (motion anchors), and Text-to-Code/Text (AIDA, PAS, agent personas). Supports Midjourney, Sora, Flux, ChatGPT, Stable Diffusion and more."
      }
    ];

    // Add breadcrumbs schema if provided
    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      dynamicSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": crumb.name,
          "item": `${BASE_URL}${crumb.url}`
        }))
      });
    }

    // Add custom page-specific schemas
    if (schema) {
      if (Array.isArray(schema)) {
        dynamicSchemas.push(...schema);
      } else {
        dynamicSchemas.push(schema);
      }
    }

    const scriptNode = document.createElement('script');
    scriptNode.type = 'application/ld+json';
    scriptNode.setAttribute('data-seo-dynamic', 'true');
    scriptNode.innerHTML = JSON.stringify(dynamicSchemas);
    document.head.appendChild(scriptNode);

    // Clean up on unmount to keep metadata clean
    return () => {
      scriptNode.remove();
    };

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, noIndex, schema, breadcrumbs, location.pathname]);

  return null;
}
