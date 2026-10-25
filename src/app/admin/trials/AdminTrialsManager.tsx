'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserSession, UserTrial } from '@/lib/types';
import { Plus, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  initialUsers: UserSession[];
  initialTrials: UserTrial[];
}

export function AdminTrialsManager({ initialUsers, initialTrials }: Props) {
  const [trials, setTrials] = useState<UserTrial[]>(initialTrials);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getTrialForUser = (userId: string) => {
    return trials.find((t) => t.userId === userId);
  };

  const handleAction = async (userId: string, action: 'extend' | 'revoke') => {
    try {
      const res = await fetch('/api/admin/trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Failed to update trial');
      } else {
        setFeedback(data.message || 'Action executed successfully');
        // Refresh trials locally
        setTrials((prev) =>
          prev.map((t) => {
            if (t.userId === userId) {
              if (action === 'extend') {
                return {
                  ...t,
                  status: 'active',
                  expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
                  extensionsCount: t.extensionsCount + 1,
                };
              } else {
                return {
                  ...t,
                  status: 'revoked',
                  expiresAt: new Date().toISOString(),
                };
              }
            }
            return t;
          })
        );
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 rounded bg-surface border border-brand-800 text-xs font-mono text-brand-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle text-slate-400">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Started</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Extensions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {initialUsers.map((u) => {
                const trial = getTrialForUser(u.id);
                const isActive = trial?.status === 'active';
                const isExpired = trial && new Date(trial.expiresAt).getTime() < Date.now();

                return (
                  <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-[10px] text-slate-500">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      {!trial ? (
                        <Badge variant="neutral">NONE</Badge>
                      ) : isActive && !isExpired ? (
                        <Badge variant="emerald">ACTIVE</Badge>
                      ) : (
                        <Badge variant="rose">EXPIRED</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {trial ? new Date(trial.startsAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {trial ? new Date(trial.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-brand-400">
                      {trial ? trial.extensionsCount : 0}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAction(u.id, 'extend')}
                        className="h-7 text-xs py-0 px-2.5"
                      >
                        +7 Days
                      </Button>
                      {isActive && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleAction(u.id, 'revoke')}
                          className="h-7 text-xs py-0 px-2.5"
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
