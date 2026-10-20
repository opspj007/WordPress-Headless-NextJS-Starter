/**
 * Pure functions for Headless WordPress & Next.js logic.
 * Decoupled from React to enable ultra-fast native unit tests.
 */

import type { UnifiedPost, PostType, CacheEntry } from '../types/wordpress.ts';

/**
 * Validates Next.js Draft Preview Secret Token.
 * Matches Next.js App Router draftMode() API authentication pattern.
 */
export function validatePreviewToken(systemSecret: string, providedToken?: string | null): boolean {
  if (!systemSecret || !providedToken) return false;
  return systemSecret.trim() === providedToken.trim();
}

/**
 * Generates an Enterprise XML Sitemap compliant with sitemaps.org schema.
 * Replicates Next.js 15 app/sitemap.ts output.
 */
export function generateSitemapXml(posts: UnifiedPost[], siteUrl: string): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const now = new Date().toISOString().split('T')[0];

  const staticEntries = [
    {
      loc: `${cleanSiteUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: `${cleanSiteUrl}/case-studies`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      loc: `${cleanSiteUrl}/blog`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      loc: `${cleanSiteUrl}/docs`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  const dynamicEntries = posts
    .filter((p) => p.status === 'publish')
    .map((post) => {
      let routePath = `/blog/${post.slug}`;
      let priority = '0.7';

      if (post.postType === 'case_study') {
        routePath = `/case-studies/${post.slug}`;
        priority = '0.9';
      } else if (post.postType === 'portfolio') {
        routePath = `/portfolio/${post.slug}`;
        priority = '0.8';
      } else if (post.postType === 'doc') {
        routePath = `/docs/${post.slug}`;
        priority = '0.8';
      } else if (post.postType === 'page') {
        routePath = `/${post.slug}`;
        priority = '0.8';
      }

      const lastmod = (post.modified || post.date || now).split('T')[0];
      return {
        loc: `${cleanSiteUrl}${routePath}`,
        lastmod,
        changefreq: 'weekly',
        priority,
      };
    });

  const allEntries = [...staticEntries, ...dynamicEntries];

  const urlElements = allEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>`;
}

/**
 * Generates Schema.org JSON-LD structured data for Google Search rich snippets.
 */
export function generateJsonLd(post: UnifiedPost, siteUrl: string): Record<string, unknown> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const postUrl = `${cleanSiteUrl}/${post.postType === 'post' ? 'blog' : post.postType}/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': post.seo.schemaType || 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.seo.title || post.title,
    description: post.seo.metaDesc || post.excerpt,
    image: [post.seo.ogImage || post.featuredImage.sourceUrl],
    datePublished: post.date,
    dateModified: post.modified || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${cleanSiteUrl}/authors/${post.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Headless WP Next.js Enterprise',
      logo: {
        '@type': 'ImageObject',
        url: `${cleanSiteUrl}/logo.png`,
      },
    },
  };
}

/**
 * Simulates Next.js next/image optimizer URL transformations (resizing, format, quality)
 */
export function optimizeImageUrl(
  sourceUrl: string,
  width: number,
  quality = 80,
  format: 'webp' | 'avif' | 'original' = 'webp'
): {
  src: string;
  srcset: string;
  format: string;
  width: number;
  quality: number;
} {
  const widths = [640, 750, 828, 1080, 1200, 1920];
  const queryParam = (w: number) => `/_next/image?url=${encodeURIComponent(sourceUrl)}&w=${w}&q=${quality}&f=${format}`;

  const srcset = widths.map((w) => `${queryParam(w)} ${w}w`).join(', ');

  return {
    src: queryParam(width),
    srcset,
    format,
    width,
    quality,
  };
}

/**
 * Computes ISR Cache lifecycle status (HIT, STALE, MISS) based on TTL and elapsed time.
 */
export function calculateIsrStatus(
  cachedAtMs: number,
  ttlSeconds: number,
  nowMs = Date.now()
): {
  status: 'HIT' | 'STALE' | 'MISS';
  ageSeconds: number;
  remainingTtlSeconds: number;
} {
  if (!cachedAtMs || cachedAtMs <= 0) {
    return { status: 'MISS', ageSeconds: 0, remainingTtlSeconds: 0 };
  }

  const elapsedMs = Math.max(0, nowMs - cachedAtMs);
  const ageSeconds = Math.floor(elapsedMs / 1000);
  const remainingTtlSeconds = Math.max(0, ttlSeconds - ageSeconds);

  if (ageSeconds < ttlSeconds) {
    return { status: 'HIT', ageSeconds, remainingTtlSeconds };
  }

  return { status: 'STALE', ageSeconds, remainingTtlSeconds: 0 };
}

/**
 * Formats countdown seconds into human-readable TTL string (e.g., '45s', '3m 12s', '23h 40m', '0s (Expired)').
 */
export function formatRemainingTtl(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return '0s (Expired)';
  if (remainingSeconds < 60) return `${remainingSeconds}s`;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Validates incoming WordPress webhook payload and authorization secret.
 */
export function validateWebhookPayload(
  providedSecret: string | null | undefined,
  systemSecret: string,
  payload: {
    slug?: string;
    postType?: string;
    tags?: string[];
  } | null | undefined
): {
  isValid: boolean;
  httpStatus: 200 | 400 | 401;
  statusText: string;
  reason: string;
  tagsInvalidated: string[];
} {
  if (!providedSecret || providedSecret.trim() !== systemSecret.trim()) {
    return {
      isValid: false,
      httpStatus: 401,
      statusText: '401 Unauthorized',
      reason: 'Invalid secret token: Provided token does not match system WP_REVALIDATE_SECRET.',
      tagsInvalidated: [],
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      httpStatus: 400,
      statusText: '400 Bad Request',
      reason: 'Malformed webhook body: Expected valid JSON payload with tags or slug.',
      tagsInvalidated: [],
    };
  }

  const tags = Array.isArray(payload.tags) && payload.tags.length > 0
    ? payload.tags
    : ['posts'];

  return {
    isValid: true,
    httpStatus: 200,
    statusText: '200 OK',
    reason: 'Signature verified successfully. Next.js revalidateTag executed on edge nodes.',
    tagsInvalidated: tags,
  };
}

/**
 * Simulates Next.js revalidateTag('tag') or revalidatePath('/path').
 * Sets cached entries with matching tag to invalidated state.
 */
export function revalidateCacheTag(
  cache: Record<string, CacheEntry>,
  targetTag: string
): {
  revalidatedKeys: string[];
  updatedCache: Record<string, CacheEntry>;
} {
  const revalidatedKeys: string[] = [];
  const updatedCache = { ...cache };

  for (const [key, entry] of Object.entries(updatedCache)) {
    if (entry.tags.includes(targetTag) || targetTag === '*') {
      revalidatedKeys.push(key);
      updatedCache[key] = {
        ...entry,
        cachedAt: 0, // marks immediate STALE / MISS
        misses: (entry.misses || 0) + 1,
        status: 'STALE',
      };
    }
  }

  return { revalidatedKeys, updatedCache };
}

/**
 * Computes aggregated metrics and per-tag data for Recharts data visualization.
 */
export function computeCacheMetrics(cache: Record<string, CacheEntry>): {
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
  hitRatioPercent: number;
  tagData: Array<{
    name: string;
    tag: string;
    hits: number;
    misses: number;
    ttl: number;
    status: string;
    hitRate: number;
  }>;
  pieData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
} {
  let totalHits = 0;
  let totalMisses = 0;

  const tagData = Object.values(cache).map((entry) => {
    const hits = entry.hits || 0;
    const misses = entry.misses || 0;
    const reqs = hits + misses;
    const hitRate = reqs > 0 ? Math.round((hits / reqs) * 1000) / 10 : 100;

    totalHits += hits;
    totalMisses += misses;

    return {
      name: entry.tags[0] || entry.key,
      tag: entry.tags[0] || entry.key,
      hits,
      misses,
      ttl: entry.ttl,
      status: entry.status,
      hitRate,
    };
  });

  const totalRequests = totalHits + totalMisses;
  const hitRatioPercent = totalRequests > 0
    ? Math.round((totalHits / totalRequests) * 1000) / 10
    : 100;

  const pieData = [
    { name: 'Cache Hits (Edge Served)', value: totalHits, color: '#10b981' }, // emerald-500
    { name: 'Cache Misses / Revalidated', value: totalMisses, color: '#f59e0b' }, // amber-500
  ];

  return {
    totalHits,
    totalMisses,
    totalRequests,
    hitRatioPercent,
    tagData,
    pieData,
  };
}

/**
 * Filter unified posts by Post Type and Search Query
 */
export function filterPosts(
  posts: UnifiedPost[],
  options: {
    postType?: PostType | 'all';
    searchTerm?: string;
    includeDrafts?: boolean;
  }
): UnifiedPost[] {
  const { postType = 'all', searchTerm = '', includeDrafts = false } = options;

  return posts.filter((p) => {
    // Draft gate
    if (!includeDrafts && p.status === 'draft') return false;

    // Post type filter
    if (postType !== 'all' && p.postType !== postType) return false;

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchExcerpt = p.excerpt.toLowerCase().includes(q);
      const matchAuthor = p.author.name.toLowerCase().includes(q);
      const matchCategory = p.categories.some((c) => c.name.toLowerCase().includes(q));
      const matchTags = p.tags.some((t) => t.name.toLowerCase().includes(q));
      if (!matchTitle && !matchExcerpt && !matchAuthor && !matchCategory && !matchTags) {
        return false;
      }
    }

    return true;
  });
}
