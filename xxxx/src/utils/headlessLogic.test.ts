import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePreviewToken,
  generateSitemapXml,
  generateJsonLd,
  optimizeImageUrl,
  calculateIsrStatus,
  formatRemainingTtl,
  validateWebhookPayload,
  revalidateCacheTag,
  computeCacheMetrics,
  filterPosts,
} from './headlessLogic.ts';
import type { UnifiedPost, CacheEntry } from '../types/wordpress.ts';

const mockPost: UnifiedPost = {
  id: 101,
  databaseId: 101,
  slug: 'enterprise-nextjs-wordpress-isr',
  title: 'Scaling Enterprise WordPress with Next.js ISR',
  excerpt: 'Learn how to architect high-traffic headless WordPress sites using Next.js 15 App Router.',
  content: '<p>WordPress REST API + Next.js creates the optimal decoupled enterprise stack.</p>',
  postType: 'post',
  status: 'publish',
  date: '2026-03-15T09:00:00Z',
  modified: '2026-03-20T14:30:00Z',
  author: {
    id: 1,
    name: 'Sarah Chen',
    slug: 'sarah-chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Principal Solutions Architect',
    bio: 'Specializing in high-traffic decoupled CMS and Next.js performance.',
  },
  featuredImage: {
    id: 501,
    sourceUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
    altText: 'Enterprise Server Cluster and Edge Caching Architecture',
    width: 1200,
    height: 630,
  },
  categories: [{ id: 1, name: 'Architecture', slug: 'architecture' }],
  tags: [{ id: 1, name: 'Next.js 15', slug: 'nextjs-15' }],
  seo: {
    title: 'Scaling Enterprise WordPress with Next.js ISR | Tech Guide',
    metaDesc: 'Step-by-step guide to headless WordPress with Next.js App Router and On-Demand ISR.',
    canonical: 'https://example.com/blog/enterprise-nextjs-wordpress-isr',
    ogType: 'article',
    ogImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
    twitterCard: 'summary_large_image',
    readingTimeMinutes: 6,
    schemaType: 'TechArticle',
  },
  cacheTag: 'posts',
  revalidateSeconds: 60,
};

test('validatePreviewToken authenticates correct secret and rejects mismatch', () => {
  const secret = 'enterprise_wp_preview_secret_9988';
  assert.equal(validatePreviewToken(secret, 'enterprise_wp_preview_secret_9988'), true);
  assert.equal(validatePreviewToken(secret, '  enterprise_wp_preview_secret_9988  '), true);
  assert.equal(validatePreviewToken(secret, 'wrong_token'), false);
  assert.equal(validatePreviewToken(secret, null), false);
  assert.equal(validatePreviewToken('', 'any'), false);
});

test('validateWebhookPayload enforces security token and validates payload', () => {
  const systemSecret = 'enterprise_wp_revalidate_secret_2026';

  // Valid dispatch
  const validOutcome = validateWebhookPayload(systemSecret, systemSecret, {
    slug: 'scaling-enterprise-wordpress-with-nextjs-isr',
    postType: 'post',
    tags: ['posts', 'post-101'],
  });
  assert.equal(validOutcome.isValid, true);
  assert.equal(validOutcome.httpStatus, 200);
  assert.deepEqual(validOutcome.tagsInvalidated, ['posts', 'post-101']);

  // Invalid secret
  const unauthOutcome = validateWebhookPayload('invalid_token', systemSecret, {
    tags: ['posts'],
  });
  assert.equal(unauthOutcome.isValid, false);
  assert.equal(unauthOutcome.httpStatus, 401);

  // Missing or null secret
  const nullOutcome = validateWebhookPayload(null, systemSecret, { tags: ['posts'] });
  assert.equal(nullOutcome.isValid, false);
  assert.equal(nullOutcome.httpStatus, 401);

  // Malformed payload
  const malformedOutcome = validateWebhookPayload(systemSecret, systemSecret, null);
  assert.equal(malformedOutcome.isValid, false);
  assert.equal(malformedOutcome.httpStatus, 400);
});

test('generateSitemapXml produces compliant XML urlset with posts and CPTs', () => {
  const xml = generateSitemapXml([mockPost], 'https://example.com');
  assert.match(xml, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.match(xml, /<loc>https:\/\/example\.com\/blog\/enterprise-nextjs-wordpress-isr<\/loc>/);
  assert.match(xml, /<lastmod>2026-03-20<\/lastmod>/);
});

test('generateJsonLd produces valid Schema.org Article metadata', () => {
  const jsonLd = generateJsonLd(mockPost, 'https://example.com');
  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'TechArticle');
  assert.equal(jsonLd['headline'], mockPost.seo.title);
  assert.deepEqual(jsonLd['author'], {
    '@type': 'Person',
    name: 'Sarah Chen',
    url: 'https://example.com/authors/sarah-chen',
  });
});

test('optimizeImageUrl returns responsive srcset and parameters', () => {
  const optimized = optimizeImageUrl(mockPost.featuredImage.sourceUrl, 828, 85, 'avif');
  assert.match(optimized.src, /_next\/image\?url=/);
  assert.match(optimized.src, /w=828/);
  assert.match(optimized.src, /q=85/);
  assert.match(optimized.src, /f=avif/);
  assert.match(optimized.srcset, /640w/);
  assert.match(optimized.srcset, /1920w/);
});

test('calculateIsrStatus identifies HIT vs STALE vs MISS states', () => {
  const now = 1774000000000;
  // 10 seconds ago cached with 60s TTL -> HIT
  const hit = calculateIsrStatus(now - 10000, 60, now);
  assert.equal(hit.status, 'HIT');
  assert.equal(hit.ageSeconds, 10);
  assert.equal(hit.remainingTtlSeconds, 50);

  // 70 seconds ago cached with 60s TTL -> STALE
  const stale = calculateIsrStatus(now - 70000, 60, now);
  assert.equal(stale.status, 'STALE');
  assert.equal(stale.remainingTtlSeconds, 0);

  // Not cached -> MISS
  const miss = calculateIsrStatus(0, 60, now);
  assert.equal(miss.status, 'MISS');
});

test('formatRemainingTtl formats seconds into human readable countdown strings', () => {
  assert.equal(formatRemainingTtl(0), '0s (Expired)');
  assert.equal(formatRemainingTtl(-5), '0s (Expired)');
  assert.equal(formatRemainingTtl(45), '45s');
  assert.equal(formatRemainingTtl(125), '2m 5s');
  assert.equal(formatRemainingTtl(180), '3m');
  assert.equal(formatRemainingTtl(3660), '1h 1m');
  assert.equal(formatRemainingTtl(7200), '2h');
});

test('revalidateCacheTag invalidates matching tagged entries on demand', () => {
  const initialCache: Record<string, CacheEntry> = {
    'post-101': {
      key: 'post-101',
      tags: ['posts', 'post-101'],
      data: mockPost,
      cachedAt: Date.now(),
      ttl: 60,
      hits: 42,
      misses: 2,
      status: 'HIT',
    },
    'case-study-201': {
      key: 'case-study-201',
      tags: ['case_study', 'case-study-201'],
      data: { id: 201 },
      cachedAt: Date.now(),
      ttl: 120,
      hits: 15,
      misses: 1,
      status: 'HIT',
    },
  };

  const result = revalidateCacheTag(initialCache, 'posts');
  assert.deepEqual(result.revalidatedKeys, ['post-101']);
  assert.equal(result.updatedCache['post-101'].status, 'STALE');
  assert.equal(result.updatedCache['post-101'].misses, 3);
  assert.equal(result.updatedCache['case-study-201'].status, 'HIT');
});

test('computeCacheMetrics calculates hits, misses, hitRatioPercent, and chart datasets', () => {
  const metricsCache: Record<string, CacheEntry> = {
    posts: {
      key: 'posts',
      tags: ['posts'],
      data: 'data',
      cachedAt: Date.now(),
      ttl: 60,
      hits: 90,
      misses: 10,
      status: 'HIT',
    },
  };

  const metrics = computeCacheMetrics(metricsCache);
  assert.equal(metrics.totalHits, 90);
  assert.equal(metrics.totalMisses, 10);
  assert.equal(metrics.totalRequests, 100);
  assert.equal(metrics.hitRatioPercent, 90);
  assert.equal(metrics.tagData.length, 1);
  assert.equal(metrics.pieData[0].value, 90);
  assert.equal(metrics.pieData[1].value, 10);
});

test('filterPosts filters by postType, search query, and draft status', () => {
  const draftPost: UnifiedPost = {
    ...mockPost,
    id: 102,
    slug: 'draft-post',
    status: 'draft',
    title: 'Secret Draft Article',
  };

  const list = [mockPost, draftPost];

  // Without drafts
  const publicPosts = filterPosts(list, { includeDrafts: false });
  assert.equal(publicPosts.length, 1);
  assert.equal(publicPosts[0].slug, 'enterprise-nextjs-wordpress-isr');

  // With drafts
  const allPosts = filterPosts(list, { includeDrafts: true });
  assert.equal(allPosts.length, 2);

  // Search filter
  const searchResult = filterPosts(list, { searchTerm: 'secret', includeDrafts: true });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 102);
});
