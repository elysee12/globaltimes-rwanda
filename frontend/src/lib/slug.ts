/**
 * Frontend slug utilities — mirrors the backend logic in slug.util.ts
 * so the frontend can construct/parse article URLs without an extra API call.
 */

/**
 * Converts a title string into a URL-safe slug fragment.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/**
 * Returns the full slug for an article.
 * Falls back gracefully to "article-<id>" when the API-supplied slug is absent
 * (e.g. during a transition period before all articles have been re-saved).
 *
 * @param slug - The `slug` field returned by the API (may be undefined for old data)
 * @param id   - The article's numeric ID
 */
export function articleSlug(slug: string | undefined | null, id: number): string {
  if (slug && slug.trim() && !slug.startsWith('pending-') && slug !== '') {
    return slug;
  }
  return `article-${id}`;
}

/**
 * Builds the frontend route path for a news article.
 */
export function newsPath(slug: string | undefined | null, id: number): string {
  return `/news/${articleSlug(slug, id)}`;
}

/**
 * Builds the share URL for a news article.
 * When `frontendBase` is omitted the current `window.location.origin` is used.
 */
export function newsShareUrl(
  slug: string | undefined | null,
  id: number,
  frontendBase?: string,
): string {
  const base = frontendBase ?? window.location.origin;
  return `${base}${newsPath(slug, id)}`;
}
