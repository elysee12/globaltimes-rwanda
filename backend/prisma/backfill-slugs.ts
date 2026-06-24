/**
 * One-time script: back-fill slug for all existing news articles.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json -e "require('./prisma/backfill-slugs.ts')"
 * OR simply:
 *   npx ts-node prisma/backfill-slugs.ts
 *
 * Safe to run multiple times — it regenerates every slug from titleEN + id.
 */

import { PrismaClient } from '@prisma/client';

// ── Inline slug logic (mirrors src/utils/slug.util.ts) ──────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

function generateNewsSlug(titleEN: string, id: number): string {
  const base = slugify(titleEN) || 'article';
  return `${base}-${id}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const prisma = new PrismaClient();

  try {
    const articles = await prisma.news.findMany({
      select: { id: true, titleEN: true, slug: true },
    });

    console.log(`Found ${articles.length} articles to process.`);

    let updated = 0;
    let skipped = 0;

    for (const article of articles) {
      const correctSlug = generateNewsSlug(article.titleEN, article.id);

      if (article.slug === correctSlug) {
        skipped++;
        continue;
      }

      await prisma.news.update({
        where: { id: article.id },
        data: { slug: correctSlug },
      });

      console.log(`  [${article.id}] "${article.titleEN.slice(0, 60)}" → ${correctSlug}`);
      updated++;
    }

    console.log(`\nDone. Updated: ${updated}, Already correct: ${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Back-fill failed:', err);
  process.exit(1);
});
