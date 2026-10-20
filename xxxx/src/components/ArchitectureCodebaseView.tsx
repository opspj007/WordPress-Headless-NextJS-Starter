import { useState } from 'react';
import { STARTER_CODEBASE_FILES } from '../data/mockWordPressData.ts';
import {
  Code,
  Copy,
  Check,
  FileCode2,
  FolderGit2,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  Server,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export function ArchitectureCodebaseView() {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const activeFile = STARTER_CODEBASE_FILES[selectedFileIndex] || STARTER_CODEBASE_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 1500);
  };

  const handleExportAll = () => {
    const bundle = {
      project: 'WordPress-Headless-NextJS-Starter',
      version: '15.2.0',
      description: 'Enterprise Decoupled WordPress and Next.js 15 Starter Architecture',
      files: STARTER_CODEBASE_FILES.map((f) => ({
        path: f.path,
        category: f.category,
        description: f.description,
        content: f.code,
      })),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wordpress-headless-nextjs-starter.json';
    a.click();
    URL.revokeObjectURL(url);

    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Enterprise Starter Codebase & Repository</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Next.js 15 + TypeScript
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Senior engineering reference files: production GraphQL fetchers, dynamic ISR routes, draft mode API, and Docker orchestration.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
        >
          {copiedAll ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
          <span>{copiedAll ? 'Exported Package!' : 'Export Starter Package (JSON)'}</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left File Tree Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>Repository Files</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{STARTER_CODEBASE_FILES.length} Files</span>
            </div>

            <div className="p-2 space-y-1">
              {STARTER_CODEBASE_FILES.map((file, idx) => {
                const isSelected = selectedFileIndex === idx;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{file.path}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senior Architect Engineering Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-xs">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Production Design Decisions</span>
            </h3>

            <div className="space-y-3 text-slate-400 text-[11px] leading-relaxed">
              <div className="border-l-2 border-blue-500 pl-3">
                <strong className="text-slate-200 block">Sub-100ms Invalidation vs TTL Polling:</strong>
                Never poll WordPress on every request. Rely exclusively on tag-based edge cache invalidation (<code>revalidateTag</code>) triggered by WordPress <code>save_post</code> hooks.
              </div>

              <div className="border-l-2 border-emerald-500 pl-3">
                <strong className="text-slate-200 block">Shielding WordPress Core:</strong>
                Place WordPress in a private VPC. The public web only speaks with Next.js edge nodes, eliminating 100% of brute-force wp-login.php exploits.
              </div>

              <div className="border-l-2 border-amber-500 pl-3">
                <strong className="text-slate-200 block">Offloading Image Optimization:</strong>
                Use Next.js <code>next/image</code> to convert WordPress uploads into WebP/AVIF on-demand, reducing media bandwidth by 70-80% without stressing the PHP server.
              </div>
            </div>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            {/* File Path & Copy Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-300 text-sm">{activeFile.path}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    {activeFile.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{activeFile.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors border border-slate-700 shadow-sm"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="p-4 bg-slate-950 font-mono text-xs overflow-auto max-h-[600px]">
              <pre className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-wrap">
                {activeFile.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
