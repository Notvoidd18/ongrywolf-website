'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Shield, ArrowRight, LogOut, User } from 'lucide-react';
import { SessionData } from '@/lib/session';

interface NavbarProps {
  session: SessionData | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Showcase', href: '/work' },
    { name: 'Fleet', href: '/dashboard' },
  ];

  return (
    <header className="fixed top-3.5 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto relative w-full max-w-5xl rounded-full border transition-all duration-300 backdrop-blur-2xl shadow-2xl flex items-center justify-between px-3.5 sm:px-5 py-2 sm:py-2.5 ${
          scrolled
            ? 'bg-[#060911]/92 border-white/[0.12] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85),0_0_25px_-5px_rgba(37,99,235,0.25)]'
            : 'bg-[#070b16]/80 border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Subtle Cyber Laser Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent pointer-events-none" />

        {/* Brand Crest & Wordmark (Clean, no glow) */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 pr-1">
          {/* Cyber Wolf Emblem Badge */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0b101d] border border-white/[0.1] group-hover:border-brand-500/30 group-hover:shadow-[0_0_12px_-2px_rgba(59,130,246,0.18)] transition-all duration-200 flex items-center justify-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:scale-105 transition-transform"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Geometric Wolf Head Silhouetted Facets */}
              <path
                d="M16 28L12 21L6 17L8 11L11 4L14 11L16 8L18 11L21 4L24 11L26 17L20 21L16 28Z"
                fill="#070c18"
                stroke="#475569"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              {/* Wolf Brow & Nasal Bridge Ridges */}
              <path
                d="M16 8V28M12 21H20M14 15L16 18L18 15"
                stroke="#64748b"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              {/* Clean Predator Eyes (no blur, no pulse) */}
              <circle cx="12.5" cy="14" r="1.1" fill="#60A5FA" />
              <circle cx="19.5" cy="14" r="1.1" fill="#60A5FA" />
            </svg>
          </div>

          {/* Futuristic Brand Wordmark (Clean, sharp, no drop-shadow glow) */}
          <div className="flex items-center font-crazy-wolf text-[14px] sm:text-[15px] font-black tracking-[0.16em] uppercase select-none">
            <span className="text-white group-hover:text-slate-100 transition-colors">
              ONGRY
            </span>
            <span className="text-brand-400 group-hover:text-brand-300 transition-colors ml-0.5">
              WOLF
            </span>
          </div>
        </Link>

        {/* Center Nav Capsule Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/[0.1] shadow-sm font-semibold border border-white/[0.08]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-[2px] bg-brand-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]" />
                )}
              </Link>
            );
          })}

          {session?.isOwner && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname.startsWith('/admin')
                  ? 'text-brand-300 bg-brand-500/20 border border-brand-500/30'
                  : 'text-brand-400/80 hover:text-brand-300 hover:bg-brand-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Action Island */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {session ? (
            <div className="flex items-center gap-2 bg-white/[0.03] pl-2 pr-1.5 py-1 rounded-full border border-white/[0.08]">
              {session.avatarUrl ? (
                <img
                  src={session.avatarUrl}
                  alt={session.discordUsername}
                  className="w-5 h-5 rounded-full ring-1 ring-white/10"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-brand-400" />
              )}
              <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                {session.discordUsername}
              </span>
              {session.isOwner && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  OWNER
                </span>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-0.5"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.04] transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-sm hover:shadow-md hover:shadow-brand-600/30 transition-all duration-200"
          >
            <span>Request Work</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-full bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Floating Dropdown Drawer */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-3xl bg-[#070b16]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl space-y-3 pointer-events-auto md:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {session?.isOwner && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 font-semibold rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  <Shield className="w-4 h-4 text-brand-400" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              {session ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] text-xs text-slate-300 border border-white/[0.05]">
                  <span className="font-medium text-white">{session.discordUsername}</span>
                  <button
                    onClick={handleLogout}
                    className="text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center block text-xs font-semibold py-2.5 rounded-xl bg-white/[0.04] text-slate-200 border border-white/[0.08]"
                >
                  Sign In with Discord
                </Link>
              )}

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center block text-xs font-semibold py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all"
              >
                Request Work
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
