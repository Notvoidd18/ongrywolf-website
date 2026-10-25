'use client';

import React, { useState } from 'react';
import { KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
        throw new Error(data.error || 'Authentication failed. Please verify your passkey.');
      }

      // Successful login -> Redirect to admin panel
      window.location.href = data.redirect || '/admin';
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-surface-border hover:border-brand-500/40 bg-surface-card/60 hover:bg-surface-card text-xs text-slate-300 hover:text-white transition-all duration-200"
        >
          <KeyRound className="w-3.5 h-3.5 text-brand-400" />
          <span>Login with Owner Passkey (Bypass Discord Rate-Limit)</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-brand-500/30 bg-surface-card/90 space-y-3.5 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Studio Owner Direct Login</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Directly authenticate as verified Studio Owner (<code className="text-brand-300">notvoid18</code>) without contacting Discord API.
          </p>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Enter Owner Passkey..."
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passkey.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white transition-all shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Passkey...</span>
              </>
            ) : (
              <>
                <span>Access Admin Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
