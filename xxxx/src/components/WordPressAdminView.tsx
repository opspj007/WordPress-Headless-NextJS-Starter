import { useState } from 'react';
import type { UnifiedPost } from '../types/wordpress.ts';
import { MOCK_GRAPHQL_QUERIES } from '../data/mockWordPressData.ts';
import {
  Database,
  Terminal,
  Play,
  Key,
  Shield,
  Layers,
  Copy,
  Check,
  PlusCircle,
  FileText,
  Clock,
  Server,
  Code2,
  Lock,
  RefreshCw,
  Sliders,
  Send
} from 'lucide-react';

interface WordPressAdminViewProps {
  posts: UnifiedPost[];
  onAddNewPost: (post: UnifiedPost) => void;
  onTogglePostStatus: (id: number) => void;
  draftMode: boolean;
  setDraftMode: (enabled: boolean) => void;
}

export function WordPressAdminView({
  posts,
  onAddNewPost,
  onTogglePostStatus,
  draftMode,
  setDraftMode,
}: WordPressAdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'rest-api' | 'wpgraphql' | 'cpt-manager' | 'security'>('wpgraphql');

  // REST API Explorer state
  const [restEndpoint, setRestEndpoint] = useState('/wp-json/wp/v2/posts');
  const [restParams, setRestParams] = useState('_embed=true&per_page=3');
  const [restCopied, setRestCopied] = useState(false);
  const [isRestExecuting, setIsRestExecuting] = useState(false);

  // GraphQL Playground state
  const [selectedGqlPresetIndex, setSelectedGqlPresetIndex] = useState(0);
  const [gqlQuery, setGqlQuery] = useState(MOCK_GRAPHQL_QUERIES[0].query);
  const [gqlVariables, setGqlVariables] = useState(MOCK_GRAPHQL_QUERIES[0].variables);
  const [gqlCopied, setGqlCopied] = useState(false);
  const [isGqlExecuting, setIsGqlExecuting] = useState(false);
  const [gqlExecutionStats, setGqlExecutionStats] = useState({ timeMs: 24, dbQueries: 4 });

  // Security credentials state
  const [jwtToken, setJwtToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ3b3JkcHJlc3MiLCJpYXQiOjE3NzQwMDAwMDAsImV4cCI6MTc3NDYwNDgwMCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZXMiOlsic3VwZXJfYWRtaW4iXX19fQ.signature_valid_2026');
  const [appPassword, setAppPassword] = useState('wp_app_x8d2_99m3_enterprise_api_key');
  const [corsOrigins, setCorsOrigins] = useState('https://starter.headless-wp.io\nhttp://localhost:3000\nhttps://vercel-preview.app');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New post modal / inline creation state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'post' | 'case_study' | 'portfolio' | 'doc'>('post');
  const [newExcerpt, setNewExcerpt] = useState('');

  // Handle preset change
  const handleSelectPreset = (index: number) => {
    setSelectedGqlPresetIndex(index);
    setGqlQuery(MOCK_GRAPHQL_QUERIES[index].query);
    setGqlVariables(MOCK_GRAPHQL_QUERIES[index].variables);
  };

  const executeGraphQl = () => {
    setIsGqlExecuting(true);
    setTimeout(() => {
      setIsGqlExecuting(false);
      setGqlExecutionStats({
        timeMs: Math.floor(Math.random() * 15) + 18,
        dbQueries: Math.floor(Math.random() * 3) + 2,
      });
    }, 300);
  };

  const executeRestApi = () => {
    setIsRestExecuting(true);
    setTimeout(() => {
      setIsRestExecuting(false);
    }, 250);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Generate simulated REST response based on endpoint
  const getRestResponseData = () => {
    if (restEndpoint.includes('case_studies')) {
      return posts.filter((p) => p.postType === 'case_study');
    }
    if (restEndpoint.includes('portfolio')) {
      return posts.filter((p) => p.postType === 'portfolio');
    }
    if (restEndpoint.includes('users')) {
      return [
        { id: 1, name: 'Elena Rostova', slug: 'elena-rostova', roles: ['administrator'], post_count: 3 },
        { id: 2, name: 'Marcus Vance', slug: 'marcus-vance', roles: ['editor', 'security_officer'], post_count: 2 },
      ];
    }
    if (restEndpoint.includes('settings')) {
      return {
        title: 'WordPress Headless Core',
        description: 'Decoupled Content Hub for Next.js 15',
        url: 'https://cms.headless-wp.internal',
        timezone_string: 'UTC',
        rest_api_version: 'v2',
        wpgraphql_version: '1.28.0',
      };
    }
    return posts.filter((p) => p.postType === 'post');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = Date.now();
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newPost: UnifiedPost = {
      id,
      databaseId: id,
      slug,
      title: newTitle,
      excerpt: newExcerpt || 'New enterprise post authored via WordPress REST API.',
      content: `<h2>${newTitle}</h2><p>This content was authored in the WordPress Headless engine and synchronized into Next.js 15 via ISR.</p>`,
      postType: newType,
      status: 'publish',
      date: new Date().toISOString(),
      modified: new Date().toISOString(),
      author: {
        id: 1,
        name: 'Elena Rostova',
        slug: 'elena-rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        role: 'Staff Infrastructure Architect',
        bio: 'Leading high-throughput decoupled CMS architectures.',
      },
      featuredImage: {
        id: id + 1,
        sourceUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        altText: newTitle,
        width: 1200,
        height: 630,
      },
      categories: [{ id: 1, name: 'Architecture', slug: 'architecture' }],
      tags: [{ id: 1, name: 'Headless WP', slug: 'headless-wp' }],
      seo: {
        title: `${newTitle} | Headless WP Next.js`,
        metaDesc: newExcerpt || newTitle,
        canonical: `https://starter.headless-wp.io/blog/${slug}`,
        ogType: 'article',
        ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        twitterCard: 'summary_large_image',
        readingTimeMinutes: 3,
        schemaType: 'Article',
      },
      cacheTag: newType === 'case_study' ? 'case-studies' : 'posts',
      revalidateSeconds: 60,
    };

    onAddNewPost(newPost);
    setNewTitle('');
    setNewExcerpt('');
  };

  return (
    <div className="space-y-6">
      {/* WordPress Headless Core Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">WordPress Headless API Hub</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                WP 6.7 + WPGraphQL 1.28
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Isolated editorial engine exposing type-safe REST API & GraphQL data pipelines.
            </p>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { id: 'wpgraphql', label: 'WPGraphQL Playground', icon: Terminal },
            { id: 'rest-api', label: 'REST API Explorer', icon: Server },
            { id: 'cpt-manager', label: 'Custom Post Types (CPT)', icon: Layers },
            { id: 'security', label: 'Auth & JWT Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
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
      </div>

      {/* Sub-tab 1: WPGraphQL Playground */}
      {activeSubTab === 'wpgraphql' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Query Editor & Variables */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold">
                  <Terminal className="w-4 h-4" />
                  <span>WPGraphQL Query Runner</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedGqlPresetIndex}
                    onChange={(e) => handleSelectPreset(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  >
                    {MOCK_GRAPHQL_QUERIES.map((q, idx) => (
                      <option key={idx} value={idx}>
                        Preset: {q.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={executeGraphQl}
                    disabled={isGqlExecuting}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isGqlExecuting ? 'animate-spin' : ''}`} />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 bg-slate-950/60 font-mono text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 mb-1 font-sans flex items-center justify-between">
                    <span>GraphQL Query Definition:</span>
                    <span className="text-[10px] text-slate-500">POST /graphql</span>
                  </div>
                  <textarea
                    value={gqlQuery}
                    onChange={(e) => setGqlQuery(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-cyan-300 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                    spellCheck={false}
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 mb-1 font-sans block">Query Variables (JSON):</span>
                  <textarea
                    value={gqlVariables}
                    onChange={(e) => setGqlVariables(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-amber-300 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GraphQL Live Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-mono font-medium">GraphQL Response Payload</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    200 OK
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>⚡ {gqlExecutionStats.timeMs}ms</span>
                  <span>•</span>
                  <span>SQL: {gqlExecutionStats.dbQueries} queries</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({ data: { posts: posts.slice(0, 2) } }, null, 2));
                      setGqlCopied(true);
                      setTimeout(() => setGqlCopied(false), 1500);
                    }}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy Response JSON"
                  >
                    {gqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/90 font-mono text-xs overflow-auto flex-1 max-h-[500px]">
                <pre className="text-emerald-300 text-[11px] leading-relaxed">
                  {JSON.stringify(
                    {
                      data: {
                        posts: {
                          pageInfo: {
                            hasNextPage: true,
                            endCursor: 'YXJyYXljb25uZWN0aW9uOjEwMw==',
                          },
                          nodes: posts.slice(0, 3).map((p) => ({
                            id: p.id,
                            databaseId: p.databaseId,
                            slug: p.slug,
                            title: p.title,
                            date: p.date,
                            author: { node: { name: p.author.name, slug: p.author.slug } },
                            featuredImage: { node: { sourceUrl: p.featuredImage.sourceUrl } },
                            seo: { title: p.seo.title, canonical: p.seo.canonical },
                          })),
                        },
                      },
                      extensions: {
                        queryAnalyzer: {
                          graphqlTime: gqlExecutionStats.timeMs,
                          databaseQueriesCount: gqlExecutionStats.dbQueries,
                        },
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: REST API Explorer */}
      {activeSubTab === 'rest-api' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <span className="px-2.5 py-1.5 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg uppercase tracking-wider text-center shrink-0">
                GET
              </span>

              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={restEndpoint}
                  onChange={(e) => setRestEndpoint(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="/wp-json/wp/v2/posts">/wp-json/wp/v2/posts</option>
                  <option value="/wp-json/wp/v2/case_studies">/wp-json/wp/v2/case_studies (CPT)</option>
                  <option value="/wp-json/wp/v2/portfolio">/wp-json/wp/v2/portfolio (CPT)</option>
                  <option value="/wp-json/wp/v2/users">/wp-json/wp/v2/users</option>
                  <option value="/wp-json/wp/v2/settings">/wp-json/wp/v2/settings</option>
                </select>

                <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300">
                  <span className="text-slate-500 mr-1">?</span>
                  <input
                    type="text"
                    value={restParams}
                    onChange={(e) => setRestParams(e.target.value)}
                    placeholder="_embed=true&per_page=10"
                    className="w-full bg-transparent focus:outline-none text-slate-200"
                  />
                </div>
              </div>

              <button
                onClick={executeRestApi}
                disabled={isRestExecuting}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isRestExecuting ? 'animate-spin' : ''}`} />
                <span>Send Request</span>
              </button>
            </div>
          </div>

          {/* Response Payload & Headers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-300">Response Body</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    200 OK
                  </span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(getRestResponseData(), null, 2));
                    setRestCopied(true);
                    setTimeout(() => setRestCopied(false), 1500);
                  }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-mono transition-colors"
                >
                  {restCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 font-mono text-xs overflow-auto max-h-[480px]">
                <pre className="text-cyan-300 text-[11px] leading-relaxed">
                  {JSON.stringify(getRestResponseData(), null, 2)}
                </pre>
              </div>
            </div>

            {/* HTTP Response Headers */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-xs font-mono text-slate-300">
                HTTP Response Headers
              </div>
              <div className="p-4 bg-slate-950/60 font-mono text-[11px] space-y-2.5">
                {[
                  { name: 'Content-Type', val: 'application/json; charset=UTF-8' },
                  { name: 'X-WP-Total', val: String(posts.length) },
                  { name: 'X-WP-TotalPages', val: '1' },
                  { name: 'Cache-Control', val: 'max-age=60, must-revalidate' },
                  { name: 'Access-Control-Allow-Origin', val: '*' },
                  { name: 'X-Content-Type-Options', val: 'nosniff' },
                  { name: 'Server', val: 'nginx/1.24 (WordPress Bedrock)' },
                ].map((header, idx) => (
                  <div key={idx} className="border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400 font-semibold block">{header.name}:</span>
                    <span className="text-amber-300 break-all">{header.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Custom Post Types (CPT) Manager */}
      {activeSubTab === 'cpt-manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* CPT List & Statuses */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Registered WordPress Content Types (CPT)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{posts.length} Items</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-blue-300 border border-slate-700">
                          {post.postType.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            post.status === 'publish'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{post.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">slug: /{post.slug}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => onTogglePostStatus(post.id)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          post.status === 'publish'
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                            : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/50'
                        }`}
                      >
                        {post.status === 'publish' ? 'Set to Draft' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Create Custom Post Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Publish New Content to WordPress</span>
              </h3>

              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Post Type (CPT):</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="post">Standard Post (Blog)</option>
                    <option value="case_study">Case Study (CPT with ACF)</option>
                    <option value="portfolio">Portfolio Project (CPT)</option>
                    <option value="doc">Technical Documentation (CPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Edge Invalidation with Vercel and WP GraphQL"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Summary / Excerpt:</label>
                  <textarea
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    rows={3}
                    placeholder="Brief summary used for SEO meta description and card preview..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Content to WordPress</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Auth & JWT Security */}
      {activeSubTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* JWT & Application Passwords */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>JWT Authentication & Bearer Tokens</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decoupled frontends require cryptographically signed JSON Web Tokens (JWT) or Application Passwords to query private drafts, revisions, and authenticated WPGraphQL mutations.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Simulated JWT Bearer Token (HS256):</span>
                  <button
                    onClick={() => handleCopy(jwtToken, 'jwt')}
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    {copiedKey === 'jwt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'jwt' ? 'Copied' : 'Copy Token'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300 break-all text-[11px] max-h-24 overflow-y-auto">
                  {jwtToken}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Application Password for REST API:</span>
                  <button
                    onClick={() => handleCopy(appPassword, 'app_pass')}
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    {copiedKey === 'app_pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'app_pass' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-300 text-[11px]">
                  {appPassword}
                </div>
              </div>
            </div>
          </div>

          {/* CORS & Webhook Secrets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>CORS Policy & Invalidation Secrets</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restrict browser access to trusted frontend hostnames and verify signature tokens when Next.js receives WordPress webhook pings.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="block text-slate-400 mb-1 text-[11px] font-sans">Allowed CORS Frontend Origins:</span>
                <textarea
                  value={corsOrigins}
                  onChange={(e) => setCorsOrigins(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 text-[11px] focus:outline-none focus:border-blue-500 font-mono resize-none"
                />
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WP_REVALIDATE_SECRET:</span>
                  <span className="text-emerald-400 font-bold">enterprise_wp_revalidate_secret_2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WP_PREVIEW_SECRET:</span>
                  <span className="text-cyan-400 font-bold">enterprise_wp_preview_secret_9988</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
