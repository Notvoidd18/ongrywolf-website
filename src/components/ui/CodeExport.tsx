'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button';

interface CodeExportProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeExport({ code, language = 'env', filename = '.env.production' }: CodeExportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  return (
    <div className="relative rounded-lg border border-surface-border bg-[#080D17] overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-subtle text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
          {filename} ({language})
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs py-0 px-2.5 border-brand-800/60 hover:border-brand-500"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-brand-400" />
              Copy Configuration
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto selection:bg-brand-800 selection:text-white leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
