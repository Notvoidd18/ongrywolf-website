import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { AdminAuditLogsManager } from './AdminAuditLogsManager';
import { FileText } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const logs = await db.getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-400" />
          Administrative Security Audit Ledger
        </h2>
        <p className="text-xs text-slate-400">
          Append-only cryptographic audit trail recording all administrative operations, authentication events, bot hosting deployments, and permission grants.
        </p>
      </div>

      <AdminAuditLogsManager initialLogs={logs} />
    </div>
  );
}
