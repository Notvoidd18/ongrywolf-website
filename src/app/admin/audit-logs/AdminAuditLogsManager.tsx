'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminAuditLog } from '@/lib/types';
import { FileText, Search, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  initialLogs: AdminAuditLog[];
}

export function AdminAuditLogsManager({ initialLogs }: Props) {
  const [logs, setLogs] = useState<AdminAuditLog[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.adminUsername.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase()));

    const matchesType = targetTypeFilter === 'all' || log.targetType === targetTypeFilter;
    return matchesSearch && matchesType;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('START') || action.includes('ONLINE') || action.includes('SAVE') || action.includes('GRANT')) {
      return 'emerald';
    }
    if (action.includes('STOP') || action.includes('REVOKE') || action.includes('SUSPEND')) {
      return 'amber';
    }
    if (action.includes('DELETE') || action.includes('ERROR') || action.includes('FAIL')) {
      return 'rose';
    }
    return 'blue';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4 bg-surface border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions, actors, targets, metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Targets</option>
              <option value="BOT_CONFIG">Bot Fleet</option>
              <option value="USER">Users</option>
              <option value="TRIAL">Trials</option>
              <option value="PERMISSION">Permissions</option>
              <option value="SYSTEM">System &amp; Work Logs</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchLogs}
              isLoading={refreshing}
              className="text-xs h-8 px-2.5"
              title="Refresh ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden bg-surface border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching audit ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const hasDetails = log.details && Object.keys(log.details).length > 0;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-subtle/50 transition-colors cursor-pointer"
                      onClick={() => hasDetails && setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{log.adminUsername}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">{log.targetType}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {log.targetId}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {hasDetails ? (
                          <div className="flex items-center gap-1 text-brand-300 font-mono">
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                        {isExpanded && hasDetails && (
                          <pre className="mt-2 p-2 rounded bg-surface-subtle border border-surface-border text-[10px] font-mono text-slate-200 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
