import { useState, useCallback } from 'react';
import { Header, type ActiveTab } from './components/Header.tsx';
import { NextFrontendView } from './components/NextFrontendView.tsx';
import { WordPressAdminView } from './components/WordPressAdminView.tsx';
import { IsrCachingStudio } from './components/IsrCachingStudio.tsx';
import { SeoSitemapInspector } from './components/SeoSitemapInspector.tsx';
import { ArchitectureCodebaseView } from './components/ArchitectureCodebaseView.tsx';
import { InteractiveArchitectureDiagram } from './components/InteractiveArchitectureDiagram.tsx';
import { INITIAL_POSTS } from './data/mockWordPressData.ts';
import type { UnifiedPost, CacheEntry } from './types/wordpress.ts';
import { revalidateCacheTag } from './utils/headlessLogic.ts';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('next-frontend');
  const [draftMode, setDraftMode] = useState<boolean>(false);
  const [posts, setPosts] = useState<UnifiedPost[]>(INITIAL_POSTS);
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Cache Store for Next.js ISR
  const [cacheStore, setCacheStore] = useState<Record<string, CacheEntry>>({
    posts: {
      key: 'posts',
      tags: ['posts'],
      data: 'all-posts-collection',
      cachedAt: Date.now() - 15000,
      ttl: 60,
      hits: 1420,
      misses: 28,
      status: 'HIT',
    },
    'case-studies': {
      key: 'case-studies',
      tags: ['case-studies', 'case_study'],
      data: 'case-studies-collection',
      cachedAt: Date.now() - 45000,
      ttl: 300,
      hits: 890,
      misses: 14,
      status: 'HIT',
    },
    portfolio: {
      key: 'portfolio',
      tags: ['portfolio'],
      data: 'portfolio-collection',
      cachedAt: Date.now() - 20000,
      ttl: 300,
      hits: 412,
      misses: 9,
      status: 'HIT',
    },
    docs: {
      key: 'docs',
      tags: ['docs', 'documentation'],
      data: 'docs-collection',
      cachedAt: Date.now() - 10000,
      ttl: 600,
      hits: 625,
      misses: 7,
      status: 'HIT',
    },
    sitemap: {
      key: 'sitemap',
      tags: ['sitemap'],
      data: 'xml-sitemap-tree',
      cachedAt: Date.now() - 50000,
      ttl: 86400,
      hits: 231,
      misses: 4,
      status: 'HIT',
    },
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Revalidate Cache Tag (Simulates Next.js 15 revalidateTag())
  const handleTriggerRevalidate = useCallback((tag: string, slug?: string) => {
    const { revalidatedKeys, updatedCache } = revalidateCacheTag(cacheStore, tag);
    setCacheStore(updatedCache);
    showToast(`Edge Cache Purged: revalidateTag('${tag}') executed in 34ms!`);

    // Simulate Next.js background static regeneration completing
    setTimeout(() => {
      setCacheStore((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key].tags.includes(tag) || tag === '*') {
            next[key] = {
              ...next[key],
              cachedAt: Date.now(),
              status: 'HIT',
              hits: next[key].hits + 1,
            };
          }
        }
        return next;
      });
    }, 1200);
  }, [cacheStore]);

  // Handle adding new post from WordPress back-office
  const handleAddNewPost = (newPost: UnifiedPost) => {
    setPosts((prev) => [newPost, ...prev]);
    handleTriggerRevalidate(newPost.cacheTag, newPost.slug);
    showToast(`Published '${newPost.title}' to WordPress & triggered On-Demand ISR!`);
  };

  // Handle toggling draft/publish status
  const handleTogglePostStatus = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'publish' ? 'draft' : 'publish';
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
    handleTriggerRevalidate('posts');
    showToast('Post status toggled. Revalidating edge cache tags...');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        draftMode={draftMode}
        setDraftMode={setDraftMode}
        totalPosts={posts.length}
        activeCacheTagsCount={Object.keys(cacheStore).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'next-frontend' && (
          <NextFrontendView
            posts={posts}
            draftMode={draftMode}
            cacheStore={cacheStore}
            onTriggerRevalidate={handleTriggerRevalidate}
            selectedPostSlug={selectedPostSlug}
            onSelectPostSlug={setSelectedPostSlug}
          />
        )}

        {activeTab === 'wordpress-cms' && (
          <WordPressAdminView
            posts={posts}
            onAddNewPost={handleAddNewPost}
            onTogglePostStatus={handleTogglePostStatus}
            draftMode={draftMode}
            setDraftMode={setDraftMode}
          />
        )}

        {activeTab === 'isr-cache' && (
          <IsrCachingStudio
            cacheStore={cacheStore}
            onTriggerRevalidate={handleTriggerRevalidate}
          />
        )}

        {activeTab === 'seo-sitemap' && <SeoSitemapInspector posts={posts} />}

        {activeTab === 'starter-code' && <ArchitectureCodebaseView />}

        {activeTab === 'architecture-diagram' && <InteractiveArchitectureDiagram />}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">WordPress-Headless-NextJS-Starter</span>
            <span>•</span>
            <span>Enterprise Decoupled Production Blueprint</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>WPGraphQL 1.28</span>
            <span>•</span>
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Edge ISR Caching</span>
            <span>•</span>
            <span>TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
