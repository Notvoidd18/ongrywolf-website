'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  ArrowRight,
  ShieldCheck,
  Radio,
  Cpu,
  Lock,
  Edit3,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  showExploreLink?: boolean;
}

interface WorkspaceState {
  title: string;
  description: string;
  notice: string;
  activeModulesCount: number;
  lastUpdated: string;
  updatedBy: string;
}

export function SelectedWorkWorkspace({ showExploreLink = true }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    title: 'Workspace is empty',
    description:
      'No public project records or custom plugin modules published yet. In upcoming updates, custom plugins, user ID attribution (OW-XXXX), live online status, and developer bios will dynamically render in this space.',
    notice: 'Admin-managed official registry (Protected)',
    activeModulesCount: 42,
    lastUpdated: 'Nov 2026',
    updatedBy: 'notvoid18 (Admin)',
  });

  const [editTitle, setEditTitle] = useState(workspace.title);
  const [editDescription, setEditDescription] = useState(workspace.description);
  const [editNotice, setEditNotice] = useState(workspace.notice);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Check if current user is owner/admin
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.isOwner) {
          setIsAdmin(true);
        }
      })
      .catch(() => null);

    // Load persisted workspace state from localStorage if updated by admin
    try {
      const stored = localStorage.getItem('ongrywolf_workspace_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWorkspace((prev) => ({ ...prev, ...parsed }));
        setEditTitle(parsed.title || workspace.title);
        setEditDescription(parsed.description || workspace.description);
        setEditNotice(parsed.notice || workspace.notice);
      }
    } catch {}
  }, []);

  const handleSaveAdminConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const nextState: WorkspaceState = {
      ...workspace,
      title: editTitle.trim() || 'Workspace is empty',
      description: editDescription.trim(),
      notice: editNotice.trim(),
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      updatedBy: 'notvoid18 (Admin)',
    };

    setWorkspace(nextState);
    localStorage.setItem('ongrywolf_workspace_config', JSON.stringify(nextState));
    setIsEditing(false);
    setSavedFeedback('Workspace content updated successfully.');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Admin Quick Control Pill (Only rendered for verified Admin) */}
      {isAdmin && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-border text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">
              Administrator Permissions Verified: You have exclusive rights to edit this workspace.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Workspace'}</span>
          </button>
        </div>
      )}

      {savedFeedback && (
        <div className="p-3 rounded bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Admin Inline Editor */}
      {isEditing && isAdmin ? (
        <form onSubmit={handleSaveAdminConfig} className="p-6 rounded-2xl bg-surface border border-brand-500/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Update Public Workspace (Admin Exclusive)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Strict Auth Protocol</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Workspace Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Workspace Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Admin Notice Badge</label>
            <input
              type="text"
              value={editNotice}
              onChange={(e) => setEditNotice(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Updates
            </Button>
          </div>
        </form>
      ) : (
        /* Unslopped Quiet Obsidian Workspace Container */
        <div className="relative rounded-2xl p-8 sm:p-12 bg-surface border border-surface-border text-center overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto space-y-5">
            <div className="w-14 h-14 rounded-xl bg-surface-subtle border border-surface-border mx-auto flex items-center justify-center text-brand-400">
              <FolderGit2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-subtle border border-surface-border text-slate-300 font-mono text-[11px]">
                <Radio className="w-3 h-3 text-brand-400" />
                <span>{workspace.notice}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {workspace.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {workspace.description}
              </p>
            </div>

            {/* Architecture Spec Grid */}
            <div className="pt-3 pb-1">
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-left space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-surface-border">
                  <span className="flex items-center gap-1.5 text-brand-300 font-medium">
                    <Cpu className="w-3.5 h-3.5" />
                    Plugin & Identity Architecture
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Admin Governed</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-surface border border-surface-border">
                    <span className="text-slate-400 block text-[10px]">Client ID</span>
                    <span className="text-white font-medium">OW-XXXX</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-surface-border">
                    <span className="text-slate-400 block text-[10px]">Runtime Mod</span>
                    <span className="text-emerald-400 font-medium">Online</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-surface-border">
                    <span className="text-slate-400 block text-[10px]">Bot Fleet Prefix</span>
                    <span className="text-brand-300 font-medium">/ (40+ Cmds)</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-surface-border">
                    <span className="text-slate-400 block text-[10px]">Free Bot Quota</span>
                    <span className="text-white font-medium">1 Active (1/1)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <span>Initiate Project Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/bots"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-subtle hover:bg-surface-elevated text-slate-300 hover:text-white border border-surface-border font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <span>Manage Live Bots</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
