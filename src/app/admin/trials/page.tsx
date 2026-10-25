import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { Clock } from 'lucide-react';
import { AdminTrialsManager } from './AdminTrialsManager';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminTrialsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const users = await db.getUsers();
  const trials = await db.getTrials();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-400" />
          7-Day Evaluation Trial Management
        </h2>
        <p className="text-xs text-slate-400">
          Inspect trial expirations, grant 7-day extensions, or immediately revoke access.
        </p>
      </div>

      <AdminTrialsManager initialUsers={users} initialTrials={trials} />
    </div>
  );
}
