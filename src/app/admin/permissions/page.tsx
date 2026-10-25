import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { Key } from 'lucide-react';
import { FeaturePermissionsTable } from './FeaturePermissionsTable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPermissionsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const users = await db.getUsers();
  const entitlements = await db.getEntitlements();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-400" />
          Feature Entitlements Matrix
        </h2>
        <p className="text-xs text-slate-400">
          Control granular feature capabilities per Discord user. Enforced server-side on all bot and dashboard requests.
        </p>
      </div>

      <FeaturePermissionsTable initialUsers={users} initialEntitlements={entitlements} />
    </div>
  );
}
