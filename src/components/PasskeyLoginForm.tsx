'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PasskeyLoginForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid passkey.');
      }

      window.location.href = data.redirect || '/admin';
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Passkey
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 rounded-lg border border-surface-border bg-surface-card space-y-2.5 text-left transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">Passkey</span>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="text-[11px] text-slate-500 hover:text-slate-300"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded px-2.5 py-1.5">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="password"
          placeholder="Enter passkey..."
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          disabled={loading}
          autoFocus
          className="w-full px-2.5 py-1.5 text-xs rounded bg-surface border border-surface-border text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors font-mono"
        />
        <button
          type="submit"
          disabled={loading || !passkey.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-all shrink-0 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Enter'}
        </button>
      </div>
    </form>
  );
}
