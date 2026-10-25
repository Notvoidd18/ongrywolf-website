import React from 'react';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Key, Clock, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireAuth();
  const trial = await db.getTrialByUserId(session.discordId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">Account & Discord Identity</h2>
        <p className="text-xs text-slate-400">Authenticated Discord session parameters and account entitlements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase">
            <User className="w-4 h-4" />
            Discord Identity
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Username:</span>{' '}
              <span className="text-white font-medium">{session.discordUsername}</span>
            </div>
            {session.globalName && (
              <div>
                <span className="text-slate-400">Display Name:</span>{' '}
                <span className="text-slate-200">{session.globalName}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Discord Snowflake ID:</span>{' '}
              <span className="text-brand-300 font-mono">{session.discordId}</span>
            </div>
            <div>
              <span className="text-slate-400">Account Type:</span>{' '}
              <Badge variant="blue">{session.role}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase">
            <Clock className="w-4 h-4" />
            Trial & Evaluation Status
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Status:</span>{' '}
              <span className="text-emerald-400 font-semibold uppercase">{trial?.status || 'Active'}</span>
            </div>
            <div>
              <span className="text-slate-400">Expires:</span>{' '}
              <span className="text-slate-300">
                {trial?.expiresAt ? new Date(trial.expiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Extensions Granted:</span>{' '}
              <span className="text-white">{trial?.extensionsCount || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-2 border-surface-border">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase">
          <Shield className="w-4 h-4 text-brand-400" />
          Zero-Knowledge Token Security
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ongrywolf enforces a strict two-tier hosting model for remote bot management. Discord bot credentials and gateway connections are securely provisioned directly to your dedicated hosting runtime over authenticated HTTPS and are never stored in browser memory, frontend state, or client-side responses.
        </p>
      </Card>
    </div>
  );
}
