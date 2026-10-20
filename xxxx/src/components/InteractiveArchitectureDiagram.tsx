import { useState } from 'react';
import {
  Database,
  Terminal,
  Server,
  Globe,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowDown,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

interface LayerDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
  securityNotes: string;
  scalingNotes: string;
}

const LAYERS: LayerDetail[] = [
  {
    id: 'wordpress',
    title: '1. WordPress Core Engine',
    subtitle: 'Headless Editorial Back-Office',
    description: 'Runs WordPress exclusively as a content authoring studio. Editors work within familiar Gutenberg and ACF Pro interfaces without generating frontend HTML.',
    specs: [
      'Isolated in Private VPC (No public HTTP ingress)',
      'Custom Post Types (CPTs): Posts, Case Studies, Portfolio, Docs',
      'Advanced Custom Fields (ACF Pro) schema definitions',
      'MySQL 8 / MariaDB with persistent query caching',
      'PHP 8.3 OPcache tuned for high GraphQL throughput',
    ],
    securityNotes: 'Public wp-login and xmlrpc.php blocked at WAF. Only VPN or SSO admin users can access the dashboard.',
    scalingNotes: 'Offloading 100% of read traffic to Next.js edge ensures WordPress easily handles millions of pageviews on a single modest instance.',
  },
  {
    id: 'api-layer',
    title: '2. REST API / WPGraphQL Highway',
    subtitle: 'Data Ingestion & Invalidation Pipeline',
    description: 'Serves structured JSON data to Next.js through standard WP REST API and high-speed WPGraphQL endpoints with query batching.',
    specs: [
      'WPGraphQL with Smart Cache & DataLoader (no N+1 queries)',
      'REST API v2 with _embed support for relations',
      'JWT Authentication & HMAC SHA-256 signed bearer tokens',
      'Asynchronous webhook dispatcher on save_post events',
      'Strict CORS Origin whitelist for frontend domains',
    ],
    securityNotes: 'Endpoints are rate-limited via Cloudflare. Private drafts require signed JWT preview tokens.',
    scalingNotes: 'WPGraphQL DataLoader reduces database query waterfalls from dozens of queries down to 2-3 batched queries.',
  },
  {
    id: 'nextjs',
    title: '3. Next.js 15 App Router Layer',
    subtitle: 'Incremental Static Regeneration & Server Components',
    description: 'Pre-renders static HTML pages at build time and on-demand using generateStaticParams() and revalidates in background with zero server downtime.',
    specs: [
      'Next.js 15 App Router with React Server Components (RSC)',
      'Incremental Static Regeneration (ISR) with tag-based caching',
      'Dynamic route parameter resolution for [slug] and [...catchAll]',
      'Automated sitemap crawling via app/sitemap.ts',
      'next/image automatic conversion to WebP and AVIF',
    ],
    securityNotes: 'Draft Mode verified via HTTP-only secure cookie and shared preview secret token.',
    scalingNotes: 'Static HTML pages are generated in milliseconds and cached at the edge, scaling seamlessly to viral traffic spikes.',
  },
  {
    id: 'edge-cache',
    title: '4. Edge CDN & Vercel / Cloudflare Cache',
    subtitle: 'Sub-30ms Global Delivery Network',
    description: 'Distributes pre-rendered static assets across 300+ edge locations worldwide. Stale-While-Revalidate ensures users always receive instant responses.',
    specs: [
      'Global Anycast routing across 300+ Edge points of presence',
      'Tag-based cache invalidation (revalidateTag) in under 100ms',
      'Automatic Brotli and Gzip HTTP compression',
      'Edge image optimization with device pixel ratio detection',
      'SSL/TLS termination and DDoS mitigation',
    ],
    securityNotes: 'Edge WAF inspects incoming requests and blocks malicious bots before they ever hit compute servers.',
    scalingNotes: 'Cache hit ratio exceeds 99%, keeping backend compute and hosting costs virtually flat even during 10x traffic surges.',
  },
  {
    id: 'client-ui',
    title: '5. React UI & Browser Presentation',
    subtitle: 'High-Performance Consumer Experience',
    description: 'Renders accessible, responsive web interfaces with perfect Core Web Vitals, dynamic search, and interactive editorial previews.',
    specs: [
      '100/100 Core Web Vitals (LCP < 0.8s, CLS = 0, INP < 50ms)',
      'Zero client-side JavaScript overhead for static prose content',
      'Schema.org JSON-LD structured data for Google Search rich snippets',
      'OpenGraph and Twitter Card social media meta tags',
      'Fluid responsiveness from mobile viewports to 4K displays',
    ],
    securityNotes: 'Content Security Policy (CSP) headers prevent cross-site scripting (XSS).',
    scalingNotes: 'Clients download ultra-lean static HTML payloads, saving mobile battery and cellular data.',
  },
];

export function InteractiveArchitectureDiagram() {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('nextjs');

  const selectedLayer = LAYERS.find((l) => l.id === selectedLayerId) || LAYERS[2];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Interactive Decoupled Enterprise Topology</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Click Layers for Deep Architecture Specs
              </span>
            </div>
            <p className="text-xs text-slate-400">
              WordPress → REST / WPGraphQL → Next.js 15 → Edge CDN → React UI.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Visual Stack Nodes */}
        <div className="lg:col-span-5 space-y-3">
          {LAYERS.map((layer, idx) => {
            const isSelected = selectedLayerId === layer.id;
            return (
              <div key={layer.id} className="space-y-2">
                <button
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all relative group ${
                    isSelected
                      ? 'bg-slate-850 border-blue-500 shadow-xl shadow-blue-500/15 ring-1 ring-blue-500'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                      Layer 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Selection' : 'Inspect'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{layer.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{layer.subtitle}</p>
                </button>

                {/* Arrow connector between layers */}
                {idx < LAYERS.length - 1 && (
                  <div className="flex items-center justify-center py-0.5 text-slate-600">
                    <ArrowDown className="w-4 h-4 text-blue-500/60 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Deep Specs Detail Card */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 sticky top-28">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Architecture Deep Dive
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedLayer.title}</h2>
              <p className="text-xs text-blue-300 font-medium">{selectedLayer.subtitle}</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedLayer.description}</p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Technical Specifications</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedLayer.specs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security & Scaling Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Security Hardening</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedLayer.securityNotes}
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>High-Traffic Scalability</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedLayer.scalingNotes}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
