import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { Bot } from 'lucide-react';
import { AdminBotsManager } from './AdminBotsManager';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminBotsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const hostedBots = await db.getHostedBots(false);
  const userConfigs = await db.getBotConfigs();
  const users = await db.getUsers();
  const serverUptime = db.getServerUptime();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-400" />
          Bot Hosting Fleet & Diagnostics
        </h2>
        <p className="text-xs text-slate-400">
          Upload new bots, monitor real-time health, Discord API latency, server uptime, and multi-bot configurations.
        </p>
      </div>

      <AdminBotsManager
        initialHostedBots={hostedBots}
        initialUserConfigs={userConfigs}
        initialUsers={users}
        initialUptime={serverUptime}
      />
    </div>
  );
}
