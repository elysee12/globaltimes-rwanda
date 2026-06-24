import { useEffect } from 'react';

const SITE_NAME = 'Global Times Rwanda';
const DEFAULT_DESC =
  'Breaking news, analysis, and multimedia content from Rwanda and the East African region.';
const DEFAULT_IMAGE = '/og-default.png';

interface OgMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'article' | 'website';
  author?: string;
  publishedAt?: string;
}

/**
 * Dynamically sets <head> Open Graph, Twitter Card, and standard SEO meta
 * tags from any page component.
 *
 * Resets back to site-level defaults when the component unmounts.
 *
 * Usage (NewsDetail.tsx):
 *   useOgMeta({
 *     title: localizedArticle.title,
 *     description: localizedArticle.excerpt,
 *     image: normalizeImageUrl(article.image),
 *     url: window.location.href,
 *     author: article.author,
 *     publishedAt: article.publishedAt ?? article.date,
 *   });
 */
export function useOgMeta({
  title,
  description,
  image,
  url,
  type = 'article',
  author,
  publishedAt,
}: OgMetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description?.trim() || DEFAULT_DESC;
    const img = image || DEFAULT_IMAGE;
    const pageUrl = url || window.location.href;

    /** Upsert a <meta> element in <head>. */
    const set = (
      selectorAttr: string,
      selectorVal: string,
      contentAttr: string,
      value: string,
    ) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${selectorAttr}="${selectorVal}"]`,
      );
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(selectorAttr, selectorVal);
        document.head.appendChild(el);
      }
      el.setAttribute(contentAttr, value);
    };

    // ── Standard meta ──────────────────────────────────────────────────────
    document.title = fullTitle;
    set('name', 'description', 'content', desc);
    if (author) set('name', 'author', 'content', author);

    // ── Canonical ──────────────────────────────────────────────────────────
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // ── Open Graph ─────────────────────────────────────────────────────────
    set('property', 'og:type', 'content', type);
    set('property', 'og:site_name', 'content', SITE_NAME);
    set('property', 'og:title', 'content', fullTitle);
    set('property', 'og:description', 'content', desc);
    set('property', 'og:image', 'content', img);
    set('property', 'og:url', 'content', pageUrl);
    if (publishedAt) {
      set('property', 'article:published_time', 'content', publishedAt);
    }
    if (author) {
      set('property', 'article:author', 'content', author);
    }

    // ── Twitter Card ───────────────────────────────────────────────────────
    set('name', 'twitter:card', 'content', 'summary_large_image');
    set('name', 'twitter:title', 'content', fullTitle);
    set('name', 'twitter:description', 'content', desc);
    set('name', 'twitter:image', 'content', img);

    // ── Cleanup: reset to site defaults on unmount ─────────────────────────
    return () => {
      document.title = `${SITE_NAME} - Your Trusted News Source`;
      set('name', 'description', 'content', DEFAULT_DESC);
      set('property', 'og:type', 'content', 'website');
      set('property', 'og:title', 'content', `${SITE_NAME} - Your Trusted News Source`);
      set('property', 'og:description', 'content', DEFAULT_DESC);
      set('property', 'og:image', 'content', DEFAULT_IMAGE);
      set('property', 'og:url', 'content', window.location.origin);
      if (canonical) canonical.setAttribute('href', window.location.origin);
    };
  }, [title, description, image, url, type, author, publishedAt]);
}
