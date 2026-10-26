'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HostedBot, UserBotProfile, UserSession } from '@/lib/types';
import { SanitizedLogEntry } from '@/lib/botHostClient';
import {
  Bot,
  Plus,
  Trash2,
  RefreshCw,
  Power,
  RotateCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Clock,
  Terminal,
  FileCode,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  AlertTriangle,
  User,
  Settings2,
  Tv2,
  Mic2,
  Eye,
  Gamepad2,
  Radio,
  Moon,
  EyeOff,
  Loader2,
  Zap,
} from 'lucide-react';
import { BotFleetMetricsGraph } from '@/components/admin/BotFleetMetricsGraph';

interface Props {
  initialHostedBots: HostedBot[];
  initialUserConfigs: UserBotProfile[];
  initialUsers: UserSession[];
  initialUptime: { seconds: number; formatted: string; bootTime: string };
  initialRemoteHealth?: { ok: boolean; uptimeSeconds?: number; totalBots?: number; onlineBots?: number; error?: string };
}

export function AdminBotsManager({
  initialHostedBots,
  initialUserConfigs,
  initialUsers,
  initialUptime,
  initialRemoteHealth,
}: Props) {
  const [hostedBots, setHostedBots] = useState<HostedBot[]>(initialHostedBots);
  const [uptime, setUptime] = useState(initialUptime);
  const [remoteHealth, setRemoteHealth] = useState(initialRemoteHealth || { ok: false });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);
  const [probingBotId, setProbingBotId] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'error'>('all');

  // Logs modal state
  const [activeLogsBot, setActiveLogsBot] = useState<HostedBot | null>(null);
  const [logs, setLogs] = useState<SanitizedLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Delete modal state
  const [deletingBot, setDeletingBot] = useState<HostedBot | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Presence control panel state (per bot inline edit)
  const [presenceEditingBotId, setPresenceEditingBotId] = useState<string | null>(null);
  const [presenceForm, setPresenceForm] = useState<{
    onlineMode: 'online' | 'idle' | 'dnd' | 'invisible';
    statusType: string;
    statusText: string;
    streamingUrl: string;
  }>({ onlineMode: 'online', statusType: 'Custom', statusText: '', streamingUrl: '' });
  const [presenceSaving, setPresenceSaving] = useState(false);

  // New bot form state
  const [botName, setBotName] = useState('');
  const [clientId, setClientId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [statusText, setStatusText] = useState('Hosting on Ongrywolf');
  const [hostingEnv, setHostingEnv] = useState<'Dedicated (Render)' | 'Ongrywolf PRV' | 'Self-Hosted VPS'>('Dedicated (Render)');
  const [prefix, setPrefix] = useState('!');
  const [assignedCommands, setAssignedCommands] = useState('log, listlog, channellog');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Live token test state inside form
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [tokenTesting, setTokenTesting] = useState(false);
  const [tokenBotInfo, setTokenBotInfo] = useState<any>(null);

  // Export .env helper
  const [exportingBot, setExportingBot] = useState<HostedBot | null>(null);
  const [copied, setCopied] = useState(false);

  // Live real-time platform uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => {
        const nextSeconds = prev.seconds + 1;
        const days = Math.floor(nextSeconds / 86400);
        const hours = Math.floor((nextSeconds % 86400) / 3600);
        const minutes = Math.floor((nextSeconds % 3600) / 60);
        const seconds = nextSeconds % 60;
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        return {
          ...prev,
          seconds: nextSeconds,
          formatted: parts.join(' '),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live probe refresh
  const refreshBots = async () => {
    setProbing(true);
    try {
      const res = await fetch('/api/admin/bots');
      const data = await res.json();
      if (res.ok && data.hostedBots) {
        setHostedBots(data.hostedBots);
        if (data.serverUptime) setUptime(data.serverUptime);
        if (data.remoteHostHealth) setRemoteHealth(data.remoteHostHealth);
      }
    } catch (e) {
      console.error('Failed to probe bots:', e);
    } finally {
      setProbing(false);
    }
  };

  // Instant per-bot Discord latency probe
  const handleProbeSingleBot = async (botId: string) => {
    setProbingBotId(botId);
    try {
      const res = await fetch('/api/admin/bots/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: botId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHostedBots((prev) =>
          prev.map((b) =>
            b.id === botId
              ? {
                  ...b,
                  pingMs: data.pingMs,
                  observedState: data.observedState,
                  avatarUrl: data.avatarUrl || b.avatarUrl,
                  lastError: undefined,
                }
              : b
          )
        );
        setFeedback(`Live probe: Discord REST response time is ${data.pingMs} ms.`);
      } else {
        setHostedBots((prev) =>
          prev.map((b) =>
            b.id === botId
              ? {
                  ...b,
                  observedState: data.observedState || 'error',
                  lastError: data.lastError || 'Probe failed',
                  pingMs: data.pingMs,
                }
              : b
          )
        );
        setFeedback(`Discord probe issue: ${data.lastError || 'Failed to reach Discord'}`);
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message);
    } finally {
      setProbingBotId(null);
    }
  };

  // Test token live against Discord API
  const handleTestToken = async () => {
    if (!botToken.trim()) return;
    setTokenTesting(true);
    setTokenVerified(null);
    setTokenBotInfo(null);

    try {
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${botToken.trim()}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTokenVerified(true);
        setTokenBotInfo(data);
        if (!botName) setBotName(data.username);
        if (!clientId) setClientId(data.id);
      } else {
        setTokenVerified(false);
      }
    } catch (e) {
      setTokenVerified(false);
    } finally {
      setTokenTesting(false);
    }
  };

  // Submit new bot upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim() || !clientId.trim()) {
      alert('Bot Name and Client ID are required.');
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('name', botName.trim());
      formData.append('clientId', clientId.trim());
      formData.append('token', botToken.trim());
      formData.append('statusText', statusText.trim());
      formData.append('hostingEnv', hostingEnv);
      formData.append('prefix', prefix.trim());
      formData.append('assignedCommands', assignedCommands);
      formData.append('description', description.trim());

      if (selectedFile) {
        formData.append('codeArchive', selectedFile);
      }

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload bot');
      }

      setFeedback(`Bot "${data.bot.name}" successfully deployed to hosting!`);
      setShowUploadModal(false);

      // Reset form
      setBotName('');
      setClientId('');
      setBotToken('');
      setDescription('');
      setSelectedFile(null);
      setTokenVerified(null);
      setTokenBotInfo(null);

      // Refresh fleet
      refreshBots();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle power (Start / Stop)
  const handleTogglePower = async (bot: HostedBot) => {
    const newState = !bot.desiredEnabled;
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bot.id, enabled: newState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle bot power');
      }

      setHostedBots((prev) =>
        prev.map((b) =>
          b.id === bot.id
            ? { ...b, desiredEnabled: newState, observedState: newState ? 'online' : 'offline' }
            : b
        )
      );

      setFeedback(`Bot "${bot.name}" ${newState ? 'started' : 'stopped'}.`);
      setTimeout(() => setFeedback(null), 3000);
      refreshBots();
    } catch (e: any) {
      setFeedback(e.message);
    }
  };

  // Restart bot on Render 1
  const handleRestartBot = async (bot: HostedBot) => {
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bot.id, action: 'restart' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to restart bot');
      }

      setFeedback(`Bot "${bot.name}" restarted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
      refreshBots();
    } catch (e: any) {
      setFeedback(e.message);
    }
  };

  // Open presence control panel for a bot
  const handleOpenPresence = (bot: HostedBot) => {
    setPresenceEditingBotId(bot.id);
    setPresenceForm({
      onlineMode: (bot.onlineMode as any) || 'online',
      statusType: (bot as any).statusType || 'Custom',
      statusText: bot.statusText || '',
      streamingUrl: (bot as any).streamingUrl || '',
    });
  };

  // Save presence config to Render 1 via API
  const handleSavePresence = async (bot: HostedBot) => {
    setPresenceSaving(true);
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bot.id,
          action: 'config',
          updates: {
            statusText: presenceForm.statusText,
            statusType: presenceForm.statusType,
            onlineMode: presenceForm.onlineMode,
            streamingUrl: presenceForm.statusType === 'Streaming' ? presenceForm.streamingUrl : undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update presence');
      }

      setFeedback(`✓ Presence for "${bot.name}" updated live on Discord!`);
      setPresenceEditingBotId(null);
      setTimeout(() => setFeedback(null), 4000);
      refreshBots();
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setPresenceSaving(false);
    }
  };

  // Open Logs
  const handleOpenLogs = async (bot: HostedBot) => {
    setActiveLogsBot(bot);
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/bots/logs?id=${bot.id}`);
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Confirm delete bot
  const handleConfirmDelete = async () => {
    if (!deletingBot) return;
    setDeleting(true);

    try {
      const res = await fetch('/api/admin/bots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingBot.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete bot');
      }

      setHostedBots((prev) => prev.filter((b) => b.id !== deletingBot.id));
      setFeedback(`Bot "${deletingBot.name}" permanently removed from hosting runtime and cloud host.`);
      setDeletingBot(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filter bots
  const filteredBots = hostedBots.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.clientId.includes(search) ||
      (b.ownerAccount && b.ownerAccount.toLowerCase().includes(search.toLowerCase())) ||
      (b.username && b.username.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'online'
        ? b.observedState === 'online'
        : statusFilter === 'offline'
        ? b.observedState === 'offline'
        : b.observedState === 'error';

    return matchesSearch && matchesStatus;
  });

  const onlineCount = hostedBots.filter((b) => b.observedState === 'online').length;
  const avgPing =
    hostedBots.filter((b) => b.pingMs && b.pingMs > 0).length > 0
      ? Math.round(
          hostedBots
            .filter((b) => b.pingMs && b.pingMs > 0)
            .reduce((acc, curr) => acc + (curr.pingMs || 0), 0) /
            hostedBots.filter((b) => b.pingMs && b.pingMs > 0).length
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Remote Host Health Banner */}
      <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
        remoteHealth.ok
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 shrink-0" />
          <span>
            {remoteHealth.ok
              ? 'Ongrywolf Cloud Management API is reachable and connected. Process isolation active.'
              : 'Ongrywolf Cloud API is currently reconnecting. Displaying cached local bot configurations.'}
          </span>
        </div>
        <Badge variant={remoteHealth.ok ? 'emerald' : 'amber'}>
          {remoteHealth.ok ? 'CLOUD RUNTIME CONNECTED' : 'STANDBY MODE'}
        </Badge>
      </div>

      {feedback && (
        <div className="p-3.5 rounded bg-surface border border-surface-border text-xs text-brand-300 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Real-Time Fleet Diagnostics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 bg-surface">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Fleet Status</span>
            <Server className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <span>{onlineCount} / {hostedBots.length}</span>
            <span className="text-xs font-normal text-emerald-400 font-sans">Active</span>
          </div>
          <p className="text-[10px] text-slate-500">Bots deployed on Ongrywolf hosting</p>
        </Card>

        <Card className="p-4 space-y-1 bg-surface">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Discord REST Latency</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {avgPing ? `${avgPing} ms` : 'Live Probing...'}
          </div>
          <p className="text-[10px] text-slate-500">Real round-trip API ping</p>
        </Card>

        <Card className="p-4 space-y-1 bg-surface">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Platform Uptime</span>
            <Clock className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {uptime.formatted}
          </div>
          <p className="text-[10px] text-slate-500">Continuous runtime duration</p>
        </Card>

        <Card className="p-4 space-y-1 bg-surface">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Registered Users</span>
            <User className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {initialUsers.length}
          </div>
          <p className="text-[10px] text-slate-500">Platform user accounts</p>
        </Card>
      </div>

      {/* Real-Time Working Fleet Telemetry & Bot Status Graphs */}
      <BotFleetMetricsGraph
        bots={hostedBots}
        onRefresh={refreshBots}
        isRefreshing={probing}
      />

      {/* Action Header & Search Bar */}
      <Card className="p-4 bg-surface border-surface-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-400" />
              Hosted Bot Fleet ({hostedBots.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Centralized owner management for all system and client bot processes running on Ongrywolf Cloud.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshBots}
              isLoading={probing}
              className="text-xs flex items-center gap-1.5"
              title="Probe Discord API health for all bots"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Probe Health</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowUploadModal(!showUploadModal)}
              className="text-xs flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload & Host New Bot</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-border">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by bot name, Client ID, owner account, Discord tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses ({hostedBots.length})</option>
              <option value="online">Online Only ({hostedBots.filter((b) => b.observedState === 'online').length})</option>
              <option value="offline">Offline Only ({hostedBots.filter((b) => b.observedState === 'offline').length})</option>
              <option value="error">Error Only ({hostedBots.filter((b) => b.observedState === 'error').length})</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Upload New Bot Drawer */}
      {showUploadModal && (
        <Card className="p-6 space-y-5 border-brand-500/50 bg-surface">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" />
                Upload & Host New Bot on Ongrywolf Cloud
              </h4>
              <p className="text-[11px] text-slate-400">
                Register a new Discord bot into the hosting runtime. Upload bot code archive or configure credentials.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Bot Name</label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. Violate or Custom Bot"
                  required
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Application / Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 1250267167065112616"
                  required
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Token with live test */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Bot Token (Stored securely server-side on cloud runtime)</span>
                <span className="text-[10px] text-slate-400">Never exposed to browser</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => {
                    setBotToken(e.target.value);
                    setTokenVerified(null);
                  }}
                  placeholder="Paste bot token (starts with MTU...)"
                  className="flex-1 px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleTestToken}
                  isLoading={tokenTesting}
                  disabled={!botToken.trim()}
                  className="text-xs shrink-0"
                >
                  Verify Token
                </Button>
              </div>

              {tokenVerified === true && (
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Valid token! Verified Discord Bot: <strong>{tokenBotInfo?.username}</strong> ({tokenBotInfo?.id})
                  </span>
                </div>
              )}

              {tokenVerified === false && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Discord API rejected this token. Please check and try again.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Hosting Environment</label>
                <select
                  value={hostingEnv}
                  onChange={(e: any) => setHostingEnv(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Dedicated (Render)">Dedicated Ongrywolf Cloud</option>
                  <option value="Ongrywolf PRV">Ongrywolf PRV (Private Instance)</option>
                  <option value="Self-Hosted VPS">Self-Hosted VPS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Status Text</label>
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="Hosting on Ongrywolf"
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Command Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="!"
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Assigned Official Commands</label>
              <input
                type="text"
                value={assignedCommands}
                onChange={(e) => setAssignedCommands(e.target.value)}
                placeholder="log, listlog, channellog"
                className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-400">Comma-separated command names</span>
            </div>

            {/* Code Upload File Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Upload Bot Code Package (.zip, .js, .ts)</label>
              <div className="border border-dashed border-surface-border rounded-lg p-4 text-center hover:border-brand-500/50 transition-colors bg-surface-subtle">
                <input
                  type="file"
                  id="codeArchive"
                  accept=".zip,.tar.gz,.js,.ts"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="codeArchive" className="cursor-pointer block space-y-1">
                  <FileCode className="w-6 h-6 text-brand-400 mx-auto" />
                  <div className="text-xs font-medium text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to select bot code archive (.zip)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Optional source code archive for deployment'}
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bot purpose, assigned server, notes..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={loading}
                className="bg-brand-600 hover:bg-brand-500 text-white"
              >
                Deploy Bot to Ongrywolf Cloud
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Hosted Bots Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBots.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-xs bg-surface rounded border border-surface-border">
            No bots match the specified search or filter criteria.
          </div>
        ) : (
          filteredBots.map((bot) => (
            <Card key={bot.id} className="p-5 space-y-4 bg-surface border-surface-border flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                {/* Bot Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {bot.avatarUrl ? (
                      <img
                        src={bot.avatarUrl}
                        alt={bot.name}
                        className="w-10 h-10 rounded-full border border-surface-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-900/60 border border-brand-700 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {bot.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{bot.name}</h4>
                        {bot.username && (
                          <span className="text-[11px] text-slate-400 font-mono">@{bot.username}</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        App ID: {bot.clientId} {bot.botId ? `• Snowflake: ${bot.botId}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Live Health Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant={bot.observedState === 'online' ? 'emerald' : bot.observedState === 'error' ? 'rose' : 'neutral'}>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${bot.observedState === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {bot.observedState.toUpperCase()}
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Bot Specs & Health Metrics */}
                <div className="grid grid-cols-4 gap-2 bg-surface-subtle p-2.5 rounded border border-surface-border text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Gateway</div>
                    <div className="text-[11px] font-mono font-bold text-white">
                      {bot.gatewayStatus || (bot.observedState === 'online' ? 'connected' : 'offline')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Ping</div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {bot.pingMs ? `${bot.pingMs} ms` : 'N/A'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleProbeSingleBot(bot.id)}
                        disabled={probingBotId === bot.id}
                        className="p-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Probe ping now"
                      >
                        <RefreshCw className={`w-3 h-3 ${probingBotId === bot.id ? 'animate-spin text-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Guilds</div>
                    <div className="text-xs font-mono font-bold text-white">
                      {bot.guildCount || 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Prefix</div>
                    <div className="text-xs font-mono font-bold text-white">
                      {bot.prefix}
                    </div>
                  </div>
                </div>

                {/* Status, Uptime, Activity and commands */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Owner Account:</span>
                    <span className="font-mono text-brand-300 font-semibold">{bot.ownerAccount || 'notvoid18'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Status Watermark:</span>
                    <span className="font-medium text-white">{bot.statusText}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Uptime:</span>
                    <span className="font-mono text-white text-[11px]">
                      {bot.observedState === 'online'
                        ? `Active (${bot.uptimeSeconds ? `${Math.floor(bot.uptimeSeconds / 3600)}h ${Math.floor((bot.uptimeSeconds % 3600) / 60)}m` : 'Online'})`
                        : 'Stopped'}
                    </span>
                  </div>

                  {bot.resourceUsage && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Host Memory:</span>
                      <span className="font-mono text-slate-300 text-[11px]">{bot.resourceUsage.memoryMb} MB</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between text-[11px]">
                    <span className="text-slate-400 shrink-0">Commands:</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {bot.assignedCommands.map((cmd) => (
                        <span
                          key={cmd}
                          className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-surface-border text-slate-200"
                        >
                          /{cmd}
                        </span>
                      ))}
                    </div>
                  </div>

                  {bot.codeArchiveName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Code Archive:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-brand-300 truncate max-w-[140px]">
                          {bot.codeArchiveName}
                        </span>
                        <a
                          href={`/api/admin/bots/download?id=${bot.id}`}
                          download={bot.codeArchiveName}
                          className="text-[10px] text-brand-400 hover:text-brand-300 inline-flex items-center gap-0.5"
                          title="Download package"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {bot.lastError && bot.observedState !== 'online' && (
                    <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block">{bot.lastError}</span>
                        {bot.lastError.toLowerCase().includes('disallowed') && (
                          <span className="text-[10px] text-rose-400/90 block leading-relaxed">
                            Tip: In Discord Developer Portal &gt; Bot &gt; Privileged Gateway Intents, enable Message Content Intent, or click Restart to reconnect with standard intents.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Presence Control Panel ── */}
              {presenceEditingBotId === bot.id ? (
                <div className="mt-3 p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                      Live Presence Control
                    </div>
                    <button
                      onClick={() => setPresenceEditingBotId(null)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Online Mode */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Online Mode</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([
                        { value: 'online', label: 'Online', color: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
                        { value: 'idle', label: 'Idle', color: 'bg-amber-400', ring: 'ring-amber-400/40' },
                        { value: 'dnd', label: 'DND', color: 'bg-rose-500', ring: 'ring-rose-500/40' },
                        { value: 'invisible', label: 'Invisible', color: 'bg-slate-500', ring: 'ring-slate-500/40' },
                      ] as const).map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setPresenceForm((f) => ({ ...f, onlineMode: mode.value }))}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            presenceForm.onlineMode === mode.value
                              ? `border-current text-white ring-2 ${mode.ring} bg-white/5`
                              : 'border-surface-border text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                          style={presenceForm.onlineMode === mode.value ? { color: mode.color.replace('bg-', '#').split('-')[0] } : {}}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${mode.color} shrink-0`} />
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Activity Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { value: 'Custom', label: 'Custom Status', icon: '💬' },
                        { value: 'Playing', label: 'Playing', icon: '🎮' },
                        { value: 'Watching', label: 'Watching', icon: '👁️' },
                        { value: 'Listening', label: 'Listening', icon: '🎵' },
                        { value: 'Streaming', label: 'Streaming', icon: '📡' },
                        { value: 'Competing', label: 'Competing', icon: '🏆' },
                      ]).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setPresenceForm((f) => ({ ...f, statusType: type.value }))}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            presenceForm.statusType === type.value
                              ? 'border-brand-500 text-brand-300 bg-brand-500/10'
                              : 'border-surface-border text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Status Text</label>
                    <input
                      type="text"
                      value={presenceForm.statusText}
                      onChange={(e) => setPresenceForm((f) => ({ ...f, statusText: e.target.value }))}
                      placeholder="e.g. Hosting on Ongrywolf · v2.0"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-colors"
                      maxLength={128}
                    />
                    <div className="text-right text-[10px] text-slate-500 font-mono">{presenceForm.statusText.length}/128</div>
                  </div>

                  {/* Streaming URL (only if Streaming selected) */}
                  {presenceForm.statusType === 'Streaming' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Twitch / YouTube Stream URL</label>
                      <input
                        type="url"
                        value={presenceForm.streamingUrl}
                        onChange={(e) => setPresenceForm((f) => ({ ...f, streamingUrl: e.target.value }))}
                        placeholder="https://twitch.tv/yourchannel"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-colors"
                      />
                    </div>
                  )}

                  {/* Preview Badge */}
                  <div className="p-2.5 rounded-lg bg-[#36393f] border border-white/10 flex items-center gap-2.5 text-xs text-white">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold">
                        {bot.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#36393f] ${
                        presenceForm.onlineMode === 'online' ? 'bg-emerald-500' :
                        presenceForm.onlineMode === 'idle' ? 'bg-amber-400' :
                        presenceForm.onlineMode === 'dnd' ? 'bg-rose-500' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-[11px]">{bot.username || bot.name}</div>
                      <div className="text-slate-300 text-[10px] font-mono">
                        {presenceForm.statusType === 'Custom' ? '' : `${presenceForm.statusType} `}
                        {presenceForm.statusText || 'No status text set'}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSavePresence(bot)}
                    disabled={presenceSaving}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {presenceSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Applying to Discord Live...
                      </>
                    ) : (
                      <>✓ Apply Presence Now</>
                    )}
                  </button>
                </div>
              ) : null}

              {/* Actions Bar */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={bot.desiredEnabled ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleTogglePower(bot)}
                    className={`text-xs flex items-center gap-1.5 ${
                      bot.desiredEnabled ? 'text-amber-300 border-amber-900/40 hover:bg-amber-950/40' : 'text-emerald-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{bot.desiredEnabled ? 'Stop' : 'Start'}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestartBot(bot)}
                    className="text-xs flex items-center gap-1"
                    title="Restart bot on cloud host"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </Button>

                  <Button
                    variant={presenceEditingBotId === bot.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() =>
                      presenceEditingBotId === bot.id
                        ? setPresenceEditingBotId(null)
                        : handleOpenPresence(bot)
                    }
                    className={`text-xs flex items-center gap-1 ${presenceEditingBotId === bot.id ? 'text-brand-300' : ''}`}
                    title="Live Presence Controls"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      bot.observedState === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                    }`} />
                    <span>Presence</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenLogs(bot)}
                    className="text-xs flex items-center gap-1"
                    title="View sanitized runtime logs"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setExportingBot(bot)}
                    className="text-xs"
                    title="Generate .env configuration block"
                  >
                    Export .env
                  </Button>

                  {bot.id !== 'main' && (
                    <button
                      type="button"
                      onClick={() => setDeletingBot(bot)}
                      className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Permanently Delete Bot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Export .env Modal */}
      {exportingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-surface border-surface-border">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                Generated .env Configuration ({exportingBot.name})
              </h4>
              <button
                onClick={() => setExportingBot(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this block into your environment variables or your local <code>.env</code> file:
            </p>

            <pre className="p-3 rounded bg-surface-subtle border border-surface-border text-xs font-mono text-brand-300 overflow-x-auto leading-relaxed">
{exportingBot.id === 'main'
  ? `BOT_TOKEN_MAIN=${exportingBot.token || 'your_bot_token_here'}
BOT_CLIENT_ID_MAIN=${exportingBot.clientId}
COMMAND_PREFIX=${exportingBot.prefix}
STATUS_TEXT=${exportingBot.statusText}`
  : `BOT_TOKEN_${exportingBot.id.toUpperCase()}=${exportingBot.token || 'your_bot_token_here'}
BOT_CLIENT_ID_${exportingBot.id.toUpperCase()}=${exportingBot.clientId}
COMMAND_PREFIX=${exportingBot.prefix}
STATUS_TEXT=${exportingBot.statusText}`}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportingBot(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const text = exportingBot.id === 'main'
                    ? `BOT_TOKEN_MAIN=${exportingBot.token || ''}\nBOT_CLIENT_ID_MAIN=${exportingBot.clientId}\nCOMMAND_PREFIX=${exportingBot.prefix}\nSTATUS_TEXT=${exportingBot.statusText}`
                    : `BOT_TOKEN_${exportingBot.id.toUpperCase()}=${exportingBot.token || ''}\nBOT_CLIENT_ID_${exportingBot.id.toUpperCase()}=${exportingBot.clientId}\nCOMMAND_PREFIX=${exportingBot.prefix}\nSTATUS_TEXT=${exportingBot.statusText}`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* LOGS MODAL */}
      {activeLogsBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="max-w-2xl w-full p-6 space-y-4 bg-surface border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-400" />
                  Live Runtime Logs ({activeLogsBot.name})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time log buffer retrieved directly from cloud runtime. Tokens and credentials are automatically redacted.
                </p>
              </div>
              <button
                onClick={() => setActiveLogsBot(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/80 rounded-lg p-3 border border-surface-border h-72 overflow-y-auto font-mono text-[11px] space-y-1">
              {loadingLogs ? (
                <div className="text-slate-500 text-center py-10">Fetching logs from cloud runtime...</div>
              ) : logs.length === 0 ? (
                <div className="text-slate-500 text-center py-10">No runtime logs recorded yet for this instance.</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-slate-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={
                      l.level === 'ERROR' ? 'text-rose-400 font-bold' :
                      l.level === 'WARN' ? 'text-amber-400 font-bold' : 'text-brand-300'
                    }>
                      [{l.level}]
                    </span>{' '}
                    <span className="text-slate-200">{l.message}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenLogs(activeLogsBot)}
                isLoading={loadingLogs}
                className="text-xs"
              >
                Refresh Logs
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveLogsBot(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="max-w-md w-full p-6 space-y-4 bg-surface border-rose-800/80">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Permanently Delete Hosted Bot</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingBot.name}</strong>?
            </p>

            <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 space-y-1">
              <div className="font-semibold">Consequences of deletion:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                <li>Stops the running bot process on cloud host immediately.</li>
                <li>Disconnects the bot from the Discord Gateway.</li>
                <li>Permanently deletes hosted credentials, logs, and configuration.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingBot(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleting}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                Permanently Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
