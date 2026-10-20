import { Layers, Globe, Database, RefreshCw, Search, Code, Eye, ShieldCheck, Zap } from 'lucide-react';

export type ActiveTab = 'next-frontend' | 'wordpress-cms' | 'isr-cache' | 'seo-sitemap' | 'starter-code' | 'architecture-diagram';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  draftMode: boolean;
  setDraftMode: (enabled: boolean) => void;
  totalPosts: number;
  activeCacheTagsCount: number;
}

export function Header({
  activeTab,
  setActiveTab,
  draftMode,
  setDraftMode,
  totalPosts,
  activeCacheTagsCount,
}: HeaderProps) {
  const tabs = [
    {
      id: 'next-frontend' as ActiveTab,
      label: 'Next.js 15 Frontend',
      icon: Globe,
      badge: 'Live App',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'wordpress-cms' as ActiveTab,
      label: 'WordPress Core & APIs',
      icon: Database,
      badge: 'REST & GraphQL',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'isr-cache' as ActiveTab,
      label: 'ISR & Edge Cache',
      icon: RefreshCw,
      badge: `${activeCacheTagsCount} Tags`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'seo-sitemap' as ActiveTab,
      label: 'SEO & Sitemap',
      icon: Search,
      badge: 'XML + Schema',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'starter-code' as ActiveTab,
      label: 'Production Starter Code',
      icon: Code,
      badge: '8 Files',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'architecture-diagram' as ActiveTab,
      label: 'Enterprise Blueprint',
      icon: Layers,
      badge: 'Topology',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner with System Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-extrabold text-sm tracking-tighter">
                WP✦NEXT
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                WordPress-Headless-NextJS-Starter
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                <Zap className="w-3 h-3 text-cyan-400" />
                Enterprise Grade
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Decoupled CMS Architecture • REST & WPGraphQL • ISR On-Demand • Next.js 15
            </p>
          </div>
        </div>

        {/* Global Controls & Statuses */}
        <div className="flex items-center gap-3">
          {/* Draft Mode Toggle */}
          <button
            onClick={() => setDraftMode(!draftMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              draftMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Toggle Next.js 15 Draft Mode Preview (replicates ?secret=... token verification)"
            aria-pressed={draftMode}
          >
            <Eye className={`w-3.5 h-3.5 ${draftMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Draft Mode: {draftMode ? 'ENABLED' : 'OFF'}</span>
          </button>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{totalPosts} CPTs Synced</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>JWT & WAF Shielded</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Architecture Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                    isActive ? 'bg-blue-700/60 text-white border-blue-400/40' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
