import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Clock,
  Bot,
  Activity,
  FileText,
  ArrowRight,
  Server,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { BotFleetMetricsGraph } from '@/components/admin/BotFleetMetricsGraph';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const [users, trials, hostedBots, workLogs, auditLogs, projectRequests] = await Promise.all([
    db.getUsers(),
    db.getTrials(),
    db.getHostedBots(false),
    db.getWorkLogs(),
    db.getAuditLogs(),
    db.getProjectRequests(),
  ]);

  const uptime = db.getServerUptime();
  const onlineBots = hostedBots.filter((b) => b.observedState === 'online').length;
  const activeTrials = trials.filter((t) => t.status === 'active').length;
  const pendingInquiries = projectRequests.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 space-y-1.5 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Hosted Bot Fleet
            </span>
            <Bot className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <span>{onlineBots} / {hostedBots.length}</span>
            <span className="text-xs font-normal text-emerald-400 font-sans">Online</span>
          </div>
          <p className="text-[10px] text-slate-500">Live bots running on platform</p>
        </Card>

        <Card className="p-4 space-y-1.5 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform Uptime
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {uptime.formatted}
          </div>
          <p className="text-[10px] text-slate-500">Continuous server runtime</p>
        </Card>

        <Card className="p-4 space-y-1.5 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Client Messages
            </span>
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <span>{projectRequests.length}</span>
            {pendingInquiries > 0 && (
              <span className="text-xs font-normal text-amber-400 font-sans font-medium">
                ({pendingInquiries} new)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">Inquiries via contact form</p>
        </Card>

        <Card className="p-4 space-y-1.5 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Staff Work Logs
            </span>
            <Activity className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {workLogs.length}
          </div>
          <p className="text-[10px] text-slate-500">Recorded work reports</p>
        </Card>

        <Card className="p-4 space-y-1.5 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform Accounts
            </span>
            <Users className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-brand-400 font-mono">
            {users.length}
          </div>
          <p className="text-[10px] text-slate-500">{activeTrials} active evaluations</p>
        </Card>
      </div>

      {/* Real Working Interactive Bot Fleet Performance & Status Graph */}
      <BotFleetMetricsGraph bots={hostedBots} />

      {/* Live Hosted Bots Quick Health Panel */}
      <Card className="p-5 space-y-4 bg-surface border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Hosted Bots Health &amp; REST Latency
            </h3>
          </div>
          <Link
            href="/admin/bots"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Manage Fleet &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostedBots.map((bot) => (
            <div
              key={bot.id}
              className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {bot.avatarUrl ? (
                  <img
                    src={bot.avatarUrl}
                    alt={bot.name}
                    className="w-9 h-9 rounded-full border border-surface-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-900/60 text-brand-300 flex items-center justify-center font-bold text-xs">
                    {bot.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white">{bot.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">ID: {bot.clientId}</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <Badge variant={bot.observedState === 'online' ? 'emerald' : 'rose'}>
                  {bot.observedState === 'online' ? 'ONLINE' : 'OFFLINE'}
                </Badge>
                {bot.pingMs && (
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {bot.pingMs} ms
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Three Column Grid: Audit Ledger, Staff Work Logs, Client Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Administrative Audit Ledger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              Audit Ledger ({auditLogs.length})
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              All &rarr;
            </Link>
          </div>

          <Card className="divide-y divide-surface-border p-0 overflow-hidden bg-surface">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No audit events recorded yet.
              </div>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-300 font-semibold font-mono text-[11px] truncate max-w-[150px]">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Actor: <span className="text-white">{log.adminUsername}</span> • Target: <span className="font-mono text-slate-300">{log.targetId}</span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Staff Work Logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              Staff Work Logs ({workLogs.length})
            </h2>
            <Link
              href="/admin/work-logs"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              All &rarr;
            </Link>
          </div>

          <Card className="divide-y divide-surface-border p-0 overflow-hidden bg-surface">
            {workLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No work logs recorded yet.
              </div>
            ) : (
              workLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      {log.username}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Client Messages / Inquiries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Client Inquiries ({projectRequests.length})
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              All &rarr;
            </Link>
          </div>

          <Card className="divide-y divide-surface-border p-0 overflow-hidden bg-surface">
            {projectRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No client inquiries received yet.
              </div>
            ) : (
              projectRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{req.contactName}</span>
                    <Badge
                      variant={
                        req.status === 'completed'
                          ? 'emerald'
                          : req.status === 'contacted'
                          ? 'blue'
                          : req.status === 'pending'
                          ? 'amber'
                          : 'neutral'
                      }
                      className="text-[9px] py-0"
                    >
                      {req.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                  <div className="text-[10px] text-brand-300 font-mono">
                    {req.contactMethod} • {req.category}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
