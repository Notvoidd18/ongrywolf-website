import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Bot,
  Box,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Activity,
  Terminal,
  Lock,
  Sparkles,
  Server,
  Radio,
  Check,
  Flame,
  ArrowUpRight,
  Shield,
  Gauge,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PRODUCTS, PORTFOLIO } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TextLineReveal } from '@/components/TextLineReveal';
import { SelectedWorkWorkspace } from '@/components/SelectedWorkWorkspace';

export default function HomePage() {
  const categoryIcons: Record<string, React.ReactNode> = {
    plugins: <Cpu className="w-6 h-6 text-brand-400 group-hover:text-brand-300 transition-colors" />,
    'discord-bots': <Bot className="w-6 h-6 text-brand-400 group-hover:text-brand-300 transition-colors" />,
    client: <Box className="w-6 h-6 text-brand-400 group-hover:text-brand-300 transition-colors" />,
    builds: <Layers className="w-6 h-6 text-brand-400 group-hover:text-brand-300 transition-colors" />,
  };

  const disciplineStatusBadge: Record<string, { label: string; pingColor: string }> = {
    plugins: { label: 'Active v3.4 Engine', pingColor: 'bg-emerald-400' },
    'discord-bots': { label: 'Fleet Online', pingColor: 'bg-brand-400' },
    client: { label: 'Private Beta', pingColor: 'bg-sky-400' },
    builds: { label: 'Commission Ready', pingColor: 'bg-amber-400' },
  };

  return (
    <div className="flex flex-col w-full bg-transparent selection:bg-brand-600 selection:text-white">
      {/* 1. EXPANDED HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-32 sm:pt-36 sm:pb-44 border-b border-white/[0.05]">
        {/* Ambient Radial Aura Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[950px] h-[320px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Main Hero Headline with Smooth Load Animation */}
          <ScrollReveal direction="up" delayMs={150} durationMs={950}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.05]">
              Built for worlds <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 text-glow">
                beyond ordinary.
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle Description */}
          <ScrollReveal direction="up" delayMs={250}>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              High-performance Minecraft systems, isolated Discord bot architectures, custom client modules, and tailored server builds engineered with strict technical purpose.
            </p>
          </ScrollReveal>

          {/* Hero CTAs */}
          <ScrollReveal direction="up" delayMs={350}>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-600/25"
              >
                <span>Explore Disciplines</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white font-medium text-sm border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 backdrop-blur-sm"
              >
                <Terminal className="w-4 h-4 text-brand-400" />
                <span>Launch Bot Fleet</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Upgraded Live Telemetry Floating Dock */}
          <ScrollReveal direction="up" delayMs={450}>
            <div className="pt-10 max-w-3xl mx-auto">
              <div className="relative rounded-2xl p-5 sm:p-6 text-left bg-gradient-to-b from-[#0f172a]/95 via-[#0c1220]/95 to-[#080d16]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl overflow-hidden space-y-4">
                {/* Tech crosshairs */}
                <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/15">+</span>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/15">+</span>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-200 font-mono font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="tracking-wide">Live Architecture Telemetry</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Two-Tier Isolation Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-brand-500/30 transition-colors">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gateway Host</div>
                    <div className="text-white font-semibold mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      <span>Ongrywolf</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-brand-500/30 transition-colors">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gateway Ping</div>
                    <div className="text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                      <Gauge className="w-3 h-3 text-emerald-400" />
                      <span>&lt; 35ms</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-brand-500/30 transition-colors">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Site Overhead</div>
                    <div className="text-white font-semibold mt-1">0.0 ms (Zero Loss)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-brand-500/30 transition-colors">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Token Security</div>
                    <div className="text-brand-300 font-semibold mt-1">Zero-Knowledge</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. CORE PRODUCTS & DISCIPLINES (NEW CYBER-CARDS) */}
      <section className="py-24 sm:py-32 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12">
        <ScrollReveal direction="up">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 font-mono text-[11px] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>ENTERPRISE SPECIFICATION STANDARDS</span>
            </div>
            <TextLineReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              Engineered for Speed, Stability & Clean Code
            </TextLineReveal>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Four specialized technical disciplines architected with strict memory safety, non-blocking asynchronous event loops, and bulletproof production stability.
            </p>

            {/* High-Precision Telemetry Strip */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto font-mono text-left">
              <div className="p-2.5 rounded-xl bg-surface/70 border border-white/[0.08] backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block uppercase">Gateway Ping</span>
                <span className="text-xs font-bold text-emerald-400">&lt; 12ms Realtime</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface/70 border border-white/[0.08] backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block uppercase">Runtime SLA</span>
                <span className="text-xs font-bold text-brand-300">99.98% Monitored</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface/70 border border-white/[0.08] backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block uppercase">Tenant Model</span>
                <span className="text-xs font-bold text-white">Full Isolation</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface/70 border border-white/[0.08] backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 block uppercase">Memory Safety</span>
                <span className="text-xs font-bold text-amber-300">0 Leak Policy</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
          {PRODUCTS.map((prod, index) => {
            const statusInfo = disciplineStatusBadge[prod.id] || {
              label: prod.status,
              pingColor: 'bg-brand-400',
            };

            return (
              <ScrollReveal key={prod.id} direction="up" delayMs={index * 120}>
                <div className="group relative rounded-2xl p-7 sm:p-8 bg-gradient-to-b from-[#0f172a]/95 via-[#0c1222]/95 to-[#070b14]/98 border border-white/[0.08] hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7),0_0_20px_-4px_rgba(59,130,246,0.12)] overflow-hidden flex flex-col justify-between h-full">
                  {/* Subtle top edge highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Tech Corner Crosshairs */}
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-white/10 group-hover:text-brand-400/30 transition-colors">+</span>
                  <span className="absolute top-3 right-3 text-[10px] font-mono text-white/10 group-hover:text-brand-400/30 transition-colors">+</span>

                  <div className="space-y-5">
                    {/* Top Row: Icon Container & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900/60 to-surface-elevated border border-brand-500/25 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-brand-500/40 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-200">
                        {categoryIcons[prod.id]}
                      </div>
                      
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border bg-brand-950/80 text-brand-300 border-brand-700/60 shadow-sm backdrop-blur-sm">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.pingColor} animate-pulse`} />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-brand-300 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        {prod.description}
                      </p>
                    </div>

                    {/* Features Checklist */}
                    <div className="pt-2 space-y-2.5 text-xs text-slate-300 font-mono">
                      {prod.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                          <span className="text-slate-200">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
                    <Link
                      href={prod.href}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 group/link"
                    >
                      <span>View specifications & details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1.5 transition-transform" />
                    </Link>
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                      Module #{index + 1}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 3. PLATFORM ARCHITECTURE PILLARS (TWO-TIER ADVANTAGE - UPGRADED CARDS) */}
      <section className="py-24 border-y border-white/[0.05] bg-[#080c16]/80 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <TextLineReveal
                as="h2"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              >
                Engineered for Zero Site Degradation
              </TextLineReveal>
              <p className="text-sm text-slate-400 leading-relaxed">
                Why our two-tier deployment architecture delivers unmatched uptime and responsiveness.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal direction="up" delayMs={50}>
              <div className="group relative rounded-2xl p-7 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1d]/95 to-[#060812]/95 border border-white/[0.08] hover:border-blue-500/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.7),0_0_18px_-4px_rgba(59,130,246,0.12)] h-full space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                    Runtime Isolation
                  </div>
                  <h3 className="text-lg font-bold text-white">Zero Speed Loss</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discord Gateway WebSockets execute strictly on isolated Ongrywolf core runtimes. The public website and dashboard never proxy gateway traffic, maintaining 100% responsiveness.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2 border-t border-white/[0.05]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>0.0ms Site Proxy Latency</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={150}>
              <div className="group relative rounded-2xl p-7 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1d]/95 to-[#060812]/95 border border-white/[0.08] hover:border-emerald-500/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.7),0_0_18px_-4px_rgba(16,185,129,0.12)] h-full space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 transition-colors">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    Cryptographic Shield
                  </div>
                  <h3 className="text-lg font-bold text-white">Zero-Knowledge Security</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discord bot tokens and secrets are transmitted directly to the bot host over authenticated HTTPS and are never leaked into browser state or API payloads.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2 border-t border-white/[0.05]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>End-to-End Vault Encrypted</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={250}>
              <div className="group relative rounded-2xl p-7 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1d]/95 to-[#060812]/95 border border-white/[0.08] hover:border-sky-500/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.7),0_0_18px_-4px_rgba(56,189,248,0.12)] h-full space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                    Self-Healing Fleet
                  </div>
                  <h3 className="text-lg font-bold text-white">Autonomous Resilience</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every bot runs inside an isolated runtime container with ring-buffered telemetry, auto-reboot guards, and in-memory persistence fallback.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2 border-t border-white/[0.05]">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Auto-Restart &amp; Ring Buffer</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. SELECTED WORK & TECHNICAL PORTFOLIO */}
      <section className="py-24 sm:py-32 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12">
        <ScrollReveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
            <div>
              <TextLineReveal
                as="h2"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              >
                Selected Work
              </TextLineReveal>
              <p className="text-sm text-slate-400 mt-1">
                Real technical achievements across deployed production environments and upcoming plugin suites.
              </p>
            </div>
            <Link
              href="/work"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 group self-start sm:self-auto"
            >
              <span>Explore workspace details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delayMs={100}>
          <SelectedWorkWorkspace showExploreLink={false} />
        </ScrollReveal>
      </section>

      {/* 5. FINAL HIGH-IMPACT CTA */}
      <section className="py-24 sm:py-32 border-t border-white/[0.05] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-radial-aura pointer-events-none -z-10" />

        <ScrollReveal direction="up">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <TextLineReveal
              as="h2"
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            >
              Have a custom requirement?
            </TextLineReveal>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
              Submit a technical specification for custom Minecraft entity behavior, paper plugins, client modifications, or remote Discord bot hosting.
            </p>

            <div className="pt-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-600/25"
              >
                <span>Submit Technical Request</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
