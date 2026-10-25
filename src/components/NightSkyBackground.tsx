'use client';

import React from 'react';

// Deterministic sparse star distribution (24 stars total - subtle and very minimal)
const STARS = [
  { top: '6%', left: '14%', size: 1.5, dur: '5.2s', delay: '0.4s' },
  { top: '12%', left: '78%', size: 1.2, dur: '4.8s', delay: '1.2s' },
  { top: '9%', left: '42%', size: 2, dur: '6.5s', delay: '2.1s' },
  { top: '18%', left: '26%', size: 1, dur: '5.0s', delay: '0.8s' },
  { top: '15%', left: '88%', size: 1.5, dur: '4.2s', delay: '1.9s' },
  { top: '24%', left: '62%', size: 1.2, dur: '5.8s', delay: '2.7s' },
  { top: '28%', left: '8%', size: 1.8, dur: '6.0s', delay: '0.2s' },
  { top: '33%', left: '82%', size: 1, dur: '4.5s', delay: '3.1s' },
  { top: '38%', left: '48%', size: 1.6, dur: '5.4s', delay: '1.5s' },
  { top: '44%', left: '19%', size: 1.2, dur: '4.9s', delay: '2.3s' },
  { top: '48%', left: '92%', size: 1.4, dur: '6.2s', delay: '0.6s' },
  { top: '53%', left: '35%', size: 1, dur: '5.6s', delay: '1.8s' },
  { top: '59%', left: '73%', size: 1.8, dur: '4.7s', delay: '3.4s' },
  { top: '64%', left: '12%', size: 1.2, dur: '5.1s', delay: '0.9s' },
  { top: '68%', left: '55%', size: 1.5, dur: '6.4s', delay: '2.5s' },
  { top: '74%', left: '86%', size: 1, dur: '4.3s', delay: '1.1s' },
  { top: '79%', left: '28%', size: 1.6, dur: '5.7s', delay: '3.0s' },
  { top: '83%', left: '68%', size: 1.2, dur: '4.6s', delay: '0.5s' },
  { top: '87%', left: '44%', size: 1.4, dur: '6.1s', delay: '2.2s' },
  { top: '92%', left: '16%', size: 1, dur: '5.3s', delay: '1.6s' },
  { top: '95%', left: '81%', size: 1.5, dur: '4.9s', delay: '2.8s' },
];

export function NightSkyBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
    >
      <style jsx>{`
        @keyframes subtleStarTwinkle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
        .star-twinkle {
          animation: subtleStarTwinkle ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .star-twinkle {
            animation: none;
            opacity: 0.35;
          }
        }
      `}</style>

      {/* Deep Nocturnal Sky Backing */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03060f] via-[#050914] to-[#020409]" />

      {/* Atmospheric High Lunar Haze (Soft blue-indigo moon glow at sky dome) */}
      <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-sky-500/10 via-brand-600/5 to-transparent rounded-full blur-[140px]" />
      
      {/* Soft Nocturnal Horizon Mist */}
      <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-[#020408] via-[#050913]/40 to-transparent" />

      {/* Sparse, Minimal Twinkling Night Stars */}
      {STARS.map((star, idx) => (
        <span
          key={idx}
          className="star-twinkle absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: star.dur,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
