import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { botHostClient } from '@/lib/botHostClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bot, Server, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const session = await requireAuth();

  const [trial, allBots, hostHealth] = await Promise.all([
    db.getTrialByUserId(session.discordId),
    db.getHostedBots(false),
    botHostClient.checkHealth(),
  ]);

  const userBots = session.isOwner
    ? allBots
    : allBots.filter(
        (b) => b.ownerAccount === session.discordUsername || b.ownerAccount === session.discordId
      );

  const onlineBots = userBots.filter((b) => b.observedState === 'online').length;
  const trialExpiryTime = trial ? new Date(trial.expiresAt).getTime() : 0;
  const isTrialExpired = trial && !session.isOwner && trial.status !== 'active' && trialExpiryTime < Date.now();
  const trialDaysRemaining = trial ? Math.max(0, Math.ceil((trialExpiryTime - Date.now()) / (1000 * 60 * 60 * 24))) : 7;

  return (
    <div className="space-y-6">
      {/* Architecture Status Banner */}
      <div className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        hostHealth.ok
          ? 'bg-surface border-surface-border text-slate-300'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-brand-400 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>Render 1 Bot Hosting Runtime</span>
              <Badge variant={hostHealth.ok ? 'emerald' : 'amber'}>
                {hostHealth.ok ? 'ACTIVE' : 'STANDBY'}
              </Badge>
            </div>
            <p className="text-slate-400">
              Bot gateway connections and processes run on Render 1. The website operates on Render 2 with zero speed loss.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/bots"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-500 text-white font-semibold shrink-0"
        >
          <span>Manage Bots</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2 bg-surface">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Your Hosted Bots
          </span>
          <div className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span>{userBots.length}</span>
            <span className="text-xs font-normal text-emerald-400 font-sans">
              ({onlineBots} Online)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Deployed on Ongrywolf cloud</p>
        </Card>

        <Card className="p-5 space-y-2 bg-surface">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            7-Day Evaluation Trial
          </span>
          <div className="text-3xl font-extrabold text-brand-400">
            {session.isOwner ? (
              <span className="text-emerald-400 text-2xl font-bold">Unlimited</span>
            ) : isTrialExpired ? (
              <span className="text-rose-400 text-2xl font-bold">Expired</span>
            ) : (
              <span>{trialDaysRemaining}d</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {session.isOwner
              ? 'Owner exemption active'
              : trial
              ? `Expires: ${new Date(trial.expiresAt).toLocaleDateString()}`
              : 'Evaluation active'}
          </p>
        </Card>

        <Card className="p-5 space-y-2 bg-surface">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Execution Isolation
          </span>
          <div className="text-xl font-bold text-emerald-400 pt-1">Dedicated Core Engine</div>
          <p className="text-[11px] text-slate-400">No gateway traffic on website</p>
        </Card>
      </div>

      {/* Hosted Bots Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-400" />
            Your Registered Bots
          </h2>
          <Link
            href="/dashboard/bots"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>Full Controls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userBots.length === 0 ? (
          <Card className="p-8 text-center space-y-3 bg-surface">
            <Bot className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Bots Registered Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Register your Discord Application ID and Bot Token to launch your hosted bot on Ongrywolf Cloud.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/bots"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all"
              >
                <span>Register First Bot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {userBots.map((b) => (
              <Card key={b.id} className="space-y-3 p-5 bg-surface border-surface-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {b.avatarUrl ? (
                      <img src={b.avatarUrl} alt={b.name} className="w-9 h-9 rounded-full border border-surface-border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-900/60 text-brand-300 flex items-center justify-center font-bold text-xs">
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white">{b.name}</h3>
                      <div className="text-[10px] text-slate-400 font-mono">App ID: {b.clientId}</div>
                    </div>
                  </div>

                  <Badge variant={b.observedState === 'online' ? 'emerald' : b.observedState === 'error' ? 'rose' : 'neutral'}>
                    {b.observedState.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Ping: <strong className="text-emerald-400">{b.pingMs ? `${b.pingMs} ms` : '—'}</strong>
                  </span>
                  <Link
                    href="/dashboard/bots"
                    className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Manage Bot</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
