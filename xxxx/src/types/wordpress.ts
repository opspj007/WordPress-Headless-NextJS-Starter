/**
 * Enterprise WordPress + Next.js Headless Starter Architecture Types
 */

export type PostType = 'post' | 'page' | 'case_study' | 'portfolio' | 'doc';

export interface Author {
  id: number;
  name: string;
  slug: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface FeaturedImage {
  id: number;
  sourceUrl: string;
  altText: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  caption?: string;
}

export interface SeoMeta {
  title: string;
  metaDesc: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  readingTimeMinutes: number;
  schemaType: 'Article' | 'TechArticle' | 'WebPage' | 'CaseStudy';
}

export interface AdvancedCustomFields {
  clientName?: string;
  projectBudget?: string;
  deploymentTarget?: string;
  keyMetrics?: string[];
  techStack?: string[];
  githubRepo?: string;
  docsVersion?: string;
}

export interface UnifiedPost {
  id: number;
  databaseId: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  postType: PostType;
  status: 'publish' | 'draft' | 'future';
  date: string;
  modified: string;
  author: Author;
  featuredImage: FeaturedImage;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  seo: SeoMeta;
  acf?: AdvancedCustomFields;
  // Caching metadata
  cacheTag: string;
  revalidateSeconds: number;
}

export interface CacheEntry {
  key: string;
  tags: string[];
  data: unknown;
  cachedAt: number;
  ttl: number; // in seconds
  hits: number;
  misses: number;
  staleRequests?: number;
  status: 'HIT' | 'STALE' | 'MISS' | 'REVALIDATING';
}

export interface RestApiResponse<T = unknown> {
  endpoint: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  executionTimeMs: number;
  data: T;
}

export interface GraphQlResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }> }>;
  extensions?: {
    debug?: Array<{ type: string; message: string }>;
    queryAnalyzer?: {
      graphqlTime: number;
      databaseQueriesCount: number;
    };
  };
}

export interface StarterFile {
  path: string;
  description: string;
  category: 'core' | 'routing' | 'api' | 'components' | 'config';
  code: string;
}

export interface DetailedWebhookLog {
  id: string;
  timestamp: string;
  relativeTime: string;
  sourceEvent: 'save_post' | 'edit_post' | 'delete_post' | 'manual_dispatch';
  endpoint: string;
  requestHeaders: Record<string, string>;
  payload: {
    post_id?: number;
    post_type?: string;
    slug?: string;
    tags: string[];
    action?: string;
    author?: string;
  };
  secretProvided: string;
  validationOutcome: {
    isValid: boolean;
    reason: string;
    tagsInvalidated: string[];
    executionTimeMs: number;
    httpStatus: 200 | 400 | 401 | 500;
    statusText: string;
  };
}
