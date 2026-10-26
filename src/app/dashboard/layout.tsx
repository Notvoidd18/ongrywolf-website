import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/lib/store';
import { Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const trial = await db.getTrialByUserId(session.discordId);

  let trialDaysRemaining = 0;
  if (trial && trial.status === 'active') {
    const diff = new Date(trial.expiresAt).getTime() - Date.now();
    trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="pt-28 sm:pt-32 pb-16 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Top Banner / Account Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-surface-border bg-surface">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Discord Bot Dashboard
            </h1>
            <Badge variant="blue">{session.role}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Authenticated via Discord: <span className="text-brand-300 font-mono font-medium">{session.discordUsername}</span> ({session.discordId})
          </p>
        </div>

        {/* 7-Day Trial Status Card */}
        <div className="flex items-center gap-3 bg-surface-subtle border border-surface-border px-4 py-2.5 rounded">
          <Clock className="w-4 h-4 text-brand-400 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-400 uppercase text-[10px] font-semibold">Evaluation Status</div>
            {trial?.status === 'active' ? (
              <div className="text-white font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{trialDaysRemaining} Days Active</span>
              </div>
            ) : (
              <div className="text-rose-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>{trial?.status?.toUpperCase() || 'NO ACTIVE TRIAL'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Subnav */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <Link
          href="/dashboard"
          className="text-xs font-semibold px-3.5 py-1.5 rounded hover:bg-surface-elevated text-slate-300 hover:text-white transition-colors"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/bots"
          className="text-xs font-semibold px-3.5 py-1.5 rounded hover:bg-surface-elevated text-slate-300 hover:text-white transition-colors"
        >
          Bot Configurations & Export
        </Link>
        <Link
          href="/dashboard/settings"
          className="text-xs font-semibold px-3.5 py-1.5 rounded hover:bg-surface-elevated text-slate-300 hover:text-white transition-colors"
        >
          Account Settings
        </Link>
      </div>

      {children}
    </div>
  );
}
