import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { Activity } from 'lucide-react';
import { AdminWorkLogsManager } from './AdminWorkLogsManager';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminWorkLogsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const workLogs = await db.getWorkLogs();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-400" />
          Staff Work Logs Ledger
        </h2>
        <p className="text-xs text-slate-400">
          Real staff work reports recorded via Discord Bot commands (/log, !log) and platform administration.
        </p>
      </div>

      <AdminWorkLogsManager initialLogs={workLogs} adminUsername={admin.discordUsername} />
    </div>
  );
}
