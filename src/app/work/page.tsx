import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Terminal, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PORTFOLIO } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function WorkPage() {
  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-12">
      <ScrollReveal direction="down">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-[11px] uppercase tracking-wider">
            Engineering Portfolio
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Selected Technical Deployments
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Production systems engineered by Ongrywolf across Discord bot infrastructures, custom Minecraft entities, game server architecture, and competitive client modules.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PORTFOLIO.map((item, index) => (
          <ScrollReveal key={item.id} direction="up" delayMs={index * 100}>
            <div className="glass-panel rounded-2xl p-8 space-y-6 flex flex-col justify-between h-full hover:border-brand-500/30 hover:bg-surface-elevated/85 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.7),0_0_18px_-4px_rgba(59,130,246,0.12)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-400 uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-slate-300 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
                    {item.clientOrContext}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Key Technical Results
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-brand-400 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.03] text-slate-300 border border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Direct Project Request Callout */}
      <ScrollReveal direction="up" delayMs={150}>
        <div className="glass-panel-elevated rounded-2xl p-8 sm:p-10 text-center space-y-4 max-w-3xl mx-auto border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Selective Technical Engagements</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Have an ambitious project specification?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            We accept selective commissions for game server development, custom bot deployments, and bespoke Minecraft mechanics.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-[0_0_20px_-3px_rgba(37,99,235,0.4)] transition-all"
            >
              <span>Submit a Technical Specification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
