import type { UnifiedPost, StarterFile } from '../types/wordpress.ts';

export const INITIAL_POSTS: UnifiedPost[] = [
  {
    id: 101,
    databaseId: 101,
    slug: 'scaling-enterprise-wordpress-with-nextjs-isr',
    title: 'Scaling Enterprise WordPress with Next.js ISR & Edge Revalidation',
    excerpt: 'How to decouple WordPress from front-end traffic using Next.js 15 App Router, Incremental Static Regeneration (ISR), and tag-based cache purges.',
    content: `
      <h2>The Enterprise Dilemma: WordPress Scaling vs. Front-End Speed</h2>
      <p>Traditional monolithic WordPress setups collapse under massive viral traffic spikes due to MySQL query contention, unoptimized PHP processing, and dynamic page generation on every uncached request. Moving to a <strong>Headless WordPress + Next.js architecture</strong> decouples the database from the public traffic layer.</p>
      
      <blockquote>
        "By offloading 99.4% of read requests to Edge CDNs with Next.js Incremental Static Regeneration (ISR), our database CPU utilization dropped from 89% during traffic spikes to under 4%."
      </blockquote>

      <h3>Architecture Overview</h3>
      <p>In this production-ready setup:</p>
      <ul>
        <li><strong>WordPress Core</strong> runs as an isolated editorial back-office (WP VIP, WP Engine, or Bedrock Docker).</li>
        <li><strong>WPGraphQL & REST API</strong> act as the unified data delivery highway.</li>
        <li><strong>Next.js 15 App Router</strong> generates static HTML pages via <code>generateStaticParams()</code> and serves them with stale-while-revalidate caching headers.</li>
        <li><strong>WordPress Save Post Hooks</strong> trigger authenticated HTTP POST webhooks to <code>/api/revalidate</code> to purge tagged cache entries in &lt;100ms.</li>
      </ul>

      <h3>Code Pattern: On-Demand Tag Revalidation</h3>
      <pre><code class="language-typescript">// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.WP_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { postType, slug, tags } = await request.json();
  // Purge specific cache tag
  tags?.forEach((tag: string) => revalidateTag(tag));
  revalidateTag('posts');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}</code></pre>

      <h3>Real-World Performance Benchmarks</h3>
      <p>Comparing raw TTFB (Time to First Byte) and LCP (Largest Contentful Paint) across high-concurrency testing (5,000 req/sec):</p>
      <ul>
        <li>Monolithic WordPress + FastCGI cache: 480ms TTFB under load, 2.8s LCP</li>
        <li>Headless Next.js on Edge CDN (ISR): <strong>28ms TTFB</strong>, <strong>0.6s LCP</strong></li>
      </ul>
    `,
    postType: 'post',
    status: 'publish',
    date: '2026-03-24T10:00:00Z',
    modified: '2026-03-28T16:45:00Z',
    author: {
      id: 1,
      name: 'Elena Rostova',
      slug: 'elena-rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'Staff Infrastructure Architect',
      bio: 'Leading high-throughput decoupled CMS architectures and Vercel Edge deployments.',
    },
    featuredImage: {
      id: 501,
      sourceUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      altText: 'Global distributed network topology and cloud edge caching',
      width: 1200,
      height: 630,
      caption: 'Distributed Edge nodes serving pre-rendered headless pages worldwide.',
    },
    categories: [
      { id: 1, name: 'Architecture', slug: 'architecture' },
      { id: 2, name: 'Performance', slug: 'performance' },
    ],
    tags: [
      { id: 1, name: 'Next.js 15', slug: 'nextjs-15' },
      { id: 2, name: 'ISR', slug: 'isr' },
      { id: 3, name: 'Edge Caching', slug: 'edge-caching' },
    ],
    seo: {
      title: 'Scaling Enterprise WordPress with Next.js ISR & Edge Revalidation | Headless Starter',
      metaDesc: 'Discover how enterprise engineering teams decouple WordPress with Next.js 15 App Router and sub-100ms on-demand ISR revalidation.',
      canonical: 'https://starter.headless-wp.io/blog/scaling-enterprise-wordpress-with-nextjs-isr',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 7,
      schemaType: 'TechArticle',
    },
    cacheTag: 'posts',
    revalidateSeconds: 60,
  },
  {
    id: 102,
    databaseId: 102,
    slug: 'securing-headless-wordpress-cors-jwt-preview',
    title: 'Securing Headless WordPress: CORS, JWT Auth & Draft Mode',
    excerpt: 'Hardening headless WordPress deployments: private preview drafts, IP allowlisting, JWT bearer rotation, and secure Next.js preview tokens.',
    content: `
      <h2>Hardening WordPress as a Private Backend API</h2>
      <p>When you detach the frontend, your WordPress instance should no longer be publicly accessible on arbitrary routes. In enterprise security architecture, WordPress is shielded behind private VPCs or strict Cloudflare WAF rules, exposing only authenticated endpoints.</p>

      <h3>1. Securing REST & WPGraphQL Endpoints</h3>
      <p>Ensure that all non-public queries require an authenticated Application Password or JWT Bearer Token. Disable unneeded default REST routes like <code>/wp/v2/users</code> for unauthenticated callers to prevent username enumeration.</p>

      <h3>2. Next.js 15 Draft Mode Implementation</h3>
      <p>Editors need to preview unpublished drafts in real time without publishing. Next.js 15 provides <code>draftMode()</code> which sets a secure, HTTP-only cookie to bypass the static ISR cache and fetch fresh draft data.</p>
      
      <pre><code class="language-typescript">// app/api/draft/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (secret !== process.env.WP_PREVIEW_SECRET || !slug) {
    return new Response('Invalid token or missing slug', { status: 401 });
  }

  // Enable Draft Mode cookies in Next.js
  const draft = await draftMode();
  draft.enable();

  redirect(\`/blog/\${slug}\`);
}</code></pre>
    `,
    postType: 'post',
    status: 'publish',
    date: '2026-03-20T14:15:00Z',
    modified: '2026-03-25T11:20:00Z',
    author: {
      id: 2,
      name: 'Marcus Vance',
      slug: 'marcus-vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Principal Security Engineer',
      bio: 'Enterprise application security, OAuth2, and Zero-Trust infrastructure.',
    },
    featuredImage: {
      id: 502,
      sourceUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      altText: 'Cybersecurity lock and encrypted data transmission streams',
      width: 1200,
      height: 630,
    },
    categories: [
      { id: 3, name: 'Security', slug: 'security' },
      { id: 1, name: 'Architecture', slug: 'architecture' },
    ],
    tags: [
      { id: 4, name: 'JWT', slug: 'jwt' },
      { id: 5, name: 'Draft Mode', slug: 'draft-mode' },
      { id: 6, name: 'CORS', slug: 'cors' },
    ],
    seo: {
      title: 'Securing Headless WordPress: CORS, JWT Auth & Draft Mode',
      metaDesc: 'A complete guide to security, authentication, and live draft previews in headless WordPress and Next.js.',
      canonical: 'https://starter.headless-wp.io/blog/securing-headless-wordpress-cors-jwt-preview',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 5,
      schemaType: 'TechArticle',
    },
    cacheTag: 'posts',
    revalidateSeconds: 60,
  },
  {
    id: 103,
    databaseId: 103,
    slug: 'high-throughput-wpgraphql-dataloader-caching',
    title: 'High-Throughput WPGraphQL Queries: DataLoader & Query Batching',
    excerpt: 'Eliminating the N+1 query problem in WPGraphQL for enterprise editorial workflows using persistent queries and query batching.',
    content: `
      <h2>Solving N+1 Queries in Headless WordPress</h2>
      <p>When requesting posts with authors, categories, tags, and custom fields through standard REST APIs, frontends can easily trigger dozens of sequential HTTP waterfalls. <strong>WPGraphQL</strong> unifies these into a single query.</p>
      
      <p>However, without proper server-side optimization, GraphQL resolvers can query MySQL in loops. By implementing WPGraphQL Smart Cache and DataLoader patterns, query execution time drops by over 80%.</p>
    `,
    postType: 'post',
    status: 'publish',
    date: '2026-03-12T08:30:00Z',
    modified: '2026-03-14T09:10:00Z',
    author: {
      id: 1,
      name: 'Elena Rostova',
      slug: 'elena-rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'Staff Infrastructure Architect',
      bio: 'Leading high-throughput decoupled CMS architectures and Vercel Edge deployments.',
    },
    featuredImage: {
      id: 503,
      sourceUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      altText: 'Data analytics graph and high-speed data query pipelines',
      width: 1200,
      height: 630,
    },
    categories: [{ id: 1, name: 'Architecture', slug: 'architecture' }],
    tags: [
      { id: 7, name: 'WPGraphQL', slug: 'wpgraphql' },
      { id: 8, name: 'Performance', slug: 'performance' },
    ],
    seo: {
      title: 'High-Throughput WPGraphQL Queries: DataLoader & Query Batching',
      metaDesc: 'Optimize WPGraphQL queries with DataLoader and smart caching for enterprise scale.',
      canonical: 'https://starter.headless-wp.io/blog/high-throughput-wpgraphql-dataloader-caching',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 4,
      schemaType: 'TechArticle',
    },
    cacheTag: 'posts',
    revalidateSeconds: 60,
  },
  // Custom Post Type: Case Study 1
  {
    id: 201,
    databaseId: 201,
    slug: 'fintech-portal-migration-120m-pageviews',
    title: 'Case Study: 120M Monthly Pageviews on Decoupled WP + Next.js',
    excerpt: 'How a tier-1 multinational banking institution transitioned from a fragile monolithic WordPress VIP setup to a zero-downtime Next.js 15 Edge deployment.',
    content: `
      <h2>The Challenge: High-Frequency Compliance & Traffic Surges</h2>
      <p>The client operated 42 international web portals with strict regulatory audit requirements. Their monolithic WordPress VIP install suffered frequent timeout errors during quarterly earnings announcements when traffic surged to 45,000 requests per minute.</p>

      <h3>Architectural Solution</h3>
      <p>We designed a hybrid Headless topology:</p>
      <ul>
        <li><strong>WordPress Core</strong> deployed in a private AWS VPC behind AWS WAF.</li>
        <li><strong>Automated Webhooks</strong> triggered on post publication to invoke Next.js On-Demand Revalidation.</li>
        <li><strong>Static Asset Delivery</strong> optimized with Next.js <code>next/image</code> converting WordPress media library uploads to responsive AVIF and WebP with zero CPU load on the WP server.</li>
      </ul>

      <h3>Key Architectural Metrics</h3>
      <p>Outcome after 12 months in production:</p>
      <ul>
        <li><strong>99.998% Uptime</strong> maintained through three viral market cycles.</li>
        <li><strong>92% reduction</strong> in WordPress hosting infrastructure spend.</li>
        <li><strong>Perfect 100/100 Core Web Vitals</strong> scores globally.</li>
      </ul>
    `,
    postType: 'case_study',
    status: 'publish',
    date: '2026-03-10T12:00:00Z',
    modified: '2026-03-18T10:00:00Z',
    author: {
      id: 1,
      name: 'Elena Rostova',
      slug: 'elena-rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'Staff Infrastructure Architect',
      bio: 'Leading high-throughput decoupled CMS architectures.',
    },
    featuredImage: {
      id: 504,
      sourceUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      altText: 'Modern skyscraper financial center architectural perspective',
      width: 1200,
      height: 630,
    },
    categories: [{ id: 4, name: 'Case Studies', slug: 'case-studies' }],
    tags: [
      { id: 9, name: 'FinTech', slug: 'fintech' },
      { id: 1, name: 'Next.js 15', slug: 'nextjs-15' },
    ],
    seo: {
      title: 'Global FinTech Portal: 120M Monthly Pageviews on Decoupled WP + Next.js',
      metaDesc: 'Enterprise case study on scaling headless WordPress to 120M pageviews using Next.js 15.',
      canonical: 'https://starter.headless-wp.io/case-studies/fintech-portal-migration-120m-pageviews',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 8,
      schemaType: 'CaseStudy',
    },
    acf: {
      clientName: 'Aegis Global Wealth Partners',
      projectBudget: '$350,000',
      deploymentTarget: 'Vercel Edge Network & AWS us-east-1',
      keyMetrics: ['120M Monthly PVs', '99.998% Uptime', '24ms Edge TTFB', '100 Core Web Vitals'],
      techStack: ['Next.js 15', 'WordPress VIP', 'WPGraphQL', 'Tailwind CSS', 'TypeScript'],
      githubRepo: 'enterprise-org/headless-aegis-starter',
    },
    cacheTag: 'case-studies',
    revalidateSeconds: 300,
  },
  // Custom Post Type: Portfolio item
  {
    id: 301,
    databaseId: 301,
    slug: 'multi-region-edge-caching-engine',
    title: 'Multi-Region Edge Caching Engine with Cloudflare & WP VIP',
    excerpt: 'High-availability caching proxy connecting isolated WordPress editorial nodes with globally distributed Next.js rendering instances.',
    content: `
      <h2>Zero-Latency Edge Invalidation Architecture</h2>
      <p>This project showcases a production-grade infrastructure blueprint implementing Cloudflare Workers Cache-Tags in synchronization with Next.js ISR tags. When an editor clicks "Update" in WordPress Gutenberg, an asynchronous webhook triggers simultaneous cache purges across 310+ Cloudflare edge locations.</p>
    `,
    postType: 'portfolio',
    status: 'publish',
    date: '2026-02-18T10:00:00Z',
    modified: '2026-03-01T15:20:00Z',
    author: {
      id: 2,
      name: 'Marcus Vance',
      slug: 'marcus-vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Principal Security Engineer',
      bio: 'Enterprise application security.',
    },
    featuredImage: {
      id: 505,
      sourceUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      altText: 'Matrix of illuminated digital optical circuits and data highways',
      width: 1200,
      height: 630,
    },
    categories: [{ id: 5, name: 'Portfolio', slug: 'portfolio' }],
    tags: [
      { id: 10, name: 'Cloudflare', slug: 'cloudflare' },
      { id: 2, name: 'ISR', slug: 'isr' },
    ],
    seo: {
      title: 'Multi-Region Edge Caching Engine | Enterprise Portfolio',
      metaDesc: 'Edge-synchronized cache invalidation connecting WordPress and Next.js.',
      canonical: 'https://starter.headless-wp.io/portfolio/multi-region-edge-caching-engine',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 4,
      schemaType: 'Article',
    },
    acf: {
      clientName: 'Nexus Cloud Infrastructure',
      projectBudget: '$180,000',
      deploymentTarget: 'Cloudflare Workers + Vercel Enterprise',
      keyMetrics: ['310 Edge Locations', 'Sub-80ms Global Purge', '99.9% Cache Hit Ratio'],
      techStack: ['TypeScript', 'Cloudflare Workers', 'Next.js App Router', 'WordPress REST API'],
    },
    cacheTag: 'portfolio',
    revalidateSeconds: 300,
  },
  // Custom Post Type: Documentation
  {
    id: 401,
    databaseId: 401,
    slug: 'webhooks-setup-guide-on-demand-revalidation',
    title: 'Headless WP Webhooks & On-Demand Revalidation Config',
    excerpt: 'Detailed operational runbook for configuring WordPress action hooks (save_post, edit_post, delete_post) to trigger Next.js revalidation endpoints.',
    content: `
      <h2>Setting Up the WordPress Revalidation Webhook</h2>
      <p>Follow this production guide to configure the WordPress webhook mechanism. You can use standard PHP functions in a mu-plugin (Must-Use Plugin) or a specialized plugin like WP Webhooks.</p>

      <h3>PHP mu-plugin: <code>wp-content/mu-plugins/nextjs-revalidate.php</code></h3>
      <pre><code class="language-php">&lt;?php
/**
 * Plugin Name: Next.js On-Demand ISR Webhook
 * Description: Dispatches signed revalidation events to Next.js on content updates.
 */

add_action('save_post', function($post_id, $post, $update) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    $secret = defined('NEXTJS_REVALIDATE_SECRET') ? NEXTJS_REVALIDATE_SECRET : 'default_secret';
    $frontend_url = defined('NEXTJS_FRONTEND_URL') ? NEXTJS_FRONTEND_URL : 'https://frontend.domain.com';

    $payload = [
        'id' =&gt; $post_id,
        'postType' =&gt; $post-&gt;post_type,
        'slug' =&gt; $post-&gt;post_name,
        'tags' =&gt; ['posts', 'post-' . $post_id, $post-&gt;post_type],
    ];

    wp_remote_post($frontend_url . '/api/revalidate?secret=' . urlencode($secret), [
        'headers' =&gt; ['Content-Type' =&gt; 'application/json'],
        'body' =&gt; json_encode($payload),
        'timeout' =&gt; 5,
        'blocking' =&gt; false, // Asynchronous fire-and-forget!
    ]);
}, 10, 3);
</code></pre>
    `,
    postType: 'doc',
    status: 'publish',
    date: '2026-03-05T09:00:00Z',
    modified: '2026-03-22T14:00:00Z',
    author: {
      id: 2,
      name: 'Marcus Vance',
      slug: 'marcus-vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Principal Security Engineer',
      bio: 'Enterprise application security.',
    },
    featuredImage: {
      id: 506,
      sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      altText: 'Software code editor screen with modern syntax highlighting',
      width: 1200,
      height: 630,
    },
    categories: [{ id: 6, name: 'Documentation', slug: 'docs' }],
    tags: [
      { id: 11, name: 'Webhooks', slug: 'webhooks' },
      { id: 2, name: 'ISR', slug: 'isr' },
    ],
    seo: {
      title: 'Headless WP Webhooks & On-Demand Revalidation Config | Docs',
      metaDesc: 'Operational guide to setting up WordPress mu-plugins and Next.js revalidation webhooks.',
      canonical: 'https://starter.headless-wp.io/docs/webhooks-setup-guide-on-demand-revalidation',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 5,
      schemaType: 'TechArticle',
    },
    acf: {
      docsVersion: 'v2.4.0',
      deploymentTarget: 'WordPress 6.7+ & Next.js 15.2+',
      techStack: ['PHP 8.3', 'Next.js App Router', 'cURL / wp_remote_post'],
    },
    cacheTag: 'docs',
    revalidateSeconds: 600,
  },
  // Unpublished Draft Post (available in Draft / Preview mode!)
  {
    id: 999,
    databaseId: 999,
    slug: 'nextjs-15-partial-prerendering-ppr-preview',
    title: '[DRAFT] Next.js 15 Partial Prerendering (PPR) + WordPress Dynamic Comments',
    excerpt: 'Confidential draft: Combining static page shells from WordPress with dynamic edge-streamed personalized comments and user ratings.',
    content: `
      <h2>PREVIEW DRAFT: Partial Prerendering (PPR) in Headless WordPress</h2>
      <p><em>Notice: This article is currently in DRAFT status in WordPress and only visible because you have authenticated with the Draft Preview Secret Token.</em></p>
      
      <p>Partial Prerendering (PPR) combines the speed of static edge caching with the dynamism of server-rendered components. In this architectural breakdown, the WordPress article body is statically prerendered at build time, while the live user comment feed and personalized reaction counters are streamed via React Suspense.</p>
    `,
    postType: 'post',
    status: 'draft',
    date: '2026-04-01T15:00:00Z',
    modified: '2026-04-01T15:30:00Z',
    author: {
      id: 1,
      name: 'Elena Rostova',
      slug: 'elena-rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'Staff Infrastructure Architect',
      bio: 'Leading high-throughput decoupled CMS architectures.',
    },
    featuredImage: {
      id: 507,
      sourceUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      altText: 'Abstract 3D luminous glass spheres representing micro-frontend streaming',
      width: 1200,
      height: 630,
    },
    categories: [{ id: 1, name: 'Architecture', slug: 'architecture' }],
    tags: [
      { id: 12, name: 'PPR', slug: 'ppr' },
      { id: 1, name: 'Next.js 15', slug: 'nextjs-15' },
    ],
    seo: {
      title: '[DRAFT] Next.js 15 Partial Prerendering (PPR) + WordPress',
      metaDesc: 'Preview draft: Partial Prerendering in enterprise headless WordPress.',
      canonical: 'https://starter.headless-wp.io/blog/nextjs-15-partial-prerendering-ppr-preview',
      ogType: 'article',
      ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      readingTimeMinutes: 3,
      schemaType: 'Article',
    },
    cacheTag: 'posts',
    revalidateSeconds: 0,
  },
];

export const MOCK_GRAPHQL_QUERIES = [
  {
    name: 'GetPostsWithAuthorAndSEO',
    description: 'Fetches paginated posts with featured media, author details, and Yoast SEO structured metadata.',
    query: `query GetPostsWithAuthorAndSEO($first: Int = 10, $after: String) {
  posts(first: $first, after: $after, where: { status: PUBLISH }) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      databaseId
      slug
      title
      excerpt
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      author {
        node {
          name
          slug
          avatar {
            url
          }
        }
      }
      seo {
        title
        metaDesc
        canonical
        opengraphType
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
}`,
    variables: JSON.stringify({ first: 5, after: null }, null, 2),
  },
  {
    name: 'GetCaseStudiesWithACF',
    description: 'Queries Custom Post Type "case_study" with Advanced Custom Fields (client, budget, metrics).',
    query: `query GetCaseStudiesWithACF {
  caseStudies(first: 10) {
    nodes {
      id
      title
      slug
      caseStudyFields {
        clientName
        projectBudget
        keyMetrics
        deploymentTarget
        techStack
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
}`,
    variables: '{}',
  },
  {
    name: 'GetDraftPostForPreview',
    description: 'Authenticated query to retrieve draft revisions with JWT Bearer header.',
    query: `query GetDraftPostForPreview($id: ID!) {
  post(id: $id, idType: DATABASE_ID, asPreview: true) {
    id
    title
    content
    status
    revisions(first: 1) {
      nodes {
        id
        title
        content
        date
      }
    }
  }
}`,
    variables: JSON.stringify({ id: '999' }, null, 2),
  },
];

export const STARTER_CODEBASE_FILES: StarterFile[] = [
  {
    path: 'lib/wordpress.ts',
    category: 'core',
    description: 'Enterprise TypeScript API client for WordPress GraphQL & REST with built-in fetch caching tags & retry logic.',
    code: `/**
 * Enterprise Headless WordPress Client
 * Implements Next.js 15 fetch caching tags, error boundaries, and WPGraphQL.
 */

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://cms.example.com/graphql';
const WP_AUTH_REFRESH_TOKEN = process.env.WP_AUTH_REFRESH_TOKEN;

interface FetchOptions extends RequestInit {
  tags?: string[];
  revalidate?: number | false;
}

export async function fetchWpGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  options: FetchOptions = {}
): Promise<T> {
  const { tags = ['wordpress'], revalidate = 60, headers, ...rest } = options;

  const res = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(WP_AUTH_REFRESH_TOKEN ? { Authorization: \`Bearer \${WP_AUTH_REFRESH_TOKEN}\` } : {}),
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    next: {
      tags,
      revalidate,
    },
    ...rest,
  });

  if (!res.ok) {
    throw new Error(\`[WPGraphQL] Request failed with status \${res.status}: \${await res.text()}\`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error('[WPGraphQL Errors]', json.errors);
    throw new Error(json.errors.map((e: any) => e.message).join('; '));
  }

  return json.data;
}

export async function getPostBySlug(slug: string, isDraft = false) {
  const query = \`
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG, asPreview: \${isDraft}) {
        id
        databaseId
        slug
        title
        content
        excerpt
        date
        modified
        author { node { name slug avatar { url } } }
        featuredImage { node { sourceUrl altText mediaDetails { width height } } }
        categories { nodes { name slug } }
        seo { title metaDesc canonical opengraphImage { sourceUrl } }
      }
    }
  \`;
  return fetchWpGraphQL(query, { slug }, { tags: ['posts', \`post-\${slug}\`] });
}
`,
  },
  {
    path: 'app/blog/[slug]/page.tsx',
    category: 'routing',
    description: 'Dynamic route page component with generateStaticParams, generateMetadata, ISR, and responsive WP Image.',
    code: `import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, fetchWpGraphQL } from '@/lib/wordpress';
import { WpImage } from '@/components/WpImage';
import { draftMode } from 'next/headers';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Default ISR interval: 60s
export const dynamicParams = true; // On-demand generation for new posts!

// Generate static routes for the top 50 posts at build time
export async function generateStaticParams() {
  const data = await fetchWpGraphQL(\`
    query GetStaticSlugs {
      posts(first: 50) { nodes { slug } }
    }
  \`, {}, { revalidate: 3600 });

  return data?.posts?.nodes?.map((node: { slug: string }) => ({
    slug: node.slug,
  })) || [];
}

// Enterprise Dynamic SEO generation (Yoast / RankMath fields)
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  const post = data?.post;
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.metaDesc || post.excerpt,
    alternates: { canonical: post.seo?.canonical },
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.metaDesc || post.excerpt,
      images: post.seo?.opengraphImage?.sourceUrl ? [post.seo.opengraphImage.sourceUrl] : [],
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const data = await getPostBySlug(slug, isDraft);
  const post = data?.post;

  if (!post) notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {isDraft && (
        <div className="bg-amber-500/10 border border-amber-500 text-amber-300 p-4 rounded-lg mb-8">
          Preview Draft Mode Active. Live draft data loaded directly from WordPress.
        </div>
      )}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-slate-400">
          <span>By {post.author?.node?.name}</span>
          <span>•</span>
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
        </div>
      </header>

      {post.featuredImage?.node && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-10">
          <WpImage
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <div
        className="prose prose-invert max-w-none text-slate-300"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
`,
  },
  {
    path: 'app/api/revalidate/route.ts',
    category: 'api',
    description: 'On-demand ISR webhook endpoint for instant edge cache invalidation when posts update in WordPress.',
    code: `import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Validate shared secret token
  if (secret !== process.env.WP_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, postType, tags } = body;

    // 1. Tag-based invalidation (Instant & targeted)
    if (Array.isArray(tags)) {
      tags.forEach((tag: string) => revalidateTag(tag));
    }
    revalidateTag('posts');

    // 2. Specific path invalidation
    if (slug) {
      const path = postType === 'case_study' ? \`/case-studies/\${slug}\` : \`/blog/\${slug}\`;
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      invalidatedTags: tags || ['posts'],
      slug,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Error parsing webhook payload', error: err.message }, { status: 500 });
  }
}
`,
  },
  {
    path: 'app/api/draft/route.ts',
    category: 'api',
    description: 'Next.js 15 Draft Mode handler for authorized editorial previews of unpublished content.',
    code: `import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const postType = searchParams.get('postType') || 'post';

  if (secret !== process.env.WP_PREVIEW_SECRET || !slug) {
    return new Response('Invalid preview authorization token or missing slug', { status: 401 });
  }

  // Enable draft mode cookies
  const draft = await draftMode();
  draft.enable();

  const redirectPath = postType === 'case_study' ? \`/case-studies/\${slug}\` : \`/blog/\${slug}\`;
  redirect(redirectPath);
}
`,
  },
  {
    path: 'app/sitemap.ts',
    category: 'routing',
    description: 'Dynamic Next.js 15 XML Sitemap generator crawling published WordPress posts and Custom Post Types.',
    code: `import { MetadataRoute } from 'next';
import { fetchWpGraphQL } from '@/lib/wordpress';

export const revalidate = 86400; // 24 hours ISR

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://starter.headless-wp.io';

  const data = await fetchWpGraphQL(\`
    query GetSitemapEntries {
      posts(first: 100, where: { status: PUBLISH }) {
        nodes {
          slug
          modified
          date
        }
      }
      caseStudies(first: 50) {
        nodes {
          slug
          modified
        }
      }
    }
  \`, {}, { tags: ['sitemap'] });

  const postsEntries = (data?.posts?.nodes || []).map((post: any) => ({
    url: \`\${SITE_URL}/blog/\${post.slug}\`,
    lastModified: new Date(post.modified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const caseStudyEntries = (data?.caseStudies?.nodes || []).map((cs: any) => ({
    url: \`\${SITE_URL}/case-studies/\${cs.slug}\`,
    lastModified: new Date(cs.modified || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    { url: \`\${SITE_URL}/\`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: \`\${SITE_URL}/blog\`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: \`\${SITE_URL}/case-studies\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...postsEntries,
    ...caseStudyEntries,
  ];
}
`,
  },
  {
    path: 'components/WpImage.tsx',
    category: 'components',
    description: 'Enterprise image component wrapping next/image with AVIF/WebP fallback, blur-up placeholder, and aspect ratio.',
    code: `import Image, { ImageProps } from 'next/image';

interface WpImageProps extends Omit<ImageProps, 'placeholder'> {
  blurDataUrl?: string;
}

export function WpImage({
  src,
  alt,
  blurDataUrl,
  quality = 80,
  ...props
}: WpImageProps) {
  // WordPress featured images optimized with automatic WebP/AVIF transformation
  return (
    <Image
      src={src}
      alt={alt || ''}
      quality={quality}
      placeholder={blurDataUrl ? 'blur' : 'empty'}
      blurDataURL={blurDataUrl}
      {...props}
    />
  );
}
`,
  },
  {
    path: 'docker-compose.yml',
    category: 'config',
    description: 'Production-ready local orchestration with WordPress, MySQL 8, phpMyAdmin, and WPGraphQL pre-installed.',
    code: `version: '3.8'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: enterprise_root_pass
      MYSQL_DATABASE: wordpress_headless
      MYSQL_USER: wp_user
      MYSQL_PASSWORD: wp_secure_password
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:6.7-php8.3-apache
    restart: always
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_NAME: wordpress_headless
      WORDPRESS_DB_USER: wp_user
      WORDPRESS_DB_PASSWORD: wp_secure_password
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_ENVIRONMENT_TYPE', 'development');
        define('JWT_AUTH_SECRET_KEY', 'enterprise_super_secret_jwt_key_2026');
        define('JWT_AUTH_CORS_ENABLE', true);
        define('GRAPHQL_DEBUG', true);
    volumes:
      - wp_data:/var/www/html

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_WORDPRESS_API_URL: http://wordpress/graphql
      WP_REVALIDATE_SECRET: enterprise_wp_revalidate_secret_2026
      WP_PREVIEW_SECRET: enterprise_wp_preview_secret_9988
    depends_on:
      - wordpress

volumes:
  db_data:
  wp_data:
`,
  },
  {
    path: 'next.config.js',
    category: 'config',
    description: 'Next.js configuration with remote image domains for WordPress uploads, SVG support, and caching headers.',
    code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cms.example.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`,
  },
];
