/**
 * Slug utility for generating SEO-friendly URL slugs from article titles.
 *
 * Strategy: `<sanitized-title>-<id>`
 * Appending the numeric ID guarantees uniqueness even when two articles
 * share the same title, and makes backward-compatible ID lookups trivial
 * (just parse the trailing segment).
 *
 * Example:
 *   generateSlug("Government Announces New Education Policy", 42)
 *   => "government-announces-new-education-policy-42"
 */

/**
 * Converts a plain title string into a URL-safe slug fragment.
 * - Lowercases everything
 * - Replaces accented characters with their ASCII equivalents
 * - Keeps only alphanumeric characters and hyphens
 * - Collapses multiple hyphens into one
 * - Trims leading/trailing hyphens
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    // Replace common accented / special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    // Replace non-alphanumeric characters (except spaces) with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace whitespace runs with a single hyphen
    .replace(/\s+/g, '-')
    // Collapse multiple hyphens
    .replace(/-{2,}/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit to 80 characters before appending the ID suffix
    .slice(0, 80)
    .replace(/-+$/, ''); // remove trailing hyphen that may appear after slice
}

/**
 * Generates the full unique slug for a news article.
 *
 * @param titleEN - The English title of the article
 * @param id      - The article's numeric primary key
 */
export function generateNewsSlug(titleEN: string, id: number): string {
  const base = slugify(titleEN) || 'article';
  return `${base}-${id}`;
}

/**
 * Extracts the numeric ID from the trailing segment of a slug.
 * Returns NaN if the slug does not end with a number.
 *
 * Example:
 *   extractIdFromSlug("government-announces-policy-42") => 42
 *   extractIdFromSlug("42")                             => 42  (pure-ID fallback)
 */
export function extractIdFromSlug(slugOrId: string): number {
  // Handle pure numeric strings (backward-compatible ID-only URLs)
  if (/^\d+$/.test(slugOrId)) {
    return parseInt(slugOrId, 10);
  }

  const parts = slugOrId.split('-');
  const last = parts[parts.length - 1];
  const parsed = parseInt(last, 10);
  return isNaN(parsed) ? NaN : parsed;
}
