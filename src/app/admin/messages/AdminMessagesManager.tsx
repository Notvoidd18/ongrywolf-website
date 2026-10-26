'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProjectRequest } from '@/lib/types';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Mail,
  Copy,
  ExternalLink,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

interface Props {
  initialMessages: ProjectRequest[];
}

export function AdminMessagesManager({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ProjectRequest[]>(initialMessages);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'archived'
  ) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      setFeedback(`Status updated to "${newStatus}".`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete message');
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      setFeedback('Message removed.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = messages.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (m.clientId && m.clientId.toLowerCase().includes(q)) ||
      m.contactName.toLowerCase().includes(q) ||
      m.contactMethod.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const contactedCount = messages.filter((m) => m.status === 'contacted').length;
  const completedCount = messages.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 rounded bg-surface border border-surface-border text-xs text-brand-300 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface space-y-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Total Inquiries</div>
          <div className="text-2xl font-bold font-mono text-white">{messages.length}</div>
          <p className="text-[10px] text-slate-500">Submitted via website contact form</p>
        </Card>

        <Card className="p-4 bg-surface space-y-1">
          <div className="text-[10px] uppercase font-semibold text-amber-400">Pending Review</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</div>
          <p className="text-[10px] text-slate-500">Requires owner / staff response</p>
        </Card>

        <Card className="p-4 bg-surface space-y-1">
          <div className="text-[10px] uppercase font-semibold text-brand-400">Contacted</div>
          <div className="text-2xl font-bold font-mono text-brand-400">{contactedCount}</div>
          <p className="text-[10px] text-slate-500">In communication with client</p>
        </Card>

        <Card className="p-4 bg-surface space-y-1">
          <div className="text-[10px] uppercase font-semibold text-emerald-400">Completed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</div>
          <p className="text-[10px] text-slate-500">Projects delivered / resolved</p>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-4 bg-surface border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Client ID (e.g. OW-WAAD), client name, handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Categories</option>
              <option value="plugins">Plugins</option>
              <option value="discord-bots">Discord Bots</option>
              <option value="client">Client</option>
              <option value="builds">Builds</option>
              <option value="full-stack">Full-Stack</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={refreshMessages}
              className="text-xs h-8 px-2.5"
              title="Refresh messages"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500 bg-surface">
            No client inquiries match the specified filters.
          </Card>
        ) : (
          filteredMessages.map((msg) => (
            <Card
              key={msg.id}
              className="p-5 space-y-4 bg-surface border-surface-border hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {msg.contactName}
                  </h4>
                  {msg.clientId && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      <span>{msg.clientId}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.clientId, `client_${msg.id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy Client ID"
                      >
                        {copiedId === `client_${msg.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                  )}
                  <Badge variant="blue" className="uppercase font-mono text-[10px]">
                    {msg.category}
                  </Badge>
                  <Badge
                    variant={
                      msg.status === 'completed'
                        ? 'emerald'
                        : msg.status === 'contacted'
                        ? 'blue'
                        : msg.status === 'pending'
                        ? 'amber'
                        : 'neutral'
                    }
                  >
                    {msg.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Contact Method */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Contact / Handle:</span>
                <span className="font-mono text-brand-300 font-semibold">{msg.contactMethod}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.contactMethod, msg.id)}
                  className="p-1 rounded hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors"
                  title="Copy contact info"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Message Description */}
              <div className="p-3.5 rounded bg-surface-subtle border border-surface-border text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {msg.description}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {msg.status !== 'contacted' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(msg.id, 'contacted')}
                      disabled={loadingId === msg.id}
                      className="text-xs"
                    >
                      Mark Contacted
                    </Button>
                  )}

                  {msg.status !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(msg.id, 'completed')}
                      disabled={loadingId === msg.id}
                      className="text-xs text-emerald-300 border-emerald-900/40 hover:bg-emerald-950/40"
                    >
                      Mark Completed
                    </Button>
                  )}

                  {msg.status !== 'archived' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(msg.id, 'archived')}
                      disabled={loadingId === msg.id}
                      className="text-xs text-slate-400"
                    >
                      Archive
                    </Button>
                  )}

                  {msg.status !== 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(msg.id, 'pending')}
                      disabled={loadingId === msg.id}
                      className="text-xs text-amber-300"
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(msg.id)}
                  disabled={loadingId === msg.id}
                  className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
