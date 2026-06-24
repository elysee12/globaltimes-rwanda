/**
 * SocialPreviewController
 *
 * Handles GET /preview/news/:slug and GET /preview/announcements/:id
 *
 * Social media crawlers (Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram, …)
 * do NOT execute JavaScript.  Because the main frontend is a React SPA, crawlers
 * receive the bare index.html shell and never see article-specific meta tags.
 *
 * This controller solves that by serving a tiny, server-rendered HTML page that
 * contains all required Open Graph and Twitter Card meta tags, populated from
 * the real article data fetched from the database.
 *
 * Real browsers are immediately redirected to the SPA URL via a <meta refresh>
 * and a JS redirect so they never stay on this page.
 *
 * How to wire up the sharing flow
 * --------------------------------
 * Option A — share /preview/news/<slug> directly (simplest).
 * Option B — configure your reverse proxy (Nginx / Caddy) to proxy requests
 *            for /news/<slug> to this backend endpoint when the User-Agent
 *            looks like a bot, and let real browser traffic pass to the SPA.
 *
 * Example Nginx rule:
 *
 *   location ~* "^/news/(.+)$" {
 *     if ($http_user_agent ~* "facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|googlebot") {
 *       proxy_pass http://localhost:3000/preview/news/$1;
 *       break;
 *     }
 *     try_files $uri /index.html;
 *   }
 */

import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { extractIdFromSlug } from '../utils/slug.util';

// ---------------------------------------------------------------------------
// Bot detection
// ---------------------------------------------------------------------------

/** Lower-cased substrings found in social-crawler User-Agent strings. */
const BOT_UA_PATTERNS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'applebot',
  'pinterest',
  'vkshare',
  'w3c_validator',
  'ia_archiver',
  'embedly',
  'rogerbot',
  'quora link preview',
  'outbrain',
  'viber',
  'skype',
  'msnbot',
  'yandexbot',
  'duckduckbot',
];

function isBotUserAgent(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => lower.includes(p));
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip HTML tags from a string so it is safe as a meta content value. */
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

interface OgOptions {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string; // SPA article URL (the URL users actually share)
  previewUrl: string;   // This endpoint's URL (for og:url so crawlers use it)
  author: string;
  publishedAt: string | null;
  siteName: string;
  spaUrl: string;       // Frontend base URL, used in the redirect script
}

function buildPreviewHtml(o: OgOptions): string {
  const title = escHtml(o.title);
  const desc = escHtml(o.description.slice(0, 300));
  const image = escHtml(o.imageUrl);
  const canonical = escHtml(o.canonicalUrl);
  const author = escHtml(o.author);
  const site = escHtml(o.siteName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- ── Page title & SEO ─────────────────────────────────────────────── -->
  <title>${title} | ${site}</title>
  <meta name="description" content="${desc}" />
  <meta name="author" content="${author}" />
  <link rel="canonical" href="${canonical}" />
  ${o.publishedAt ? `<meta name="article:published_time" content="${escHtml(o.publishedAt)}" />` : ''}

  <!-- ── Open Graph ───────────────────────────────────────────────────── -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${site}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  ${o.publishedAt ? `<meta property="article:published_time" content="${escHtml(o.publishedAt)}" />` : ''}
  <meta property="article:author" content="${author}" />

  <!-- ── Twitter Card ─────────────────────────────────────────────────── -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- ── Redirect real browsers to the SPA immediately ───────────────── -->
  <meta http-equiv="refresh" content="0;url=${canonical}" />
  <script>
    // Bots ignore <script>; real browsers land here and get redirected.
    window.location.replace(${JSON.stringify(o.canonicalUrl)});
  </script>
</head>
<body>
  <!-- Minimal visible content for accessibility and fallback text crawlers -->
  <article>
    <h1>${title}</h1>
    <p>${desc}</p>
    <p><strong>Author:</strong> ${author}</p>
    ${o.publishedAt ? `<p><time datetime="${escHtml(o.publishedAt)}">${new Date(o.publishedAt).toLocaleDateString()}</time></p>` : ''}
    <p><a href="${canonical}">Read the full article on ${site}</a></p>
  </article>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

@Controller('preview')
export class SocialPreviewController {
  constructor(private readonly prisma: PrismaService) {}

  // ── News article preview ──────────────────────────────────────────────────

  @Get('news/:slug')
  async previewNews(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const frontendUrl = this.getFrontendUrl();
    const backendUrl = this.getBackendUrl(req);
    const siteName = process.env.SITE_NAME || 'Global Times Rwanda';

    // Non-bot browsers: just redirect to the SPA immediately.
    const userAgent = req.headers['user-agent'] || '';
    if (!isBotUserAgent(userAgent)) {
      // Try to find the article to redirect to its canonical slug URL
      const article = await this.findNewsBySlug(slug);
      const canonicalSlug = article?.slug || slug;
      return res.redirect(302, `${frontendUrl}/news/${canonicalSlug}`);
    }

    // Bot request: fetch article and return OG-tagged HTML
    try {
      const news = await this.findNewsBySlug(slug);

      if (!news) {
        return res
          .status(404)
          .send(this.notFoundHtml('Article not found', siteName));
      }

      const title = news.titleEN || news.titleRW || news.titleFR || siteName;
      const rawDescription =
        news.excerptEN || news.excerptRW || news.excerptFR || '';
      const description = stripHtml(rawDescription);
      const imageUrl = this.resolveImageUrl(news.image, news.images as string[] | null, backendUrl, frontendUrl);
      const canonicalUrl = `${frontendUrl}/news/${news.slug}`;

      const html = buildPreviewHtml({
        title,
        description,
        imageUrl,
        canonicalUrl,
        previewUrl: `${backendUrl}/preview/news/${news.slug}`,
        author: news.author,
        publishedAt: news.publishedAt
          ? news.publishedAt.toISOString()
          : news.createdAt.toISOString(),
        siteName,
        spaUrl: frontendUrl,
      });

      // Let social platforms cache this for 10 minutes
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(200).send(html);
    } catch {
      return res
        .status(500)
        .send(this.errorHtml('Could not load article', siteName));
    }
  }

  // ── Announcement preview ──────────────────────────────────────────────────

  @Get('announcements/:id')
  async previewAnnouncement(
    @Param('id') idParam: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const id = parseInt(idParam, 10);
    const frontendUrl = this.getFrontendUrl();
    const backendUrl = this.getBackendUrl(req);
    const siteName = process.env.SITE_NAME || 'Global Times Rwanda';
    const canonicalUrl = `${frontendUrl}/announcements/${id}`;

    const userAgent = req.headers['user-agent'] || '';
    if (!isBotUserAgent(userAgent)) {
      return res.redirect(302, canonicalUrl);
    }

    if (isNaN(id)) {
      return res.status(400).send(this.notFoundHtml('Invalid ID', siteName));
    }

    try {
      const ann = await this.prisma.announcement.findUnique({ where: { id } });

      if (!ann) {
        return res
          .status(404)
          .send(this.notFoundHtml('Announcement not found', siteName));
      }

      const title =
        ann.titleEN || ann.titleRW || ann.titleFR || 'Announcement';
      const rawDesc =
        ann.descriptionEN || ann.descriptionRW || ann.descriptionFR || '';
      const description = stripHtml(rawDesc);
      const imageUrl = ann.image
        ? this.resolveImageUrl(ann.image, null, backendUrl, frontendUrl)
        : `${frontendUrl}/og-default.png`;

      const html = buildPreviewHtml({
        title,
        description,
        imageUrl,
        canonicalUrl,
        previewUrl: `${backendUrl}/preview/announcements/${id}`,
        author: siteName,
        publishedAt: ann.createdAt.toISOString(),
        siteName,
        spaUrl: frontendUrl,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(200).send(html);
    } catch {
      return res
        .status(500)
        .send(this.errorHtml('Could not load announcement', siteName));
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Finds a news article by exact slug, then falls back to extracting the
   * trailing numeric ID for backward-compatible old-format URLs.
   */
  private async findNewsBySlug(slug: string) {
    // 1. Exact slug match
    let news = await this.prisma.news.findUnique({ where: { slug } });
    if (news) return news;

    // 2. Extract trailing ID from slug (handles "article-42" or bare "42")
    const id = extractIdFromSlug(slug);
    if (!isNaN(id)) {
      news = await this.prisma.news.findUnique({ where: { id } });
    }

    return news ?? null;
  }

  /** Returns the absolute URL to the article's featured image. */
  private resolveImageUrl(
    image: string | null,
    images: string[] | null,
    backendUrl: string,
    frontendUrl: string,
  ): string {
    const raw = image || (Array.isArray(images) && images.length > 0 ? images[0] : null);

    if (!raw) return `${frontendUrl}/og-default.png`;

    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    // Relative path — prepend backend URL
    const clean = raw.replace(/^\/+/, '');
    return `${backendUrl}/${clean}`;
  }

  private getFrontendUrl(): string {
    return (
      (process.env.FRONTEND_URL || '').split(',')[0].trim() ||
      'http://localhost:8080'
    );
  }

  private getBackendUrl(req: Request): string {
    return (
      process.env.BACKEND_URL?.trim() ||
      `${req.protocol}://${req.get('host')}`
    );
  }

  private notFoundHtml(msg: string, siteName: string): string {
    return `<!DOCTYPE html><html><head><title>${escHtml(msg)} | ${escHtml(siteName)}</title></head><body><h1>${escHtml(msg)}</h1></body></html>`;
  }

  private errorHtml(msg: string, siteName: string): string {
    return `<!DOCTYPE html><html><head><title>Error | ${escHtml(siteName)}</title></head><body><h1>${escHtml(msg)}</h1></body></html>`;
  }
}
