import { useState, useMemo } from 'react';
import type { UnifiedPost, PostType, CacheEntry } from '../types/wordpress.ts';
import { filterPosts, optimizeImageUrl } from '../utils/headlessLogic.ts';
import {
  ExternalLink,
  Clock,
  User,
  Tag,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search,
  BookOpen,
  Briefcase,
  FolderGit2,
  FileCode2,
  Flame,
  ChevronLeft
} from 'lucide-react';

interface NextFrontendViewProps {
  posts: UnifiedPost[];
  draftMode: boolean;
  cacheStore: Record<string, CacheEntry>;
  onTriggerRevalidate: (tag: string, slug?: string) => void;
  selectedPostSlug?: string | null;
  onSelectPostSlug: (slug: string | null) => void;
}

export function NextFrontendView({
  posts,
  draftMode,
  cacheStore,
  onTriggerRevalidate,
  selectedPostSlug,
  onSelectPostSlug,
}: NextFrontendViewProps) {
  const [selectedType, setSelectedType] = useState<PostType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFormat, setImageFormat] = useState<'webp' | 'avif'>('webp');
  const [revalidating, setRevalidating] = useState(false);

  // Filter posts based on current filters and draft mode
  const visiblePosts = useMemo(() => {
    return filterPosts(posts, {
      postType: selectedType,
      searchTerm: searchQuery,
      includeDrafts: draftMode,
    });
  }, [posts, selectedType, searchQuery, draftMode]);

  // Active post if reading dynamic route
  const currentPost = useMemo(() => {
    if (!selectedPostSlug) return null;
    return posts.find((p) => p.slug === selectedPostSlug) || null;
  }, [posts, selectedPostSlug]);

  // Current post cache entry
  const currentCache = useMemo(() => {
    if (!currentPost) return null;
    return cacheStore[`post-${currentPost.id}`] || cacheStore['posts'] || null;
  }, [currentPost, cacheStore]);

  const handleRevalidateCurrent = () => {
    if (!currentPost) return;
    setRevalidating(true);
    onTriggerRevalidate(currentPost.cacheTag, currentPost.slug);
    setTimeout(() => setRevalidating(false), 600);
  };

  const getSimulatedUrl = () => {
    const base = 'https://starter.headless-wp.io';
    if (!currentPost) {
      if (selectedType === 'case_study') return `${base}/case-studies`;
      if (selectedType === 'portfolio') return `${base}/portfolio`;
      if (selectedType === 'doc') return `${base}/docs`;
      if (selectedType === 'post') return `${base}/blog`;
      return `${base}/`;
    }
    if (currentPost.postType === 'case_study') return `${base}/case-studies/${currentPost.slug}`;
    if (currentPost.postType === 'portfolio') return `${base}/portfolio/${currentPost.slug}`;
    if (currentPost.postType === 'doc') return `${base}/docs/${currentPost.slug}`;
    return `${base}/blog/${currentPost.slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Next.js Browser Bar Simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="ml-2 font-mono text-slate-400 font-medium">Next.js 15 App Router Edge Environment</span>
          </div>

          <div className="flex-1 max-w-xl mx-2">
            <div className="bg-slate-900 border border-slate-700/80 rounded-md px-3 py-1 flex items-center justify-between text-slate-300 font-mono text-[11px]">
              <span className="truncate">{getSimulatedUrl()}</span>
              {currentPost && (
                <span className="ml-2 px-1.5 py-0.2 bg-blue-950 border border-blue-800 text-blue-300 rounded text-[9px] uppercase font-bold shrink-0">
                  Dynamic Route
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Edge CDN: 200 OK
            </span>
          </div>
        </div>

        {/* Draft Mode Banner */}
        {draftMode && (
          <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-semibold">Next.js 15 Draft Mode Active:</span>
              <span className="hidden sm:inline">Previewing unpublished WordPress revisions via signed JWT token.</span>
            </div>
            <span className="text-[11px] font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
              cookie: __prerender_bypass
            </span>
          </div>
        )}

        {/* Viewport Content */}
        <div className="p-6 md:p-8 bg-slate-900/60 min-h-[640px]">
          {/* If reading single dynamic post */}
          {currentPost ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Back to Listing Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <button
                  onClick={() => onSelectPostSlug(null)}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to all content</span>
                </button>

                {/* Edge Cache Status Badge & Manual Purge */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentCache?.status === 'HIT'
                          ? 'bg-emerald-400'
                          : currentCache?.status === 'STALE'
                          ? 'bg-amber-400'
                          : 'bg-blue-400'
                      }`}
                    ></span>
                    <span className="font-mono text-[11px] text-slate-300">
                      Cache: {currentCache?.status || 'HIT'} (TTL: {currentPost.revalidateSeconds}s)
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-[11px] text-cyan-400">tag: {currentPost.cacheTag}</span>
                  </div>

                  <button
                    onClick={handleRevalidateCurrent}
                    disabled={revalidating}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg font-medium transition-colors disabled:opacity-50"
                    title="Simulate WordPress webhook firing revalidateTag() for this post"
                  >
                    <RefreshCw className={`w-3 h-3 ${revalidating ? 'animate-spin' : ''}`} />
                    <span>Revalidate Tag</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Route Info Header */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
                <div>
                  <span className="text-blue-400 font-semibold">Route Handler: </span>
                  <span>app/{currentPost.postType === 'case_study' ? 'case-studies' : 'blog'}/[slug]/page.tsx</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>generateStaticParams: YES</span>
                  <span>•</span>
                  <span>revalidate: {currentPost.revalidateSeconds}s</span>
                </div>
              </div>

              {/* Article Header */}
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {currentPost.postType.replace('_', ' ')}
                  </span>
                  {currentPost.status === 'draft' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Unpublished Draft
                    </span>
                  )}
                  {currentPost.categories.map((c) => (
                    <span key={c.id} className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {c.name}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {currentPost.title}
                </h1>

                <p className="text-lg text-slate-300 leading-relaxed font-normal">
                  {currentPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentPost.author.avatar}
                      alt={currentPost.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">{currentPost.author.name}</span>
                      <span className="block text-[10px] text-slate-400">{currentPost.author.role}</span>
                    </div>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(currentPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentPost.seo.readingTimeMinutes} min read</span>
                  </div>
                </div>
              </header>

              {/* Next/Image Optimization Simulator Container */}
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-xl group">
                  <img
                    src={currentPost.featuredImage.sourceUrl}
                    alt={currentPost.featuredImage.altText}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  {/* Overlay Next/Image Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>next/image optimized</span>
                    <span className="text-slate-500">|</span>
                    <span className="uppercase text-amber-300 font-bold">{imageFormat}</span>
                    <span className="text-emerald-400 font-bold">-76% payload</span>
                  </div>

                  {currentPost.featuredImage.caption && (
                    <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded border border-slate-800">
                      {currentPost.featuredImage.caption}
                    </div>
                  )}
                </div>

                {/* Image Format Optimization Switcher */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <span>Intrinsic: {currentPost.featuredImage.width}×{currentPost.featuredImage.height}px</span>
                  <div className="flex items-center gap-2">
                    <span>Format:</span>
                    <button
                      onClick={() => setImageFormat('webp')}
                      className={`px-2 py-0.5 rounded ${
                        imageFormat === 'webp'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      WebP
                    </button>
                    <button
                      onClick={() => setImageFormat('avif')}
                      className={`px-2 py-0.5 rounded ${
                        imageFormat === 'avif'
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      AVIF (Next-gen)
                    </button>
                  </div>
                </div>
              </div>

              {/* ACF (Advanced Custom Fields) Callout if Custom Post Type */}
              {currentPost.acf && (
                <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-800/40 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                    <FolderGit2 className="w-4 h-4" />
                    <span>WordPress Advanced Custom Fields (ACF Pro) Metadata</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {currentPost.acf.clientName && (
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Client / Stakeholder:</span>
                        <span className="font-semibold text-slate-100">{currentPost.acf.clientName}</span>
                      </div>
                    )}
                    {currentPost.acf.projectBudget && (
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Contract Scale:</span>
                        <span className="font-semibold text-emerald-400">{currentPost.acf.projectBudget}</span>
                      </div>
                    )}
                    {currentPost.acf.deploymentTarget && (
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Edge Target:</span>
                        <span className="font-semibold text-blue-300">{currentPost.acf.deploymentTarget}</span>
                      </div>
                    )}
                  </div>
                  {currentPost.acf.keyMetrics && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentPost.acf.keyMetrics.map((metric, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {metric}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Content rendered from WordPress Gutenberg */}
              <div
                className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-200 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_pre]:bg-slate-950 [&_pre]:border [&_pre]:border-slate-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-cyan-300"
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />

              {/* Tags and Author Bio Card */}
              <footer className="pt-6 border-t border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Tags:
                  </span>
                  {currentPost.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={currentPost.author.avatar}
                    alt={currentPost.author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Written by {currentPost.author.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/60 text-blue-300">
                        {currentPost.author.role}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {currentPost.author.bio}
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          ) : (
            /* Content Listing & Hero View */
            <div className="space-y-8 animate-fadeIn">
              {/* Enterprise Hero Banner */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 p-6 md:p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="max-w-2xl space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next.js 15 App Router + Headless WordPress</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Enterprise Decoupled Web Publishing Platform
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Powered by WordPress as a headless content management system, serving pages through Next.js 15 Incremental Static Regeneration (ISR) with sub-30ms global edge delivery.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => onSelectPostSlug('scaling-enterprise-wordpress-with-nextjs-isr')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all"
                    >
                      <span>Read Lead Architecture Post</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedType('case_study')}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Explore Case Studies (CPT)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtering, Search & Post Type Tabs */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {/* Post Type Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Content', icon: BookOpen },
                    { id: 'post', label: 'Blog Posts', icon: FileCode2 },
                    { id: 'case_study', label: 'Case Studies (CPT)', icon: Briefcase },
                    { id: 'portfolio', label: 'Portfolio (CPT)', icon: FolderGit2 },
                    { id: 'doc', label: 'Docs (CPT)', icon: BookOpen },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = selectedType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedType(tab.id as PostType | 'all')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, tags, authors..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Post Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map((post) => {
                  const postCache = cacheStore[`post-${post.id}`] || cacheStore['posts'];
                  return (
                    <article
                      key={post.id}
                      onClick={() => onSelectPostSlug(post.slug)}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col cursor-pointer group"
                    >
                      {/* Thumbnail with next/image badge */}
                      <div className="relative aspect-video overflow-hidden bg-slate-900">
                        <img
                          src={post.featuredImage.sourceUrl}
                          alt={post.featuredImage.altText}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur text-blue-300 border border-slate-700">
                            {post.postType.replace('_', ' ')}
                          </span>
                          {post.status === 'draft' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/90 text-slate-950">
                              Draft Preview
                            </span>
                          )}
                        </div>

                        {/* Edge cache state tag */}
                        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800 text-slate-300 flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              postCache?.status === 'HIT' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          ></span>
                          <span>ISR: {post.revalidateSeconds}s</span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{post.seo.readingTimeMinutes} min read</span>
                          </div>

                          <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h2>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="truncate max-w-[120px] text-slate-300">{post.author.name}</span>
                          </div>

                          <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[11px]">
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {visiblePosts.length === 0 && (
                <div className="text-center py-16 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No content found matching criteria.</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or enabling Draft Mode.</p>
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-3 py-1.5 bg-blue-600 text-xs text-white rounded-lg hover:bg-blue-500"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
