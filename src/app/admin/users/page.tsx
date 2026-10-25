'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserSession } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setFeedback(data.error || 'Failed to load users');
      }
    } catch (e: any) {
      setFeedback(e.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, toggleStatus: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Failed to update user status');
      } else {
        setFeedback('User status updated successfully.');
        fetchUsers();
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.discordId.includes(searchTerm) ||
      u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            Registered User Accounts
          </h2>
          <p className="text-xs text-slate-400">
            Real registered Discord users who have authenticated with Ongrywolf.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search username / Snowflake ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            isLoading={loading}
            className="h-8 py-0 px-2.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded bg-surface border border-brand-800 text-xs text-brand-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle text-slate-400 font-semibold">
                <th className="py-3 px-4">Discord User</th>
                <th className="py-3 px-4">Snowflake ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {loading ? 'Loading registered users...' : 'No registered users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-[10px] text-slate-500">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4 text-brand-300 font-mono">{u.discordId}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'OWNER' ? 'blue' : 'neutral'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {u.status === 'active' ? (
                        <Badge variant="emerald">ACTIVE</Badge>
                      ) : (
                        <Badge variant="rose">SUSPENDED</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'OWNER' && (
                        <Button
                          variant={u.status === 'active' ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(u.id)}
                          className="h-7 text-xs py-0 px-2.5"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Restore'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
