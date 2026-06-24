/**
 * Date formatting utilities for Global Times Rwanda.
 * All public-facing dates use a clean, professional format.
 */

/**
 * Formats a date string or Date object into a readable publication date.
 * Output: "June 24, 2026"
 */
export function formatArticleDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Formats a date with time — used for article detail pages.
 * Output: "June 24, 2026 · 2:30 PM"
 */
export function formatArticleDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return '';
  }
}

/**
 * Returns a relative time string for recent articles, falls back to full date.
 * Output: "2 hours ago" / "3 days ago" / "June 14, 2026"
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
