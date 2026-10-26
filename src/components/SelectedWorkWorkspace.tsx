'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  User,
  PlusCircle,
  Cpu,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  showExploreLink?: boolean;
}

export function SelectedWorkWorkspace({ showExploreLink = true }: Props) {
  return (
    <div className="space-y-8 w-full">
      {/* Empty State Futuristic Container */}
      <div className="relative rounded-2xl p-8 sm:p-12 bg-gradient-to-b from-[#0c1220]/90 via-[#090d18]/95 to-[#050810]/98 border border-white/[0.08] text-center overflow-hidden shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 mx-auto flex items-center justify-center text-brand-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <FolderGit2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-[11px] uppercase tracking-wider">
              <Radio className="w-3 h-3 text-brand-400 animate-pulse" />
              PORTFOLIO REGISTRY READY
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Workspace is empty
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No public project records or custom plugin modules published yet. In upcoming updates, custom plugins, user ID attribution (<code className="text-brand-300 font-mono">OW-XXXX</code>), live online status, and developer bios will dynamically render in this space.
            </p>
          </div>

          {/* Blueprint Schema Preview for Future Plugins & User Projects */}
          <div className="pt-4 pb-2">
            <div className="p-4 rounded-xl bg-surface/80 border border-white/[0.06] text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-surface-border">
                <span className="flex items-center gap-1.5 text-brand-300 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  Upcoming Plugin & Identity Spec
                </span>
                <span className="text-[10px] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Schema v2.0 Staged
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-surface-subtle/80 border border-surface-border">
                  <span className="text-slate-400 block text-[10px]">Client ID</span>
                  <span className="text-white font-bold">OW-XXXX</span>
                </div>
                <div className="p-2 rounded bg-surface-subtle/80 border border-surface-border">
                  <span className="text-slate-400 block text-[10px]">Runtime Mod</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
                <div className="p-2 rounded bg-surface-subtle/80 border border-surface-border">
                  <span className="text-slate-400 block text-[10px]">Plugin Engine</span>
                  <span className="text-brand-300 font-bold">Custom Ext</span>
                </div>
                <div className="p-2 rounded bg-surface-subtle/80 border border-surface-border">
                  <span className="text-slate-400 block text-[10px]">Creator Bio</span>
                  <span className="text-slate-300 font-bold">Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-lg shadow-brand-500/20"
            >
              <span>Initiate Project Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/bots"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] font-mono text-xs uppercase tracking-wider transition-all"
            >
              <span>Manage Live Bots</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}