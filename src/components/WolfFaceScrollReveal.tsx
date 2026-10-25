'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

export function WolfFaceScrollReveal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Track scroll state with smooth lerping
  const stateRef = useRef({
    currentProgress: 0,
    targetProgress: 0,
    lastApplied: -1,
  });

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Update target progress from Lenis smooth scroll
  useLenis((lenis) => {
    if (prefersReducedMotion) return;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    stateRef.current.targetProgress = Math.min(
      1,
      Math.max(0, lenis.scroll / maxScroll)
    );
  });

  // Render / animation loop for silky smooth transformation
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animId: number;

    // Fallback native scroll listener
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      stateRef.current.targetProgress = Math.min(
        1,
        Math.max(0, scrollY / maxScroll)
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const el = containerRef.current;
    if (!el) return;

    const loop = () => {
      const state = stateRef.current;
      // Smooth interpolation for momentum responsiveness
      state.currentProgress +=
        (state.targetProgress - state.currentProgress) * 0.14;

      const p = state.currentProgress;

      // Only update DOM if there is perceptible change
      if (Math.abs(p - state.lastApplied) > 0.0005) {
        state.lastApplied = p;

        // Emergence starts smoothly after 5% scroll, reaching full bloom at bottom (>= 85%)
        const emergence = Math.max(0, Math.min(1, (p - 0.05) / 0.85));
        // Smoothstep curve for natural organic motion
        const smoothEmergence = emergence * emergence * (3 - 2 * emergence);

        // Calculate physical emergence parameters
        // At p=0: submerged 240px below the bottom edge
        // At p=1: fully risen to 0px
        const translateY = (1 - smoothEmergence) * 240;
        const scale = 0.82 + 0.18 * smoothEmergence;
        const opacity = Math.min(1, smoothEmergence * 1.35);

        // Eye ignition starts around 25% emergence and peaks with intense glow
        const eyeIntensity = Math.max(0, Math.min(1, (smoothEmergence - 0.2) / 0.8));
        const moonOpacity = Math.max(0, Math.min(1, (smoothEmergence - 0.1) * 1.2));
        const branchOpacity = Math.max(0, Math.min(0.85, smoothEmergence * 0.95));

        el.style.transform = `translate3d(-50%, ${translateY}px, 0) scale(${scale})`;
        el.style.opacity = `${opacity}`;
        el.style.setProperty('--moon-opacity', `${moonOpacity}`);
        el.style.setProperty('--branch-opacity', `${branchOpacity}`);
        el.style.setProperty('--eye-glow-opacity', `${eyeIntensity}`);
        el.style.setProperty('--eye-base-opacity', `${Math.min(1, eyeIntensity * 1.2)}`);
        el.style.setProperty('--eye-core-opacity', `${eyeIntensity}`);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-1/2 pointer-events-none z-10 w-full max-w-[360px] sm:max-w-[480px] md:max-w-[560px] select-none flex items-end justify-center will-change-transform"
      style={{
        transform: 'translate3d(-50%, 240px, 0) scale(0.82)',
        opacity: 0,
        transformOrigin: 'bottom center',
      }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 620"
        className="w-full h-auto drop-shadow-[0_0_50px_rgba(9,13,22,0.95)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Atmospheric Moon Aura */}
          <radialGradient id="lunarAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="1" />
            <stop offset="45%" stopColor="#E2E8F0" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#94A3B8" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#090D16" stopOpacity="0" />
          </radialGradient>

          {/* Multi-tier Intense Crimson Eye Bloom Filter */}
          <filter id="crimsonEyeBloom" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blurSmall" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blurMed" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="blurLarge" />
            <feMerge>
              <feMergeNode in="blurLarge" />
              <feMergeNode in="blurMed" />
              <feMergeNode in="blurSmall" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft Moon Filter */}
          <filter id="moonSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wolf Body Fur Gradients */}
          <linearGradient id="wolfFurDarkGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#141E32" />
            <stop offset="35%" stopColor="#0E1626" />
            <stop offset="70%" stopColor="#090E1A" />
            <stop offset="100%" stopColor="#060912" />
          </linearGradient>

          {/* Subtle Cyan Specular Rim Stroke */}
          <linearGradient id="furRimCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="25%" stopColor="#60A5FA" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.1" />
            <stop offset="75%" stopColor="#60A5FA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
          </linearGradient>

          {/* Base Mist Fade into Ongrywolf Background */}
          <linearGradient id="deepMistFade" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#090D16" stopOpacity="0" />
            <stop offset="60%" stopColor="#090D16" stopOpacity="0.7" />
            <stop offset="90%" stopColor="#090D16" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#090D16" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. FULL MOON IN NIGHT SKY */}
        <g opacity="var(--moon-opacity, 0)">
          <circle cx="300" cy="140" r="95" fill="url(#lunarAura)" />
          <circle
            cx="300"
            cy="140"
            r="62"
            fill="#F1F5F9"
            opacity="0.95"
            filter="url(#moonSoftGlow)"
          />
          {/* Lunar surface craters & maria */}
          <circle cx="275" cy="122" r="16" fill="#CBD5E1" opacity="0.55" />
          <circle cx="320" cy="150" r="22" fill="#CBD5E1" opacity="0.45" />
          <circle cx="290" cy="162" r="12" fill="#94A3B8" opacity="0.5" />
          <circle cx="330" cy="120" r="8" fill="#94A3B8" opacity="0.4" />

          {/* Silhouetted Bats Flying Across Moon */}
          <path
            d="M 320,105 Q 328,98 338,104 Q 344,98 352,105 Q 344,108 338,106 Q 328,108 320,105 Z"
            fill="#090D16"
            opacity="0.85"
          />
          <path
            d="M 265,130 Q 272,122 280,128 Q 286,122 294,129 Q 286,133 280,131 Q 272,133 265,130 Z"
            fill="#090D16"
            opacity="0.8"
          />
          <path
            d="M 335,145 Q 340,140 346,144 Q 351,140 357,145 Q 351,148 346,147 Q 340,148 335,145 Z"
            fill="#090D16"
            opacity="0.75"
          />
          <path
            d="M 345,180 Q 349,176 354,179 Q 358,176 363,180 Q 358,182 354,181 Q 349,182 345,180 Z"
            fill="#090D16"
            opacity="0.6"
          />
        </g>

        {/* 2. SILHOUETTE TREE BRANCHES FRAMING THE NOCTURNAL SCENE */}
        <g opacity="var(--branch-opacity, 0)">
          {/* Right branch */}
          <path
            d="M 560,0 C 545,40 535,80 540,130 C 543,155 525,180 500,210 C 485,228 470,235 450,240 L 452,244 C 475,239 495,230 515,212 C 538,190 558,150 555,110 C 552,70 568,30 580,0 Z"
            fill="#070A10"
            opacity="0.85"
          />
          <path
            d="M 525,180 C 490,170 470,185 455,190 L 456,193 C 472,187 492,174 525,183 Z"
            fill="#070A10"
            opacity="0.8"
          />
          {/* Left branch */}
          <path
            d="M 40,0 C 55,50 60,95 50,150 C 42,185 20,220 0,245 L 0,250 C 25,225 48,188 56,150 C 66,95 60,45 45,0 Z"
            fill="#070A10"
            opacity="0.75"
          />
        </g>

        {/* 3. MAIN FRONT-FACING WOLF HEAD & SHOULDER ENTITY */}
        <g id="wolfEntity">
          {/* Outer/Back Ear Silhouettes */}
          <polygon points="210,245 160,115 250,215" fill="#080C16" />
          <polygon points="390,245 440,115 350,215" fill="#080C16" />

          {/* Inner Ear Cavity Shadows */}
          <polygon points="215,238 172,132 238,210" fill="#121A2B" />
          <polygon points="385,238 428,132 362,210" fill="#121A2B" />

          {/* Main Wolf Skull & Ruff Hull */}
          <path
            d="M 300,225 C 280,225 250,220 230,230 C 212,238 188,262 178,290 C 166,315 138,340 130,375 C 124,398 140,418 152,424 C 164,430 182,424 194,418 C 176,442 170,470 182,495 C 194,520 225,545 255,570 C 275,582 292,590 300,590 C 308,590 325,582 345,570 C 375,545 406,520 418,495 C 430,470 424,442 406,418 C 418,424 436,430 448,424 C 460,418 476,398 470,375 C 462,340 434,315 422,290 C 412,262 388,238 370,230 C 350,220 320,225 300,225 Z"
            fill="url(#wolfFurDarkGrad)"
            stroke="url(#furRimCyanGrad)"
            strokeWidth="2.0"
            strokeLinejoin="round"
          />

          {/* Forehead Furrowed Brow Ridges */}
          <path
            d="M 258,285 C 275,296 292,302 300,302 C 308,302 325,296 342,285"
            stroke="#1E293B"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 276,268 C 288,278 300,280 300,280 C 300,280 312,278 324,268"
            stroke="#18233C"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 292,250 L 300,260 L 308,250"
            stroke="#18233C"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Nasal Bridge & Muzzle */}
          <path
            d="M 282,320 L 270,428 C 270,452 288,470 300,470 C 312,470 330,452 330,428 L 318,320 Z"
            fill="#080C16"
            stroke="#18233C"
            strokeWidth="1.8"
          />

          {/* Wolf Nose Pad */}
          <path
            d="M 285,432 C 290,427 295,425 300,425 C 305,425 310,427 315,432 C 320,438 315,449 300,451 C 285,449 280,438 285,432 Z"
            fill="#04060A"
            stroke="#1E293B"
            strokeWidth="1.2"
          />
          <circle cx="294" cy="439" r="2.2" fill="#000000" />
          <circle cx="306" cy="439" r="2.2" fill="#000000" />

          {/* Snout Mouth Line */}
          <path
            d="M 300,451 L 300,465 M 282,460 C 291,465 300,465 300,465 C 300,465 309,465 318,460"
            stroke="#04060A"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cheek Whisker Tufts */}
          <path
            d="M 205,395 C 224,402 244,408 264,414"
            stroke="#121A2B"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M 395,395 C 376,402 356,408 336,414"
            stroke="#121A2B"
            strokeWidth="1.8"
            fill="none"
          />

          {/* 4. GLOWING CRIMSON RED EYES (Signature from reference image) */}
          {/* Left Eye Ambient Bloom */}
          <circle
            cx="250"
            cy="320"
            r="19"
            fill="rgba(255, 30, 60, 0.6)"
            filter="url(#crimsonEyeBloom)"
            opacity="var(--eye-glow-opacity, 0)"
          />
          {/* Right Eye Ambient Bloom */}
          <circle
            cx="350"
            cy="320"
            r="19"
            fill="rgba(255, 30, 60, 0.6)"
            filter="url(#crimsonEyeBloom)"
            opacity="var(--eye-glow-opacity, 0)"
          />

          {/* Left Eye Angular Slit */}
          <path
            d="M 232,317 C 240,310 260,312 268,320 C 260,326 240,326 232,317 Z"
            fill="#FF1E3C"
            stroke="#FF3856"
            strokeWidth="1.4"
            opacity="var(--eye-base-opacity, 0)"
          />
          {/* Left Eye Bright Core */}
          <ellipse
            cx="250"
            cy="319"
            rx="4.8"
            ry="2.6"
            fill="#FFF0F2"
            opacity="var(--eye-core-opacity, 0)"
          />
          <circle
            cx="251"
            cy="318.5"
            r="1.4"
            fill="#FFFFFF"
            opacity="var(--eye-core-opacity, 0)"
          />

          {/* Right Eye Angular Slit */}
          <path
            d="M 368,317 C 360,310 340,312 332,320 C 340,326 360,326 368,317 Z"
            fill="#FF1E3C"
            stroke="#FF3856"
            strokeWidth="1.4"
            opacity="var(--eye-base-opacity, 0)"
          />
          {/* Right Eye Bright Core */}
          <ellipse
            cx="350"
            cy="319"
            rx="4.8"
            ry="2.6"
            fill="#FFF0F2"
            opacity="var(--eye-core-opacity, 0)"
          />
          <circle
            cx="349"
            cy="318.5"
            r="1.4"
            fill="#FFFFFF"
            opacity="var(--eye-core-opacity, 0)"
          />
        </g>

        {/* 5. Deep Nocturnal Base Mist Fade */}
        <rect x="0" y="470" width="600" height="150" fill="url(#deepMistFade)" />
      </svg>
    </div>
  );
}
