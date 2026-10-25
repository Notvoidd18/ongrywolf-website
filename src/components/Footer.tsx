import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Radio, Terminal } from 'lucide-react';
import { CinematicFooterWolf } from '@/components/CinematicFooterWolf';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#07090e] text-slate-400 text-xs relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                O
              </div>
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-brand-300 transition-colors">
                ONGRYWOLF
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              Minecraft plugins, custom entities, high-framerate client modules, and dedicated Discord automation architectures.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Architecture v2.4 Live</span>
            </div>
          </div>

          {/* Core Disciplines */}
          <div className="space-y-3">
            <div className="text-white text-xs font-semibold tracking-wide uppercase font-mono">Disciplines</div>
            <ul className="space-y-2">
              <li>
                <Link href="/products/plugins" className="hover:text-white transition-colors">
                  Minecraft Plugins & Mobs
                </Link>
              </li>
              <li>
                <Link href="/products/discord-bots" className="hover:text-white transition-colors">
                  Discord Multi-Bot Fleet
                </Link>
              </li>
              <li>
                <Link href="/products/client" className="hover:text-white transition-colors">
                  Custom Client Engine
                </Link>
              </li>
              <li>
                <Link href="/products/builds" className="hover:text-white transition-colors">
                  High-Complexity World Builds
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <div className="text-white text-xs font-semibold tracking-wide uppercase font-mono">Navigation</div>
            <ul className="space-y-2">
              <li>
                <Link href="/work" className="hover:text-white transition-colors">
                  Technical Showcase
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Bot Management Fleet
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Project Request
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Discord Session Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Infrastructure Specs */}
          <div className="space-y-3">
            <div className="text-white text-xs font-semibold tracking-wide uppercase font-mono">Two-Tier Infrastructure</div>
            <p className="text-xs leading-relaxed text-slate-400">
              Ongrywolf executes bot WebSockets on isolated high-performance cloud clusters. The web interface operates with zero gateway overhead and zero-knowledge token management.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>&copy; {new Date().getFullYear()} Ongrywolf Studio. All rights reserved.</div>
          <div>Built for worlds beyond ordinary.</div>
        </div>
      </div>

      {/* Down at the bottom of the footer: Grand Cinematic Wolf & ONGRYWOLF reveal */}
      <div className="border-t border-white/[0.04] w-full bg-gradient-to-b from-[#07090e] via-[#05070b] to-[#030407]">
        <CinematicFooterWolf />
      </div>
    </footer>
  );
}
