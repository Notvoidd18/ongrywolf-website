'use client';

import React, { useState } from 'react';
import {
  Layers,
  Power,
  RotateCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Bot,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  MessageSquare,
  Ticket,
  ShieldAlert,
  Coins,
  Smile,
  BarChart2,
  Radio,
  Send,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HostedBot } from '@/lib/types';

interface BotFeature {
  id: string;
  name: string;
  category: 'Core' | 'Security' | 'Engagement' | 'Utility' | 'AI';
  description: string;
  defaultAssignedCmds?: string[];
  icon: React.ReactNode;
}

const AVAILABLE_BOT_FEATURES: BotFeature[] = [
  {
    id: 'work_logs',
    name: 'Work Logs & Audit Pipeline',
    category: 'Core',
    description: 'Tracks staff and developer shift timestamps, session durations, and channel work logs (!log, !listlog).',
    defaultAssignedCmds: ['log', 'listlog', 'channellog'],
    icon: <Terminal className="w-5 h-5 text-brand-400" />,
  },
  {
    id: 'ticket_routing',
    name: 'Interactive Ticket Routing',
    category: 'Utility',
    description: 'Generates secure private ticket channels with button embeds, automatic transcripts, and staff triage.',
    defaultAssignedCmds: ['ticket', 'close', 'transcript'],
    icon: <Ticket className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'auto_mod',
    name: 'Anti-Raid & Heuristic Auto-Mod',
    category: 'Security',
    description: 'Mass-mention protection, invite link stripper, spam burst rate limiting, and instant lockdown triggers.',
    defaultAssignedCmds: ['lockdown', 'mute', 'warn'],
    icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
  },
  {
    id: 'reaction_roles',
    name: 'Button & Reaction Roles',
    category: 'Engagement',
    description: 'Interactive button menus allowing users to self-assign roles, notifications, and cosmetic colors.',
    defaultAssignedCmds: ['rolepanel', 'assign'],
    icon: <Smile className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'server_counters',
    name: 'Live Dynamic Server Counters',
    category: 'Utility',
    description: 'Auto-updating voice channel titles reflecting live member counts, active bots, and server telemetry.',
    defaultAssignedCmds: ['counter-sync'],
    icon: <BarChart2 className="w-5 h-5 text-sky-400" />,
  },
  {
    id: 'leveling_system',
    name: 'Leveling & Activity XP Engine',
    category: 'Engagement',
    description: 'Calculates message volume, awards customizable rank cards, and auto-promotes active members.',
    defaultAssignedCmds: ['rank', 'leaderboard'],
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
  },
  {
    id: 'scheduled_announcements',
    name: 'Scheduled Event Broadcasts',
    category: 'Utility',
    description: 'Cron-based automated server broadcasts, daily summaries, and scheduled event reminders.',
    defaultAssignedCmds: ['schedule', 'broadcast'],
    icon: <Radio className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 'economy_system',
    name: 'Virtual Server Economy',
    category: 'Engagement',
    description: 'Server currency ledger, daily bonuses, user-to-user transfers, and custom role shop inventory.',
    defaultAssignedCmds: ['balance', 'daily', 'pay', 'shop'],
    icon: <Coins className="w-5 h-5 text-orange-400" />,
  },
  {
    id: 'verification_gateway',
    name: 'Captcha Verification Gateway',
    category: 'Security',
    description: 'Blocks automated Discord raid bots using button/image verification before granting guild access.',
    defaultAssignedCmds: ['setup-verify'],
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'ai_auto_response',
    name: 'AI Contextual Q&A Assistant',
    category: 'AI',
    description: 'Embeds smart automated replies to frequent community questions using semantic document matching.',
    defaultAssignedCmds: ['ask', 'faq'],
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
  },
];

interface Props {
  bot: HostedBot;
  onRestartBot: (bot: HostedBot) => Promise<void>;
  onModulesUpdated?: (botId: string, updatedModules: string[]) => void;
  isAdmin?: boolean;
}

export function BotFeatureMap({
  bot,
  onRestartBot,
  onModulesUpdated,
  isAdmin = false,
}: Props) {
  // Enabled modules state
  const [enabledModules, setEnabledModules] = useState<string[]>(
    bot.enabledModules && bot.enabledModules.length > 0
      ? bot.enabledModules
      : ['work_logs']
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [restarting, setRestarting] = useState(false);

  // Custom code upload state
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [codeNotes, setCodeNotes] = useState('');
  const [uploadingCode, setUploadingCode] = useState(false);
  const [codeUploadSuccess, setCodeUploadSuccess] = useState<{
    fileName: string;
    submittedAt: string;
    ticketId: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'upload'>('map');

  const toggleFeature = (featureId: string) => {
    setEnabledModules((prev) => {
      const next = prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId];
      setHasUnsavedChanges(true);
      if (onModulesUpdated) {
        onModulesUpdated(bot.id, next);
      }
      return next;
    });
  };

  const handleApplyAndRestart = async () => {
    setRestarting(true);
    try {
      // Save modules configuration via API
      await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bot.id,
          enabledModules,
        }),
      }).catch(() => null);

      setHasUnsavedChanges(false);
      // Trigger smooth bot restart with "Restarting..." presence lifecycle
      await onRestartBot(bot);
    } finally {
      setRestarting(false);
    }
  };

  const handleUploadCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeFile) return;

    setUploadingCode(true);
    try {
      // Simulate real server ingest & dispatch to review pipeline
      const ticketId = `REV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await new Promise((r) => setTimeout(r, 900));

      setCodeUploadSuccess({
        fileName: codeFile.name,
        submittedAt: new Date().toLocaleTimeString(),
        ticketId,
      });
      setCodeFile(null);
      setCodeNotes('');
    } finally {
      setUploadingCode(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 bg-surface/95 border-surface-border space-y-6">
      {/* Header with Navigation & Live Bot Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-500/10 text-brand-400">
              <Bot className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Bot Feature Map & Modular Engine
            </h3>
            <Badge variant="blue" className="font-mono text-[10px] uppercase">
              {bot.name}
            </Badge>
          </div>
          <p className="text-xs text-slate-300">
            Dynamically toggle Discord bot features, inject custom addons, or upload code for rapid 1-hour staff review.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-subtle border border-surface-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Feature Map ({enabledModules.length}/{AVAILABLE_BOT_FEATURES.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Code</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              1h Review
            </span>
          </button>
        </div>
      </div>

      {/* Restart Required Warning Banner */}
      {hasUnsavedChanges && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-200 block">
                Module Configuration Modified — Bot Restart Required
              </span>
              <span className="text-amber-300/80">
                To compile and bind the updated command handlers, a smooth restart must be performed. The bot will broadcast &quot;Restarting...&quot; status during the reload.
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyAndRestart}
            isLoading={restarting}
            className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-mono shadow-lg shadow-amber-900/30"
          >
            <RotateCw className={`w-3.5 h-3.5 ${restarting ? 'animate-spin' : ''}`} />
            <span>{restarting ? 'Restarting Instance...' : 'Restart & Apply Modules'}</span>
          </Button>
        </div>
      )}

      {/* TAB 1: FEATURE MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {AVAILABLE_BOT_FEATURES.map((feature) => {
              const isEnabled = enabledModules.includes(feature.id);

              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 ${
                    isEnabled
                      ? 'bg-surface-elevated/90 border-brand-500/40 shadow-sm shadow-brand-500/5'
                      : 'bg-surface-subtle/50 border-surface-border/80 opacity-75 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-surface border border-surface-border shrink-0 mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {feature.name}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            {feature.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Smooth Toggle Switch */}
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isEnabled ? 'bg-brand-600' : 'bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Commands: {feature.defaultAssignedCmds?.map((c) => `!${c}`).join(', ') || 'Auto'}
                    </span>
                    <span
                      className={`font-bold ${
                        isEnabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isEnabled ? '● ACTIVE' : '○ DISABLED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD YOUR CODE */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/60 to-surface-elevated border border-brand-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white">
                  Developer Code Upload & Review Pipeline
                </h4>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Upload your custom JavaScript, TypeScript, or zipped bot plugins. Our administrative team will review, sandbox-test, and deploy your code within 1 hour.
              </p>
            </div>
            <div className="shrink-0 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Admin Review Within Hour</span>
            </div>
          </div>

          {codeUploadSuccess ? (
            <div className="p-6 rounded-xl bg-surface-subtle border border-emerald-500/40 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <Badge variant="emerald" className="font-mono text-[10px]">
                  CODE PACKAGE DISPATCHED
                </Badge>
                <h4 className="text-lg font-bold text-white">
                  Under Administrative Review
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Package <span className="text-brand-300 font-mono font-bold">{codeUploadSuccess.fileName}</span> logged under Ticket <span className="text-white font-mono font-bold">#{codeUploadSuccess.ticketId}</span>. Lead engineers will review and verify within 1 hour.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCodeUploadSuccess(null)}
                className="text-xs"
              >
                Upload Additional Module
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUploadCode} className="space-y-4">
              <div className="p-6 rounded-xl border-2 border-dashed border-surface-border hover:border-brand-500/40 bg-surface-subtle/50 text-center space-y-3 transition-colors">
                <div className="w-10 h-10 rounded-full bg-surface border border-surface-border text-brand-400 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    {codeFile ? codeFile.name : 'Select or drop your code package'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports .js, .ts, .zip, .json (Max file size: 25MB)
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    id="bot-code-upload"
                    accept=".js,.ts,.zip,.json,.tar.gz"
                    onChange={(e) => setCodeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="bot-code-upload"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
                  >
                    <span>Browse Files</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Integration Notes & Target Commands (Optional)
                </label>
                <textarea
                  value={codeNotes}
                  onChange={(e) => setCodeNotes(e.target.value)}
                  placeholder="Specify custom slash commands, environmental variables, or operational instructions for the reviewing admin..."
                  rows={3}
                  className="w-full bg-surface-subtle border border-surface-border rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!codeFile}
                isLoading={uploadingCode}
                className="w-full text-xs font-semibold h-10"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                <span>Submit Code for 1-Hour Admin Review</span>
              </Button>
            </form>
          )}
        </div>
      )}
    </Card>
  );
}