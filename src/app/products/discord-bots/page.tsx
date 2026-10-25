import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Shield, Terminal, Server } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DiscordBotsPage() {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 bg-[#06090F]">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-brand-300 uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Products
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="blue">SYSTEM VERTICAL 02</Badge>
          <span className="text-xs font-mono text-slate-400">Node.js 18-24 & discord.js v14</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-brand-400" />
          Discord Bots & Multi-Bot Platform
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          A fault-tolerant multi-client architecture running isolated Discord bot instances within a single container. Built specifically for high-reliability staff work logging, channel routing, and server administration.
        </p>
      </div>

      {/* Real Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-300">
              Ongrywolf Main (Official)
            </CardTitle>
            <Badge variant="emerald">ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The primary server management bot with official slash command dispatch and PostgreSQL audit record persistence.
          </p>
          <div className="rounded bg-surface-subtle p-3 border border-surface-border text-xs font-mono space-y-1 text-slate-300">
            <div><span className="text-slate-500">ID:</span> main</div>
            <div><span className="text-slate-500">Presence:</span> Hosting on Ongrywolf</div>
            <div><span className="text-slate-500">Commands:</span> /log, /listlog, /channellog</div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-300">
              Ongrywolf Bot A (Private Instance)
            </CardTitle>
            <Badge variant="blue">ISOLATED RUNTIME</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Runs concurrently inside an isolated process container. If one client disconnects or encounters a gateway event timeout, the other continues running uninterrupted.
          </p>
          <div className="rounded bg-surface-subtle p-3 border border-surface-border text-xs font-mono space-y-1 text-slate-300">
            <div><span className="text-slate-500">ID:</span> bot_a</div>
            <div><span className="text-slate-500">Presence:</span> Hosting on Ongrywolf PRV</div>
            <div><span className="text-slate-500">Commands:</span> /log, /listlog, /channellog</div>
          </div>
        </Card>
      </div>

      {/* Official Commands Table */}
      <div className="rounded-lg border border-surface-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          OFFICIAL DISPATCH COMMANDS
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-surface-border text-slate-400">
                <th className="pb-2">Command</th>
                <th className="pb-2">Prefix Alt</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr>
                <td className="py-2.5 text-brand-300 font-bold">/log &lt;text&gt;</td>
                <td className="py-2.5 text-slate-400">!log</td>
                <td className="py-2.5">Records staff work log to PostgreSQL</td>
                <td className="py-2.5 text-slate-400">Admin / Staff Role</td>
              </tr>
              <tr>
                <td className="py-2.5 text-brand-300 font-bold">/listlog</td>
                <td className="py-2.5 text-slate-400">!listlog</td>
                <td className="py-2.5">Displays recent work logs in clean embed format</td>
                <td className="py-2.5 text-slate-400">Admin / Staff Role</td>
              </tr>
              <tr>
                <td className="py-2.5 text-brand-300 font-bold">/channellog set</td>
                <td className="py-2.5 text-slate-400">!channellog set</td>
                <td className="py-2.5">Designates dedicated logging channel</td>
                <td className="py-2.5 text-slate-400">Admin Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Self-Hosting & Dashboard CTA */}
      <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Want to configure or self-host your own bot?</div>
          <div className="text-xs text-slate-400">Use our Discord Bot Dashboard to generate your environment files.</div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/bots"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono uppercase tracking-wider shadow-blue-sm"
          >
            <span>Open Bot Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
