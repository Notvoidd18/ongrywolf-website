'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HostedBot, UserTrial } from '@/lib/types';
import { SanitizedLogEntry } from '@/lib/botHostClient';
import {
  Bot,
  Plus,
  Power,
  RotateCw,
  Terminal,
  Settings,
  Trash2,
  Activity,
  Server,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Hash,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { BotFeatureMap } from '@/components/admin/BotFeatureMap';

interface Props {
  initialBots: HostedBot[];
  trial: UserTrial | null;
  username: string;
  isOwner: boolean;
  remoteAvailable: boolean;
}

export function UserBotsDashboard({
  initialBots,
  trial,
  username,
  isOwner,
  remoteAvailable: initialRemoteAvailable,
}: Props) {
  const [bots, setBots] = useState<HostedBot[]>(initialBots);
  const [remoteAvailable, setRemoteAvailable] = useState(initialRemoteAvailable);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Register form fields
  const [newBotName, setNewBotName] = useState('');
  const [newAppId, setNewAppId] = useState('');
  const [newToken, setNewToken] = useState('');
  const [newPrefix, setNewPrefix] = useState('!');
  const [newStatusText, setNewStatusText] = useState('Hosting on Ongrywolf');
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [tokenTesting, setTokenTesting] = useState(false);
  const [tokenBotInfo, setTokenBotInfo] = useState<any>(null);

  // Logs modal
  const [activeLogsBot, setActiveLogsBot] = useState<HostedBot | null>(null);
  const [logs, setLogs] = useState<SanitizedLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Edit config modal
  const [editingBot, setEditingBot] = useState<HostedBot | null>(null);
  const [editStatusText, setEditStatusText] = useState('');
  const [editPrefix, setEditPrefix] = useState('!');
  const [rotateToken, setRotateToken] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deletingBot, setDeletingBot] = useState<HostedBot | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action loaders (botId -> action string)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [featureMapBotId, setFeatureMapBotId] = useState<string | null>(null);

  const fetchBots = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (res.ok && data.bots) {
        setBots(data.bots);
        setRemoteAvailable(Boolean(data.remoteHostAvailable));
      }
    } catch (e) {
      console.error('Failed to refresh bots:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Test token against Discord API
  const handleTestToken = async () => {
    if (!newToken.trim()) return;
    setTokenTesting(true);
    setTokenVerified(null);
    setTokenBotInfo(null);

    try {
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${newToken.trim()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTokenVerified(true);
        setTokenBotInfo(data);
        if (!newBotName) setNewBotName(data.username);
        if (!newAppId) setNewAppId(data.id);
      } else {
        setTokenVerified(false);
      }
    } catch (e) {
      setTokenVerified(false);
    } finally {
      setTokenTesting(false);
    }
  };

  // Handle register new bot
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || !newAppId.trim() || !newToken.trim()) {
      alert('Bot Name, Application ID, and Token are required.');
      return;
    }

    setRegistering(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: newBotName.trim(),
          applicationId: newAppId.trim(),
          token: newToken.trim(),
          commandPrefix: newPrefix.trim() || '!',
          statusText: newStatusText.trim() || 'Hosting on Ongrywolf',
          enabledModules: ['work_logs'],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register bot');
      }

      setFeedback(`Bot "${data.bot.name}" successfully registered and provisioned to Ongrywolf Cloud!`);
      setShowRegisterModal(false);
      setNewBotName('');
      setNewAppId('');
      setNewToken('');
      setTokenVerified(null);
      setTokenBotInfo(null);
      fetchBots();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setRegistering(false);
    }
  };

  // Handle bot lifecycle actions
  const handleBotAction = async (bot: HostedBot, action: 'start' | 'stop' | 'restart') => {
    setActionLoadingId(`${bot.id}_${action}`);
    if (action === 'restart') {
      setBots((prev) =>
        prev.map((b) =>
          b.id === bot.id
            ? { ...b, observedState: 'restarting' as const, statusText: 'Restarting...' }
            : b
        )
      );
    }
    try {
      const res = await fetch(`/api/bots/${bot.id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} bot`);

      setFeedback(`Bot "${bot.name}" ${action}ed successfully.`);
      setTimeout(() => setFeedback(null), 3000);
      if (action === 'restart') {
        setTimeout(() => fetchBots(), 3000);
      } else {
        fetchBots();
      }
    } catch (err: any) {
      setFeedback(`Action failed: ${err.message}`);
      fetchBots();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Logs
  const handleOpenLogs = async (bot: HostedBot) => {
    setActiveLogsBot(bot);
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/bots/${bot.id}/logs`);
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

  // Save edit config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    setSavingEdit(true);

    try {
      const payload: any = {
        statusText: editStatusText.trim(),
        prefix: editPrefix.trim(),
      };
      if (rotateToken.trim()) {
        payload.token = rotateToken.trim();
      }

      const res = await fetch(`/api/bots/${editingBot.id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update configuration');

      setFeedback(`Configuration updated for "${editingBot.name}".`);
      setEditingBot(null);
      setRotateToken('');
      setTimeout(() => setFeedback(null), 3000);
      fetchBots();
    } catch (err: any) {
      setFeedback(`Configuration error: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete bot
  const handleDeleteBot = async () => {
    if (!deletingBot) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/bots/${deletingBot.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete bot');

      setFeedback(`Bot "${deletingBot.name}" permanently deleted from platform and cloud host.`);
      setDeletingBot(null);
      setTimeout(() => setFeedback(null), 3000);
      fetchBots();
    } catch (err: any) {
      setFeedback(`Delete error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // 7-day trial calculations
  const trialExpiryTime = trial ? new Date(trial.expiresAt).getTime() : 0;
  const isTrialExpired = trial && !isOwner && trial.status !== 'active' && trialExpiryTime < Date.now();
  const trialDaysRemaining = trial ? Math.max(0, Math.ceil((trialExpiryTime - Date.now()) / (1000 * 60 * 60 * 24))) : 7;

  return (
    <div className="space-y-6">
      {/* Remote Host Health Banner */}
      <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
        remoteAvailable
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 shrink-0" />
          <span>
            {remoteAvailable
              ? 'Ongrywolf Cloud Engine connected and active. Gateway execution isolated from website.'
              : 'Ongrywolf Cloud Host is currently reconnecting. Displaying cached configurations.'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={remoteAvailable ? 'emerald' : 'amber'}>
            {remoteAvailable ? 'CLOUD RUNTIME ACTIVE' : 'HOST STANDBY'}
          </Badge>
          <button
            onClick={fetchBots}
            disabled={refreshing}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trial Alert Banner */}
      {!isOwner && trial && (
        <div className={`p-4 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isTrialExpired
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            : 'bg-surface border-surface-border text-slate-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">7-Day Free Evaluation Trial: </span>
              {isTrialExpired ? (
                <span className="text-rose-400 font-bold">EXPIRED. Starting bots is temporarily disabled.</span>
              ) : (
                <span>{trialDaysRemaining} days remaining (Expires: {new Date(trial.expiresAt).toLocaleDateString()})</span>
              )}
            </div>
          </div>
          {isTrialExpired && (
            <Badge variant="rose">TRIAL EXPIRED</Badge>
          )}
        </div>
      )}

      {feedback && (
        <div className="p-3.5 rounded bg-surface border border-surface-border text-xs text-brand-300 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-400" />
            Your Hosted Discord Bots ({bots.length})
          </h2>
          <p className="text-xs text-slate-400">
            Provision and manage your Discord bots hosted independently on Ongrywolf Cloud.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowRegisterModal(true)}
          className="text-xs flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Bot</span>
        </Button>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-surface border-surface-border">
          <div className="w-12 h-12 rounded-full bg-brand-900/40 border border-brand-800 text-brand-400 flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Registered Bots Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Register your Discord Application ID and Bot Token to launch your first hosted bot on Ongrywolf Cloud.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowRegisterModal(true)}
            className="text-xs bg-brand-600 hover:bg-brand-500 text-white"
          >
            Register Bot Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bots.map((bot) => {
            const isOnline = bot.observedState === 'online';
            const isStarting = bot.observedState === 'starting';

            return (
              <Card
                key={bot.id}
                className="p-5 space-y-4 bg-surface border-surface-border flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
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

                    <Badge variant={isOnline ? 'emerald' : bot.observedState === 'error' ? 'rose' : 'neutral'}>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`} />
                        {bot.observedState.toUpperCase()}
                      </span>
                    </Badge>
                  </div>

                  {/* Telemetry Row */}
                  <div className="grid grid-cols-4 gap-2 bg-surface-subtle p-2.5 rounded border border-surface-border text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-medium">Gateway</div>
                      <div className="text-[11px] font-mono font-bold text-white">
                        {bot.gatewayStatus || (isOnline ? 'connected' : 'offline')}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-medium">Ping</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {bot.pingMs ? `${bot.pingMs} ms` : 'N/A'}
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

                  {/* Specs Details */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Presence:</span>
                      <span className="font-medium text-white">{bot.statusText}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="font-mono text-white text-[11px]">
                        {isOnline
                          ? `Active (${bot.uptimeSeconds ? `${Math.floor(bot.uptimeSeconds / 3600)}h ${Math.floor((bot.uptimeSeconds % 3600) / 60)}m` : 'Just started'})`
                          : 'Stopped'}
                      </span>
                    </div>

                    {bot.resourceUsage && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Host Memory:</span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {bot.resourceUsage.memoryMb} MB
                        </span>
                      </div>
                    )}

                    {bot.lastError && (
                      <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{bot.lastError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Power Toggle */}
                    <Button
                      variant={isOnline ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={Boolean(actionLoadingId)}
                      onClick={() => handleBotAction(bot, isOnline ? 'stop' : 'start')}
                      className={`text-xs flex items-center gap-1.5 ${
                        isOnline ? 'text-amber-300 border-amber-900/40 hover:bg-amber-950/40' : 'text-emerald-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOnline ? 'Stop' : 'Start'}</span>
                    </Button>

                    {/* Restart */}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={Boolean(actionLoadingId)}
                      onClick={() => handleBotAction(bot, 'restart')}
                      className="text-xs flex items-center gap-1"
                      title="Restart bot on cloud host"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </Button>

                    {/* Feature Map & Code */}
                    <Button
                      variant={featureMapBotId === bot.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        setFeatureMapBotId(featureMapBotId === bot.id ? null : bot.id)
                      }
                      className={`text-xs flex items-center gap-1 ${
                        featureMapBotId === bot.id ? 'text-brand-300' : ''
                      }`}
                      title="Discord Bot Feature Map & Code Upload"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Feature Map & Code</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Logs */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenLogs(bot)}
                      className="text-xs flex items-center gap-1"
                      title="View sanitized logs"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Logs</span>
                    </Button>

                    {/* Settings / Edit */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingBot(bot);
                        setEditStatusText(bot.statusText);
                        setEditPrefix(bot.prefix);
                        setRotateToken('');
                      }}
                      className="text-xs p-2"
                      title="Configure bot settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </Button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingBot(bot)}
                      className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Permanently Delete Bot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bot Feature Map & Code Upload Accordion */}
                {featureMapBotId === bot.id && (
                  <div className="pt-4 border-t border-surface-border animate-in fade-in duration-200">
                    <BotFeatureMap
                      bot={bot}
                      onRestartBot={async (b) => handleBotAction(b, 'restart')}
                      isAdmin={isOwner}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* REGISTER NEW BOT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-surface border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-brand-400" />
                  Register Discord Bot to Ongrywolf Cloud
                </h3>
                <p className="text-[11px] text-slate-400">
                  Provision your bot credentials securely to dedicated cloud hosting.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Bot Display Name</label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="e.g. My Moderation Bot"
                  required
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Discord Application ID</span>
                  <span className="text-[10px] text-slate-400">Public Snowflake (Not a secret)</span>
                </label>
                <input
                  type="text"
                  value={newAppId}
                  onChange={(e) => setNewAppId(e.target.value)}
                  placeholder="e.g. 1250267167065112616"
                  required
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Discord Bot Token</span>
                  <span className="text-[10px] text-slate-400">Sent directly to cloud runtime over HTTPS</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newToken}
                    onChange={(e) => {
                      setNewToken(e.target.value);
                      setTokenVerified(null);
                    }}
                    placeholder="Paste bot token (starts with MTU...)"
                    required
                    className="flex-1 px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleTestToken}
                    isLoading={tokenTesting}
                    disabled={!newToken.trim()}
                    className="text-xs shrink-0"
                  >
                    Verify
                  </Button>
                </div>

                {tokenVerified === true && (
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Verified: <strong>{tokenBotInfo?.username}</strong> ({tokenBotInfo?.id})
                    </span>
                  </div>
                )}

                {tokenVerified === false && (
                  <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Discord API rejected token. Verify credentials in Developer Portal.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Command Prefix</label>
                  <input
                    type="text"
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    placeholder="!"
                    className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Presence Status</label>
                  <input
                    type="text"
                    value={newStatusText}
                    onChange={(e) => setNewStatusText(e.target.value)}
                    placeholder="Hosting on Ongrywolf"
                    className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={registering}
                  className="bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Deploy & Launch Bot
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* LOGS DRAWER / MODAL */}
      {activeLogsBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="max-w-2xl w-full p-6 space-y-4 bg-surface border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-400" />
                  Recent Sanitized Runtime Logs ({activeLogsBot.name})
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

      {/* EDIT CONFIG MODAL */}
      {editingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-w-md w-full p-6 space-y-4 bg-surface border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-400" />
                Edit Bot Configuration ({editingBot.name})
              </h3>
              <button
                onClick={() => setEditingBot(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Presence Status Text</label>
                <input
                  type="text"
                  value={editStatusText}
                  onChange={(e) => setEditStatusText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Command Prefix</label>
                <input
                  type="text"
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Rotate Bot Token</span>
                  <span className="text-[10px] text-slate-400">Leave blank to keep existing</span>
                </label>
                <input
                  type="password"
                  value={rotateToken}
                  onChange={(e) => setRotateToken(e.target.value)}
                  placeholder="Paste new token to rotate..."
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingBot(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={savingEdit}
                  className="bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
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
                <li>Permanently deletes hosted credentials, logs, and state.</li>
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
                onClick={handleDeleteBot}
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
