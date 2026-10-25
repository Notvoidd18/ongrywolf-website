import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { AdminMessagesManager } from './AdminMessagesManager';
import { MessageSquare } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?error=owner_authorization_required');
  }

  const messages = await db.getProjectRequests();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-400" />
          Client Messages &amp; Project Inquiries
        </h2>
        <p className="text-xs text-slate-400">
          Real client inquiries and commission requests submitted through the Ongrywolf website.
        </p>
      </div>

      <AdminMessagesManager initialMessages={messages} />
    </div>
  );
}
