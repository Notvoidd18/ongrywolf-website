import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Cpu, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PluginsPage() {
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
          <Badge variant="blue">SYSTEM VERTICAL 01</Badge>
          <span className="text-xs font-mono text-slate-400">Paper / Purpur 1.20.x – 1.21.x</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Cpu className="w-8 h-8 text-brand-400" />
          Minecraft Plugins & Custom Mobs
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          High-performance server mechanics designed for zero-TPS loss. Custom entity behavioral AI, balanced boss encounters, mathematical particle physics, and asynchronous database persistence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardTitle className="text-base font-semibold text-brand-300">
            Custom Mob Behavioral Trees
          </CardTitle>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard Minecraft mobs rely on rudimentary pathfinding. We construct custom multi-phase state machines where bosses dynamically change tactics based on party density, player defensive buffs, and arena hazards.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Multi-phase transitions (Enrage, Shield, Aerial, Summon)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Raycast hitboxes independent of vanilla bounding boxes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Dynamic aggro targeting prioritizing healers and burst DPS
            </li>
          </ul>
        </Card>

        <Card className="space-y-4">
          <CardTitle className="text-base font-semibold text-brand-300">
            Engineered for High-Concurrency TPS
          </CardTitle>
          <p className="text-xs text-slate-300 leading-relaxed">
            Poorly written plugins cause server tick lag when 30+ players enter combat. Our systems decouple calculations from the main server tick thread through asynchronous packet handling and connection pooling.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Asynchronous PostgreSQL & HikariCP pooling
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Low-frequency particle batching to avoid client GPU stutter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Compatibility with Paper, Purpur, Foliar, and Spigot
            </li>
          </ul>
        </Card>
      </div>

      <div className="rounded-lg border border-surface-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" />
          COMPATIBILITY MATRIX
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-surface-border text-slate-400">
                <th className="pb-2">Engine</th>
                <th className="pb-2">Supported Versions</th>
                <th className="pb-2">Java Runtime</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr>
                <td className="py-2.5 text-white">Paper / Purpur</td>
                <td className="py-2.5">1.20.1 – 1.21.x</td>
                <td className="py-2.5">Java 21</td>
                <td className="py-2.5 text-emerald-400">Fully Supported</td>
              </tr>
              <tr>
                <td className="py-2.5 text-white">Spigot</td>
                <td className="py-2.5">1.20.x</td>
                <td className="py-2.5">Java 17 / 21</td>
                <td className="py-2.5 text-brand-300">Supported</td>
              </tr>
              <tr>
                <td className="py-2.5 text-white">MythicMobs Hook</td>
                <td className="py-2.5">v5.4+</td>
                <td className="py-2.5">Java 21</td>
                <td className="py-2.5 text-emerald-400">Integrated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Need a custom plugin commission?</div>
          <div className="text-xs text-slate-400">Specify your mechanics, server version, and requirements.</div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono uppercase tracking-wider shadow-blue-sm"
        >
          <span>Request Plugin Quote</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
