import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers, CheckCircle2, Compass, Shield, Maximize2 } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function BuildsPage() {
  const builds = [
    {
      title: 'The Obsidian Spire Hub & Spawn',
      type: 'Server Hub / Spawn Arena',
      size: '500 x 500 Blocks',
      description:
        'A dark fantasy monolithic citadel featuring radial player portal corridors, floating celestial rings, and pre-calculated chunk lighting ensuring zero lighting lag.',
      tags: ['Dark Fantasy', 'Radial Pathing', 'FAWE Optimized'],
    },
    {
      title: 'Glacial Abyss Ranked PvP Arena',
      type: 'Competitive Minigame Arena',
      size: '200 x 200 Blocks',
      description:
        'Architected for tactical competitive sightlines, tiered jump levels, zero choke bottlenecks, and clear color contrast for high-speed target acquisition.',
      tags: ['Competitive PvP', 'Sightline Balanced', 'Schematic Delivery'],
    },
    {
      title: 'Ancient Rune Dungeons & Crypts',
      type: 'Procedural RPG Dungeon',
      size: 'Modular 32x32 Tiles',
      description:
        'Modular dungeon chambers designed for MythicMob boss rooms, secret redstone triggers, pressure plates, and atmospheric lighting passes.',
      tags: ['RPG Dungeon', 'Modular Chunks', 'Puzzle Ready'],
    },
  ];

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
          <Badge variant="blue">SYSTEM VERTICAL 04</Badge>
          <span className="text-xs font-mono text-slate-400">FAWE & WorldEdit Schematics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-brand-400" />
          High-Quality Minecraft Builds & World Architecture
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Monumental structures, intuitive player navigation hubs, and balanced minigame battlegrounds. Each project is crafted with strict attention to chunk boundary performance, player flow, and barrier block safety.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {builds.map((b, idx) => (
          <Card key={idx} hoverEffect className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-full h-36 rounded-md bg-surface-subtle border border-surface-border flex flex-col items-center justify-center text-slate-500 font-mono text-xs relative overflow-hidden group">
                <div className="absolute inset-0 bg-tech-grid opacity-30"></div>
                <Compass className="w-8 h-8 text-brand-500/50 mb-1" />
                <span className="text-slate-300 font-medium">{b.size}</span>
                <span className="text-[10px] text-brand-400">FAWE SCHEMATIC</span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider">{b.type}</span>
                <CardTitle className="text-base font-bold mt-1">{b.title}</CardTitle>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{b.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex flex-wrap gap-1">
              {b.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-slate-300 border border-surface-border">
                  {t}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Need a bespoke spawn or map schematic?</div>
          <div className="text-xs text-slate-400">All builds delivered with .schem files and placement guidelines.</div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono uppercase tracking-wider shadow-blue-sm"
        >
          <span>Commission a Build</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
