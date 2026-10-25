'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserSession, FeatureEntitlement, FeatureKey } from '@/lib/types';
import { Check, X, AlertCircle } from 'lucide-react';

interface Props {
  initialUsers: UserSession[];
  initialEntitlements: FeatureEntitlement[];
}

const ALL_FEATURES: { key: FeatureKey; label: string }[] = [
  { key: 'basic_bot_config', label: 'Basic Config' },
  { key: 'advanced_bot_config', label: 'Advanced Routing' },
  { key: 'premium_modules', label: 'Premium Modules' },
  { key: 'export_config', label: 'Export Templates' },
  { key: 'extra_bot_slots', label: 'Additional Slots' },
];

export function FeaturePermissionsTable({ initialUsers, initialEntitlements }: Props) {
  const [entitlements, setEntitlements] = useState<FeatureEntitlement[]>(initialEntitlements);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isGranted = (userId: string, key: FeatureKey) => {
    return entitlements.some((e) => e.userId === userId && e.featureKey === key);
  };

  const toggleFeature = async (userId: string, key: FeatureKey) => {
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, featureKey: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Failed to toggle permission');
      } else {
        // Optimistic update
        setEntitlements((prev) => {
          const exists = prev.some((e) => e.userId === userId && e.featureKey === key);
          if (exists) {
            return prev.filter((e) => !(e.userId === userId && e.featureKey === key));
          } else {
            return [
              ...prev,
              {
                id: `ent_${Date.now()}`,
                userId,
                featureKey: key,
                grantedBy: 'admin',
                grantedAt: new Date().toISOString(),
              },
            ];
          }
        });
        setFeedback(`Updated ${key} entitlement.`);
      }
      setTimeout(() => setFeedback(null), 2500);
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
                {ALL_FEATURES.map((f) => (
                  <th key={f.key} className="py-3 px-4 text-center">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {initialUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{u.username}</div>
                    <div className="text-[10px] text-slate-500">{u.role}</div>
                  </td>

                  {ALL_FEATURES.map((f) => {
                    const active = isGranted(u.id, f.key);
                    return (
                      <td key={f.key} className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleFeature(u.id, f.key)}
                          className={`w-7 h-7 rounded inline-flex items-center justify-center transition-all border ${
                            active
                              ? 'bg-brand-950 border-brand-500 text-brand-300 hover:bg-rose-950/60 hover:border-rose-700 hover:text-rose-300'
                              : 'bg-surface-elevated border-surface-border text-slate-500 hover:border-brand-500 hover:text-brand-300'
                          }`}
                          title={`Click to ${active ? 'Revoke' : 'Grant'} ${f.label}`}
                        >
                          {active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
