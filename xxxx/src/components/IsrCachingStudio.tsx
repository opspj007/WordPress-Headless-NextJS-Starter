import { useState, useMemo, useEffect } from 'react';
import type { CacheEntry, DetailedWebhookLog } from '../types/wordpress.ts';
import { computeCacheMetrics, formatRemainingTtl, validateWebhookPayload } from '../utils/headlessLogic.ts';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  RefreshCw,
  Zap,
  Clock,
  Layers,
  Activity,
  Send,
  Database,
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  TrendingUp,
  Percent,
  Radio,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  Lock,
  Code2,
  AlertTriangle
} from 'lucide-react';

interface IsrCachingStudioProps {
  cacheStore: Record<string, CacheEntry>;
  onTriggerRevalidate: (tag: string, slug?: string) => void;
}

const INITIAL_WEBHOOK_LOGS: DetailedWebhookLog[] = [
  {
    id: 'wh-101',
    timestamp: '2026-10-20T07:38:12Z',
    relativeTime: '2 mins ago',
    sourceEvent: 'save_post',
    endpoint: '/api/revalidate?secret=enterprise_wp_revalidate_secret_2026',
    requestHeaders: {
      'content-type': 'application/json',
      'x-wp-webhook-source': 'WordPress/6.7-Gutenberg',
      'user-agent': 'WordPress-Bedrock-HookDispatcher/1.0',
    },
    payload: {
      post_id: 101,
      post_type: 'post',
      slug: 'scaling-enterprise-wordpress-with-nextjs-isr',
      tags: ['posts', 'post-101', 'architecture'],
      action: 'publish',
      author: 'Elena Rostova',
    },
    secretProvided: 'enterprise_wp_revalidate_secret_2026',
    validationOutcome: {
      isValid: true,
      reason: 'Signature matches WP_REVALIDATE_SECRET. Next.js revalidateTag executed on edge nodes in 34ms.',
      tagsInvalidated: ['posts', 'post-101', 'architecture'],
      executionTimeMs: 34,
      httpStatus: 200,
      statusText: '200 OK',
    },
  },
  {
    id: 'wh-102',
    timestamp: '2026-10-20T07:25:40Z',
    relativeTime: '15 mins ago',
    sourceEvent: 'edit_post',
    endpoint: '/api/revalidate?secret=enterprise_wp_revalidate_secret_2026',
    requestHeaders: {
      'content-type': 'application/json',
      'x-wp-webhook-source': 'WordPress/6.7-ACF-Pro',
      'user-agent': 'WordPress-Bedrock-HookDispatcher/1.0',
    },
    payload: {
      post_id: 201,
      post_type: 'case_study',
      slug: 'fintech-portal-migration-120m-pageviews',
      tags: ['case-studies', 'case_study-201'],
      action: 'update',
      author: 'Elena Rostova',
    },
    secretProvided: 'enterprise_wp_revalidate_secret_2026',
    validationOutcome: {
      isValid: true,
      reason: 'Signature verified. Purged tag [case-studies] and regenerated static HTML in background.',
      tagsInvalidated: ['case-studies', 'case_study-201'],
      executionTimeMs: 28,
      httpStatus: 200,
      statusText: '200 OK',
    },
  },
  {
    id: 'wh-103',
    timestamp: '2026-10-20T07:11:05Z',
    relativeTime: '29 mins ago',
    sourceEvent: 'manual_dispatch',
    endpoint: '/api/revalidate?secret=unauthorized_crawler_probe',
    requestHeaders: {
      'content-type': 'application/json',
      'user-agent': 'curl/8.5.0-malicious-scan',
    },
    payload: {
      slug: 'admin-dashboard',
      tags: ['*'],
      action: 'purge_all',
    },
    secretProvided: 'unauthorized_crawler_probe',
    validationOutcome: {
      isValid: false,
      reason: 'Unauthorized: Secret token mismatch with system WP_REVALIDATE_SECRET. Invalidation aborted.',
      tagsInvalidated: [],
      executionTimeMs: 14,
      httpStatus: 401,
      statusText: '401 Unauthorized',
    },
  },
  {
    id: 'wh-104',
    timestamp: '2026-10-20T06:50:22Z',
    relativeTime: '50 mins ago',
    sourceEvent: 'save_post',
    endpoint: '/api/revalidate?secret=enterprise_wp_revalidate_secret_2026',
    requestHeaders: {
      'content-type': 'application/json',
      'x-wp-webhook-source': 'WordPress/6.7-REST',
      'user-agent': 'WordPress-Bedrock-HookDispatcher/1.0',
    },
    payload: {
      post_id: 401,
      post_type: 'doc',
      slug: 'webhooks-setup-guide-on-demand-revalidation',
      tags: ['docs', 'webhooks'],
      action: 'publish',
      author: 'Marcus Vance',
    },
    secretProvided: 'enterprise_wp_revalidate_secret_2026',
    validationOutcome: {
      isValid: true,
      reason: 'Verified token. Cache tag [docs] invalidated successfully.',
      tagsInvalidated: ['docs', 'webhooks'],
      executionTimeMs: 31,
      httpStatus: 200,
      statusText: '200 OK',
    },
  },
];

export function IsrCachingStudio({ cacheStore, onTriggerRevalidate }: IsrCachingStudioProps) {
  const [targetTag, setTargetTag] = useState('posts');
  const [targetSlug, setTargetSlug] = useState('scaling-enterprise-wordpress-with-nextjs-isr');
  const [secretToken, setSecretToken] = useState('enterprise_wp_revalidate_secret_2026');
  const [isFiring, setIsFiring] = useState(false);
  const [chartView, setChartView] = useState<'distribution' | 'ratio'>('distribution');

  // Real-time ticker updating every second for live TTL countdowns
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Webhook Logs state
  const [webhookLogs, setWebhookLogs] = useState<DetailedWebhookLog[]>(INITIAL_WEBHOOK_LOGS);
  const [expandedLogId, setExpandedLogId] = useState<string | null>('wh-101');
  const [logFilter, setLogFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  // Compute live Cache Hit vs Miss metrics from cacheStore
  const metrics = useMemo(() => computeCacheMetrics(cacheStore), [cacheStore]);

  // Handle firing webhook from manual simulator
  const handleFireWebhook = () => {
    setIsFiring(true);
    setTimeout(() => {
      setIsFiring(false);
      const validation = validateWebhookPayload(secretToken, 'enterprise_wp_revalidate_secret_2026', {
        slug: targetSlug,
        tags: [targetTag],
        postType: targetTag === 'case-studies' ? 'case_study' : 'post',
      });

      const newLog: DetailedWebhookLog = {
        id: `wh-${Date.now()}`,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        sourceEvent: 'manual_dispatch',
        endpoint: `/api/revalidate?secret=${secretToken}`,
        requestHeaders: {
          'content-type': 'application/json',
          'x-wp-webhook-source': 'WebhookSimulator',
          'user-agent': 'WordPress-WebhookSimulator/2.0',
        },
        payload: {
          slug: targetSlug,
          tags: [targetTag],
          post_type: targetTag === 'case-studies' ? 'case_study' : 'post',
          action: 'save_post',
          author: 'Elena Rostova',
        },
        secretProvided: secretToken,
        validationOutcome: {
          isValid: validation.isValid,
          reason: validation.reason,
          tagsInvalidated: validation.tagsInvalidated,
          executionTimeMs: Math.floor(Math.random() * 20) + 22,
          httpStatus: validation.httpStatus,
          statusText: validation.statusText,
        },
      };

      setWebhookLogs((prev) => [newLog, ...prev]);

      if (validation.isValid) {
        onTriggerRevalidate(targetTag, targetSlug);
      }
    }, 350);
  };

  // Quick Action: Simulate valid WP save_post hook
  const handleSimulateSavePost = () => {
    const postIds = [101, 102, 201, 301, 401];
    const pickedId = postIds[Math.floor(Math.random() * postIds.length)];
    const isPost = pickedId <= 103;
    const tag = isPost ? 'posts' : pickedId === 201 ? 'case-studies' : 'portfolio';
    const slug = isPost ? 'scaling-enterprise-wordpress-with-nextjs-isr' : 'fintech-portal-migration-120m-pageviews';

    const newLog: DetailedWebhookLog = {
      id: `wh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      sourceEvent: 'save_post',
      endpoint: '/api/revalidate?secret=enterprise_wp_revalidate_secret_2026',
      requestHeaders: {
        'content-type': 'application/json',
        'x-wp-webhook-source': 'WordPress/6.7-Gutenberg',
        'user-agent': 'WordPress-Bedrock-HookDispatcher/1.0',
      },
      payload: {
        post_id: pickedId,
        post_type: isPost ? 'post' : 'case_study',
        slug,
        tags: [tag, `${tag}-${pickedId}`],
        action: 'save_post',
        author: 'Elena Rostova',
      },
      secretProvided: 'enterprise_wp_revalidate_secret_2026',
      validationOutcome: {
        isValid: true,
        reason: `Signature verified for [${tag}]. Executed revalidateTag('${tag}') across edge cache.`,
        tagsInvalidated: [tag, `${tag}-${pickedId}`],
        executionTimeMs: Math.floor(Math.random() * 15) + 20,
        httpStatus: 200,
        statusText: '200 OK',
      },
    };

    setWebhookLogs((prev) => [newLog, ...prev]);
    onTriggerRevalidate(tag, slug);
  };

  // Quick Action: Simulate unauthorized probe
  const handleSimulateAttack = () => {
    const newLog: DetailedWebhookLog = {
      id: `wh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      sourceEvent: 'manual_dispatch',
      endpoint: '/api/revalidate?secret=invalid_bad_token_9999',
      requestHeaders: {
        'content-type': 'application/json',
        'user-agent': 'curl/8.1.0-unauthorized-bot',
      },
      payload: {
        slug: 'wp-admin',
        tags: ['*'],
        action: 'unauthorized_purge',
      },
      secretProvided: 'invalid_bad_token_9999',
      validationOutcome: {
        isValid: false,
        reason: 'Unauthorized: Secret token mismatch. Request rejected without modifying cache.',
        tagsInvalidated: [],
        executionTimeMs: 12,
        httpStatus: 401,
        statusText: '401 Unauthorized',
      },
    };

    setWebhookLogs((prev) => [newLog, ...prev]);
  };

  const handleCopyPayload = (payload: any, logId: string) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayloadId(logId);
    setTimeout(() => setCopiedPayloadId(null), 1500);
  };

  // Filtered Webhook Logs
  const filteredLogs = useMemo(() => {
    return webhookLogs.filter((log) => {
      // Outcome filter
      if (logFilter === 'valid' && !log.validationOutcome.isValid) return false;
      if (logFilter === 'invalid' && log.validationOutcome.isValid) return false;

      // Search filter
      if (logSearch.trim()) {
        const query = logSearch.toLowerCase();
        const matchTag = log.payload.tags.some((t) => t.toLowerCase().includes(query));
        const matchSlug = log.payload.slug?.toLowerCase().includes(query);
        const matchSource = log.sourceEvent.toLowerCase().includes(query);
        const matchReason = log.validationOutcome.reason.toLowerCase().includes(query);
        if (!matchTag && !matchSlug && !matchSource && !matchReason) return false;
      }

      return true;
    });
  }, [webhookLogs, logFilter, logSearch]);

  const validCount = webhookLogs.filter((l) => l.validationOutcome.isValid).length;
  const invalidCount = webhookLogs.filter((l) => !l.validationOutcome.isValid).length;
  const cacheEntriesList = Object.values(cacheStore);

  // Custom Dark Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg shadow-2xl text-xs font-mono space-y-1">
          <p className="font-bold text-slate-200">Tag: {label}</p>
          <p className="text-emerald-400 flex items-center justify-between gap-3">
            <span>Cache Hits:</span>
            <span className="font-bold">{payload[0]?.value?.toLocaleString()}</span>
          </p>
          <p className="text-amber-400 flex items-center justify-between gap-3">
            <span>Cache Misses:</span>
            <span className="font-bold">{payload[1]?.value?.toLocaleString()}</span>
          </p>
          <p className="text-cyan-300 flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
            <span>Hit Ratio:</span>
            <span className="font-bold">{payload[0]?.payload?.hitRate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = metrics.totalRequests > 0
        ? Math.round((data.value / metrics.totalRequests) * 1000) / 10
        : 100;

      return (
        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg shadow-2xl text-xs font-mono">
          <p className="font-bold text-slate-200">{data.name}</p>
          <p className="text-slate-300 mt-1 flex items-center justify-between gap-4">
            <span>Count:</span>
            <span className="font-bold">{data.value?.toLocaleString()}</span>
          </p>
          <p className="text-cyan-400 flex items-center justify-between gap-4">
            <span>Share:</span>
            <span className="font-bold">{pct}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Next.js 15 ISR & Edge Cache Orchestrator</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Stale-While-Revalidate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage tag-based invalidation (<code>revalidateTag</code>) and live cache telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500">Global Hit Ratio: </span>
            <span className="text-emerald-400 font-bold">{metrics.hitRatioPercent}%</span>
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization: Cache Hit vs Miss Analytics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cache Hit vs. Miss Ratio Visualization
              </h3>
              <p className="text-[11px] text-slate-400">
                Real-time telemetry parsed from active cache tags and revalidation events.
              </p>
            </div>
          </div>

          {/* Visualization Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setChartView('distribution')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                chartView === 'distribution'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Per-Tag Distribution</span>
            </button>
            <button
              onClick={() => setChartView('ratio')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                chartView === 'ratio'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Overall Ratio Donut</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-medium">Global Hit Ratio</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <span>{metrics.hitRatioPercent}%</span>
              <Percent className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Target: &gt;95.0%</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-medium">Edge Hits</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {metrics.totalHits.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400/80 font-sans block mt-0.5">Served in &lt;20ms</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-medium">Cache Misses</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {metrics.totalMisses.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400/80 font-sans block mt-0.5">Revalidations</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-medium">Total Requests</span>
            <div className="text-xl font-bold text-cyan-300 mt-0.5">
              {metrics.totalRequests.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">{cacheEntriesList.length} Active Tags</span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center justify-center">
          {chartView === 'distribution' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.tagData}
                margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="hits"
                  name="Cache Hits (Fresh)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="misses"
                  name="Cache Misses (Stale/Regen)"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Pie
                  data={metrics.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ percent }) =>
                    typeof percent === 'number' ? `${(percent * 100).toFixed(1)}%` : ''
                  }
                  labelLine={false}
                >
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Visual Stale-While-Revalidate Lifecycle Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Decoupled On-Demand Revalidation Architecture Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative group hover:border-blue-500/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>WordPress Edit</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Editor clicks "Update" in Gutenberg. <code>save_post</code> action hook fires in WordPress PHP.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative group hover:border-amber-500/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Webhook Dispatched</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dispatches authenticated HTTP POST to Next.js <code>/api/revalidate?secret=...</code> with tags.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative group hover:border-cyan-500/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edge Tag Purge</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Next.js executes <code>revalidateTag('posts')</code>. Cache entries transition immediately to STALE.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative group hover:border-emerald-500/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
              4
            </div>
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Downtime Serve</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Users continue receiving sub-20ms cached HTML while the next visitor triggers background regeneration.
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Active Cache Tags & Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Cache Tags Table with Live Countdown Timers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Next.js 15 Active Cache Tags Registry</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{cacheEntriesList.length} Active Tags</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {cacheEntriesList.map((entry) => {
                const totalReqs = (entry.hits || 0) + (entry.misses || 0);
                const tagHitRate = totalReqs > 0 ? ((entry.hits / totalReqs) * 100).toFixed(1) : '100.0';

                // Real-time TTL countdown calculation
                const isStale = entry.status === 'STALE' || !entry.cachedAt;
                const elapsedSeconds = entry.cachedAt ? Math.floor((currentTime - entry.cachedAt) / 1000) : entry.ttl;
                const remainingSeconds = isStale ? 0 : Math.max(0, entry.ttl - elapsedSeconds);
                const isExpired = remainingSeconds <= 0;
                const percentRemaining = entry.ttl > 0 ? Math.min(100, Math.max(0, Math.round((remainingSeconds / entry.ttl) * 100))) : 0;

                return (
                  <div key={entry.key} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-1.5 flex-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          tag: {entry.tags[0] || entry.key}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            entry.status === 'HIT' && !isExpired
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {entry.status === 'HIT' && !isExpired ? 'HIT' : 'STALE'}
                        </span>

                        {/* Live Countdown Timer next to status */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            isExpired || isStale
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                              : remainingSeconds <= 15
                              ? 'bg-rose-950/60 text-rose-300 border-rose-700/50 animate-pulse'
                              : 'bg-slate-900 text-cyan-300 border-slate-700'
                          }`}
                          title={`Configured TTL: ${entry.ttl}s. Remaining: ${remainingSeconds}s (${percentRemaining}%)`}
                        >
                          <Clock className={`w-3 h-3 ${!isExpired && !isStale ? 'text-cyan-400' : 'text-amber-400'}`} />
                          <span>
                            {isExpired || isStale ? (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
                                <span>Expired (0s)</span>
                              </span>
                            ) : (
                              `Expires in: ${formatRemainingTtl(remainingSeconds)}`
                            )}
                          </span>
                        </div>

                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          {tagHitRate}% Hit Rate
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                        <span>Configured TTL: {entry.ttl}s</span>
                        <span>•</span>
                        <span className="text-emerald-400">Hits: {entry.hits}</span>
                        <span>•</span>
                        <span className="text-amber-400">Misses: {entry.misses || 0}</span>
                      </div>

                      {/* Visual Mini TTL Progress Bar */}
                      <div className="w-full max-w-md bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            isExpired || isStale
                              ? 'bg-amber-500 w-0'
                              : percentRemaining > 50
                              ? 'bg-emerald-500'
                              : percentRemaining > 20
                              ? 'bg-cyan-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onTriggerRevalidate(entry.tags[0] || entry.key)}
                      aria-label={`Revalidate cache tag ${entry.tags[0] || entry.key}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Revalidate</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Webhook Dispatcher Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Simulate WordPress Invalidation Webhook</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Revalidation Secret Token:</label>
                <input
                  type="text"
                  value={secretToken}
                  onChange={(e) => setSecretToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Cache Tag:</label>
                <select
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="posts">posts (All Blog Articles)</option>
                  <option value="case-studies">case-studies (All Case Studies)</option>
                  <option value="portfolio">portfolio (All Portfolio CPT)</option>
                  <option value="docs">docs (All Documentation)</option>
                  <option value="*">* (Global Purge All)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Post Slug (Optional Path):</label>
                <input
                  type="text"
                  value={targetSlug}
                  onChange={(e) => setTargetSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleFireWebhook}
                disabled={isFiring}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFiring ? 'animate-spin' : ''}`} />
                <span>Dispatch /api/revalidate Webhook</span>
              </button>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleSimulateSavePost}
                  className="flex-1 py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px] font-mono transition-colors"
                  title="Simulate WordPress save_post action hook dispatch"
                >
                  ⚡ Valid save_post
                </button>
                <button
                  type="button"
                  onClick={handleSimulateAttack}
                  className="flex-1 py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-rose-900/40 text-rose-300 rounded text-[11px] font-mono transition-colors"
                  title="Simulate probe with invalid signature token"
                >
                  🛡️ Test 401 Intrusion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Chronological WordPress Webhook Logs & Payload Inspector */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Section Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  WordPress Webhook Invalidation Logs
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Chronological Audit Trail
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tracks incoming WordPress payloads (<code>save_post</code>, <code>edit_post</code>) and cryptographic validation outcomes.
              </p>
            </div>
          </div>

          {/* Quick Stats in Section Header */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              Total: <strong className="text-white">{webhookLogs.length}</strong>
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/70 rounded-lg border border-emerald-800/60 text-emerald-300">
              Validated: <strong>{validCount}</strong>
            </span>
            <span className="px-2.5 py-1 bg-rose-950/70 rounded-lg border border-rose-800/60 text-rose-300">
              Blocked: <strong>{invalidCount}</strong>
            </span>
            {webhookLogs.length > 0 && (
              <button
                onClick={() => setWebhookLogs([])}
                className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear all webhook logs"
                aria-label="Clear all webhook logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setLogFilter('all')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                logFilter === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Events ({webhookLogs.length})
            </button>
            <button
              onClick={() => setLogFilter('valid')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                logFilter === 'valid'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-emerald-400'
              }`}
            >
              200 OK Validated ({validCount})
            </button>
            <button
              onClick={() => setLogFilter('invalid')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                logFilter === 'invalid'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-rose-400'
              }`}
            >
              401 Blocked ({invalidCount})
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search tag, slug, hook..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Chronological List of Webhook Events */}
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isValid = log.validationOutcome.isValid;

            return (
              <div
                key={log.id}
                className="hover:bg-slate-850/50 transition-colors duration-150"
              >
                {/* Main Summary Row */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start md:items-center gap-3">
                    {/* Status Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                        isValid
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isValid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* HTTP Status Code */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isValid
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.validationOutcome.statusText}
                        </span>

                        {/* Source WordPress Hook */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          hook: {log.sourceEvent}
                        </span>

                        {/* Slug or target */}
                        {log.payload.slug && (
                          <span className="text-xs font-mono text-slate-300 font-semibold">
                            /{log.payload.slug}
                          </span>
                        )}
                      </div>

                      {/* Summary line */}
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {log.validationOutcome.reason}
                      </p>
                    </div>
                  </div>

                  {/* Right Metadata & Expand Toggle */}
                  <div className="flex items-center gap-3 self-end md:self-center font-mono text-[11px] text-slate-400 shrink-0">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>⚡ {log.validationOutcome.executionTimeMs}ms</span>
                    </div>

                    <span className="text-slate-600">•</span>

                    <span className="text-slate-400">{log.relativeTime}</span>

                    <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Inspection Drawer (Payload, Headers, Validation Step) */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 bg-slate-950/80 border-t border-slate-800/80 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
                      {/* Left: Incoming Payload & Headers */}
                      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>POST {log.endpoint}</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPayload(log.payload, log.id);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition-colors"
                          >
                            {copiedPayloadId === log.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedPayloadId === log.id ? 'Copied' : 'Copy JSON'}</span>
                          </button>
                        </div>

                        <div className="p-3 text-xs font-mono space-y-3">
                          {/* HTTP Headers */}
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 font-sans block mb-1">
                              Incoming Request Headers
                            </span>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800/70 text-[11px] text-slate-300 space-y-1">
                              {Object.entries(log.requestHeaders).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-slate-500">{k}:</span>
                                  <span className="text-amber-300 break-all">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Request Body Payload */}
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 font-sans block mb-1">
                              Webhook Body JSON
                            </span>
                            <pre className="bg-slate-950 p-3 rounded border border-slate-800/70 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Right: Validation Outcome & Security Audit */}
                      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs font-mono">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                          {isValid ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                            Validation & Revalidation Outcome
                          </span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                            <span className="text-slate-400 block font-sans">Secret Token Check:</span>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Provided:</span>
                              <span className="truncate max-w-[180px] text-slate-200">
                                {log.secretProvided}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Match Status:</span>
                              <span
                                className={`font-bold ${
                                  isValid ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isValid ? 'MATCHED (PASSED)' : 'MISMATCH (REJECTED)'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                            <span className="text-slate-400 block font-sans">Next.js Edge Action:</span>
                            {isValid ? (
                              <div className="text-emerald-300">
                                <span className="block">✓ revalidateTag() executed</span>
                                <span className="text-slate-400 text-[10px] block mt-0.5">
                                  Purged tags: {log.validationOutcome.tagsInvalidated.join(', ') || 'posts'}
                                </span>
                              </div>
                            ) : (
                              <div className="text-rose-300">
                                <span>✕ Aborted (No cache tags purged)</span>
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                            <span className="text-slate-400 block font-sans">Full Audit Reason:</span>
                            <p className="text-slate-300 font-sans mt-0.5 leading-relaxed text-[11px]">
                              {log.validationOutcome.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <Radio className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No webhook logs match your filter.</p>
              <button
                onClick={() => {
                  setLogFilter('all');
                  setLogSearch('');
                }}
                className="px-3 py-1 bg-slate-800 text-xs text-slate-300 rounded hover:text-white"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
