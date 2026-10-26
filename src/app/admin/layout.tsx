import React from 'react';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Shield, ShieldAlert, Users, Key, Clock, Bot, FileText, ArrowLeft, Activity, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // 1. Unauthenticated -> Redirect to login
  if (!session) {
    redirect('/login?error=admin_authentication_required');
  }

  // 2. Authenticated as non-owner -> Block with HTTP 403 screen
  if (!session.isOwner) {
    return (
      <div className="pt-32 pb-24 max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <Badge variant="rose">403 FORBIDDEN</Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Owner Authorization Required
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            You are signed in as <span className="text-white font-mono">{session.discordUsername}</span> ({session.discordId}).
            Administrative access is strictly restricted to the verified owner identity (`notvoid18`).
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded bg-surface-elevated text-slate-300 hover:text-white border border-surface-border transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authenticated Owner -> Display Administrative Area
  const adminNav = [
    { name: 'Overview', href: '/admin', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Feature Permissions', href: '/admin/permissions', icon: Key },
    { name: 'Trials', href: '/admin/trials', icon: Clock },
    { name: 'Bot Hosting & Fleet', href: '/admin/bots', icon: Bot },
    { name: 'Work Logs', href: '/admin/work-logs', icon: Activity },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="pt-28 sm:pt-32 pb-16 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-surface-border bg-surface">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrative Command Center
            </h1>
            <Badge variant="blue">VERIFIED OWNER</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Authenticated as <span className="text-brand-300 font-mono font-medium">{session.discordUsername}</span> ({session.discordId}). All administrative operations are cryptographically audited.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Access Control: ENFORCED</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-surface-border pb-3 scrollbar-none">
        {adminNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded hover:bg-surface-elevated text-slate-300 hover:text-white transition-colors shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-brand-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
