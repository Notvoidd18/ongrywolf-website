'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkLog } from '@/lib/types';
import { Activity, Plus, Trash2, Calendar, User, Hash, MessageSquare, Server } from 'lucide-react';

interface Props {
  initialLogs: WorkLog[];
  adminUsername: string;
}

export function AdminWorkLogsManager({ initialLogs, adminUsername }: Props) {
  const [logs, setLogs] = useState<WorkLog[]>(initialLogs);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [guildId, setGuildId] = useState('Ongrywolf HQ');
  const [channelId, setChannelId] = useState('staff-work-logs');
  const [description, setDescription] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/work-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          channelId,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit work log');
      }

      setLogs((prev) => [data.log, ...prev]);
      setDescription('');
      setShowAddForm(false);
      setFeedback('Work log recorded in database.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work log?')) return;
    try {
      const res = await fetch('/api/admin/work-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete work log');
      }

      setLogs((prev) => prev.filter((l) => l.id !== id));
      setFeedback('Work log deleted.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded bg-surface border border-surface-border text-brand-300 text-xs">
          {feedback}
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="blue">{logs.length} Total Logs</Badge>
          <span className="text-xs text-slate-400">Recorded from Discord bot /log and platform</span>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Record Staff Work Log'}</span>
        </Button>
      </div>

      {/* Add Work Log Form */}
      {showAddForm && (
        <Card className="p-5 space-y-4 border-brand-500/40 bg-surface">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-400" />
            Record New Staff Work Log
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Server / Guild Name or ID</label>
                <input
                  type="text"
                  value={guildId}
                  onChange={(e) => setGuildId(e.target.value)}
                  required
                  placeholder="e.g. Ongrywolf HQ"
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Channel Name or ID</label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  required
                  placeholder="e.g. #staff-logs"
                  className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Work Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe task completed, bot update, or maintenance performed..."
                className="w-full px-3 py-2 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={loading}
                className="text-xs"
              >
                Save Work Log
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Work Logs List */}
      <Card className="divide-y divide-surface-border p-0 overflow-hidden bg-surface">
        {logs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-400">No work logs recorded yet</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Staff work logs submitted via Discord (/log command) or added through the form above will appear here in real-time.
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-surface-elevated/40 transition-colors">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono">#{log.id}</span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-brand-300 bg-brand-950/60 border border-brand-800/60 px-2 py-0.5 rounded">
                    <User className="w-3 h-3 text-brand-400" />
                    {log.username}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-surface-subtle px-2 py-0.5 rounded border border-surface-border">
                    <Server className="w-3 h-3 text-slate-400" />
                    {log.guildId}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-surface-subtle px-2 py-0.5 rounded border border-surface-border">
                    <Hash className="w-3 h-3 text-slate-400" />
                    {log.channelId}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {log.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(log.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/40 transition-colors shrink-0 self-start sm:self-center"
                title="Delete Work Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
