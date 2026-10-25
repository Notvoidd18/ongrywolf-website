import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Box, CheckCircle2, Gauge, Monitor, Sliders } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ClientPage() {
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
          <Badge variant="blue">SYSTEM VERTICAL 03</Badge>
          <span className="text-xs font-mono text-slate-400">Fabric 1.20.4 – 1.21.x</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Box className="w-8 h-8 text-brand-400" />
          Ongrywolf Custom Minecraft Client
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          A minimalist performance client module built from the ground up for competitive gameplay. Stripped of bloat, tuned for frame consistency, and equipped with a distraction-free, customizable blue-accent HUD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <Gauge className="w-6 h-6 text-brand-400" />
          <CardTitle className="text-base font-semibold">Render Pipeline Optimization</CardTitle>
          <p className="text-xs text-slate-400 leading-relaxed">
            Entity culling and chunk mesh generation modifications that reduce frame pacing micro-stutters during high-speed PvP.
          </p>
        </Card>

        <Card className="space-y-3">
          <Monitor className="w-6 h-6 text-brand-400" />
          <CardTitle className="text-base font-semibold">Minimalist Blue HUD</CardTitle>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drag-and-drop armor durability, coordinates, keystrokes, and CPS counters designed specifically with our clean dark-slate and technical-blue aesthetic.
          </p>
        </Card>

        <Card className="space-y-3">
          <Sliders className="w-6 h-6 text-brand-400" />
          <CardTitle className="text-base font-semibold">Memory Heap Management</CardTitle>
          <p className="text-xs text-slate-400 leading-relaxed">
            Custom Java GC allocation profiles keeping baseline runtime memory beneath 1.2 GB, preventing garbage collection freeze frames.
          </p>
        </Card>
      </div>

      <div className="rounded-lg border border-surface-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white font-mono">DEVELOPMENT STATUS</div>
          <Badge variant="blue">PRIVATE BETA</Badge>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Ongrywolf client is currently in active closed beta testing across selected SMP and practice networks. We do not offer public consumer downloads until security reviews and anti-cheat compatibility certifications are finalized.
        </p>
      </div>

      <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Interested in beta testing or custom server client builds?</div>
          <div className="text-xs text-slate-400">Reach out through our project request form for partner inquiries.</div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono uppercase tracking-wider shadow-blue-sm"
        >
          <span>Inquire About Client</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
