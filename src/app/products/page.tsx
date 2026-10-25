import React from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Bot, Box, Layers, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PRODUCTS } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function ProductsPage() {
  const categoryIcons: Record<string, React.ReactNode> = {
    plugins: <Cpu className="w-5 h-5 text-brand-400" />,
    'discord-bots': <Bot className="w-5 h-5 text-brand-400" />,
    client: <Box className="w-5 h-5 text-brand-400" />,
    builds: <Layers className="w-5 h-5 text-brand-400" />,
  };

  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-12">
      <ScrollReveal direction="down">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-[11px] uppercase tracking-wider">
            Engineering Disciplines
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Production-Grade Systems
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Explore our four core verticals. Each product is engineered with a strict emphasis on performance, modularity, and production stability.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PRODUCTS.map((p, index) => (
          <ScrollReveal key={p.id} direction="up" delayMs={index * 100}>
            <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between h-full space-y-6 hover:border-brand-500/30 hover:bg-surface-elevated/85 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.7),0_0_18px_-4px_rgba(59,130,246,0.12)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-950/80 border border-brand-800/80 flex items-center justify-center shadow-inner">
                    {categoryIcons[p.id]}
                  </div>
                  <Badge variant="blue">{p.status}</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{p.title}</h2>
                  <div className="text-xs font-mono text-brand-400 mt-1">{p.compatibility}</div>
                  <p className="text-sm mt-3 leading-relaxed text-slate-300">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-semibold">
                    Core Specifications
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.06]">
                <Link
                  href={p.href}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-brand-600 text-slate-200 hover:text-white border border-white/[0.08] hover:border-brand-500 text-xs font-mono uppercase tracking-wider transition-all duration-200"
                >
                  <span>View Full Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
