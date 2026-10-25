'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

export function CinematicFooterWolf() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [inView, setInView] = useState(false);
  const [scrollReveal, setScrollReveal] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });
  const [trailLeft, setTrailLeft] = useState({ x: 0, y: 0 });
  const [trailRight, setTrailRight] = useState({ x: 0, y: 0 });
  const [isWolfHovered, setIsWolfHovered] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer to activate stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px 150px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate fine scroll progress through the bottom of the page
  useLenis((lenis) => {
    if (prefersReducedMotion) return;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const progress = Math.min(1, Math.max(0, lenis.scroll / maxScroll));
    const footerRange = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
    setScrollReveal(footerRange);
  });

  // Fallback native scroll listener
  useEffect(() => {
    if (prefersReducedMotion) return;
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      const footerRange = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
      setScrollReveal(footerRange);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReducedMotion]);

  // Clean, organic wolf eye tracking with localized crimson ocular gaze trails
  useEffect(() => {
    if (prefersReducedMotion) return;
    let targetLeftX = 0;
    let targetLeftY = 0;
    let targetRightX = 0;
    let targetRightY = 0;
    let currentLeftX = 0;
    let currentLeftY = 0;
    let currentRightX = 0;
    let currentRightY = 0;
    let trailLX = 0;
    let trailLY = 0;
    let trailRX = 0;
    let trailRY = 0;
    let trackingActive = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();

      // Check if mouse is anywhere within reasonable proximity of the bottom stage
      const isInProximity =
        e.clientX >= rect.left - 350 &&
        e.clientX <= rect.right + 350 &&
        e.clientY >= rect.top - 250 &&
        e.clientY <= rect.bottom + 300;

      if (isInProximity) {
        trackingActive = true;
        setIsTracking(true);

        const svgX = ((e.clientX - rect.left) / rect.width) * 600;
        const svgY = ((e.clientY - rect.top) / rect.height) * 640;

        // Left Eye Vector (center: 253, 329)
        const ldx = svgX - 253;
        const ldy = svgY - 329;
        const lAngle = Math.atan2(ldy, ldx);
        const lDist = Math.min(4.5, Math.hypot(ldx, ldy) * 0.022);
        targetLeftX = Math.cos(lAngle) * lDist;
        targetLeftY = Math.sin(lAngle) * lDist * 0.85;

        // Right Eye Vector (center: 347, 329)
        const rdx = svgX - 347;
        const rdy = svgY - 329;
        const rAngle = Math.atan2(rdy, rdx);
        const rDist = Math.min(4.5, Math.hypot(rdx, rdy) * 0.022);
        targetRightX = Math.cos(rAngle) * rDist;
        targetRightY = Math.sin(rAngle) * rDist * 0.85;

        const isDirect =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        setIsWolfHovered(isDirect);
      } else {
        trackingActive = false;
        setIsTracking(false);
        setIsWolfHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const loop = () => {
      if (trackingActive) {
        // Fast, smooth tracking for the main pupils
        currentLeftX += (targetLeftX - currentLeftX) * 0.12;
        currentLeftY += (targetLeftY - currentLeftY) * 0.12;
        currentRightX += (targetRightX - currentRightX) * 0.12;
        currentRightY += (targetRightY - currentRightY) * 0.12;

        // Slower lagging lerp for the crimson ghost trail
        trailLX += (currentLeftX - trailLX) * 0.055;
        trailLY += (currentLeftY - trailLY) * 0.055;
        trailRX += (currentRightX - trailRX) * 0.055;
        trailRY += (currentRightY - trailRY) * 0.055;

        setLeftPupil({ x: currentLeftX, y: currentLeftY });
        setRightPupil({ x: currentRightX, y: currentRightY });
        setTrailLeft({ x: trailLX, y: trailLY });
        setTrailRight({ x: trailRX, y: trailRY });
      } else {
        // Return smoothly to center rest
        currentLeftX += (0 - currentLeftX) * 0.05;
        currentLeftY += (0 - currentLeftY) * 0.05;
        currentRightX += (0 - currentRightX) * 0.05;
        currentRightY += (0 - currentRightY) * 0.05;
        trailLX += (0 - trailLX) * 0.04;
        trailLY += (0 - trailLY) * 0.04;
        trailRX += (0 - trailRX) * 0.04;
        trailRY += (0 - trailRY) * 0.04;

        setLeftPupil({ x: currentLeftX, y: currentLeftY });
        setRightPupil({ x: currentRightX, y: currentRightY });
        setTrailLeft({ x: trailLX, y: trailLY });
        setTrailRight({ x: trailRX, y: trailRY });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  // Overall reveal factor combining inView and scroll
  const isRevealed = inView || scrollReveal > 0.05;

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-5xl mx-auto pt-8 pb-16 sm:pb-24 px-4 sm:px-6 flex flex-col items-center justify-center select-none"
    >
      <style jsx global>{`
        @keyframes wolfBreatheSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes crimsonEyeBreathe {
          0%, 100% {
            opacity: 0.72;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.24);
          }
        }
        @keyframes eyeFlarePulse {
          0%, 100% {
            opacity: 0.35;
            transform: scaleX(0.85);
          }
          50% {
            opacity: 0.95;
            transform: scaleX(1.35);
          }
        }
        @keyframes lunarAuraSlow {
          0%, 100% {
            opacity: 0.85;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        @keyframes batDriftSlow {
          0%, 100% {
            transform: translate(0px, 0px);
          }
          50% {
            transform: translate(6px, -4px);
          }
        }
        @keyframes emberRise {
          0% {
            transform: translate(0, 0) scale(0.4);
            opacity: 0;
          }
          40% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate(12px, -65px) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes laserBeamSweep {
          0% {
            transform: translateX(-100%);
          }
          50%, 100% {
            transform: translateX(100%);
          }
        }

        .animate-wolf-breathe {
          animation: wolfBreatheSlow 6.5s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .animate-crimson-eye {
          animation: crimsonEyeBreathe 4.2s ease-in-out infinite;
          transform-origin: 300px 330px;
        }
        .animate-eye-flare {
          animation: eyeFlarePulse 3.8s ease-in-out infinite;
          transform-origin: 300px 330px;
        }
        .animate-lunar-aura {
          animation: lunarAuraSlow 8s ease-in-out infinite;
          transform-origin: 300px 135px;
        }
        .animate-bats-drift {
          animation: batDriftSlow 10s ease-in-out infinite;
        }
        .animate-ember-1 {
          animation: emberRise 5s ease-in-out infinite;
        }
        .animate-ember-2 {
          animation: emberRise 6.5s ease-in-out infinite 1.8s;
        }
        .animate-ember-3 {
          animation: emberRise 5.8s ease-in-out infinite 3.2s;
        }

        /* Clean, non-oversaturated platinum metallic sheen with subtle cyan rim */
        .ongrywolf-metallic-title {
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f1f5f9 25%,
            #cbd5e1 55%,
            #94a3b8 80%,
            #64748b 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .laser-sweep-beam {
          animation: laserBeamSweep 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Ambient Nocturnal Blue Aura Backing */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[700px] h-[380px] sm:h-[480px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none -z-10 transition-opacity duration-1000 ${
          isRevealed ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none -z-10 transition-opacity duration-1000 ${
          isRevealed ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Wolf and Moon Artwork Stage (Interactive Wolf Target) */}
      <div
        className={`relative w-full max-w-[340px] sm:max-w-[480px] md:max-w-[560px] mx-auto transform transition-all duration-1000 ease-out pointer-events-auto cursor-crosshair ${
          isRevealed || prefersReducedMotion
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-12 scale-95'
        }`}
      >
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 640"
          className="w-full h-auto drop-shadow-[0_0_60px_rgba(7,9,14,0.95)]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Lunar Aura Glow */}
            <radialGradient id="lunarAuraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#E2E8F0" stopOpacity="0.75" />
              <stop offset="68%" stopColor="#94A3B8" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
            </radialGradient>

            {/* Intense Crimson Eye Bloom Filter */}
            <filter id="crimsonEyeGlowFilter" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Horizontal Eye Flare Filter */}
            <filter id="horizontalFlareFilter" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blurX" />
              <feMerge>
                <feMergeNode in="blurX" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft Moon Halo Filter */}
            <filter id="lunarGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Wolf Fur Shading Gradients */}
            <linearGradient id="wolfFurDarkGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="25%" stopColor="#141D2E" />
              <stop offset="55%" stopColor="#0F1726" />
              <stop offset="85%" stopColor="#0B101B" />
              <stop offset="100%" stopColor="#07090E" />
            </linearGradient>

            {/* Muzzle Ridge Highlight */}
            <linearGradient id="muzzleBridgeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#25334A" />
              <stop offset="50%" stopColor="#172235" />
              <stop offset="100%" stopColor="#0D1320" />
            </linearGradient>

            {/* Dorsal & Ear Rim Moonlight */}
            <linearGradient id="dorsalRimLightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="20%" stopColor="#93C5FD" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#93C5FD" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
            </linearGradient>

            {/* Outer Vignette Soft Radial Fade */}
            <radialGradient id="vignetteSoftFade" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#07090E" stopOpacity="0" />
              <stop offset="90%" stopColor="#07090E" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#07090E" stopOpacity="1" />
            </radialGradient>

            {/* Bottom Seamless Gradient Fade into Footer Base */}
            <linearGradient id="footerMistBlend" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#07090E" stopOpacity="0" />
              <stop offset="45%" stopColor="#07090E" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#07090E" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#07090E" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 1. FULL MOON IN NIGHT SKY */}
          <g className={prefersReducedMotion ? '' : 'animate-lunar-aura'}>
            <circle cx="300" cy="135" r="95" fill="url(#lunarAuraGrad)" />
            <circle
              cx="300"
              cy="135"
              r="58"
              fill="#F8FAFC"
              opacity="0.95"
              filter="url(#lunarGlowFilter)"
            />
            {/* Moon craters and surface textures */}
            <circle cx="278" cy="118" r="14" fill="#CBD5E1" opacity="0.55" />
            <circle cx="318" cy="142" r="20" fill="#CBD5E1" opacity="0.45" />
            <circle cx="292" cy="155" r="11" fill="#94A3B8" opacity="0.5" />
            <circle cx="328" cy="115" r="7" fill="#94A3B8" opacity="0.4" />

            {/* Silhouetted Bats Flying Across Moon */}
            <g className={prefersReducedMotion ? '' : 'animate-bats-drift'}>
              <path
                d="M 318,102 Q 325,95 334,101 Q 340,95 348,102 Q 340,105 334,103 Q 325,105 318,102 Z"
                fill="#07090E"
                opacity="0.9"
              />
              <path
                d="M 268,124 Q 275,117 283,123 Q 289,117 296,124 Q 289,127 283,125 Q 275,127 268,124 Z"
                fill="#07090E"
                opacity="0.85"
              />
              <path
                d="M 332,138 Q 337,133 343,137 Q 348,133 353,138 Q 348,141 343,140 Q 337,141 332,138 Z"
                fill="#07090E"
                opacity="0.8"
              />
              <path
                d="M 342,168 Q 346,164 351,167 Q 355,164 360,168 Q 355,170 351,169 Q 346,170 342,168 Z"
                fill="#07090E"
                opacity="0.65"
              />
            </g>
          </g>

          {/* Drifting Embers Particles across Moonlit Sky */}
          <g opacity="0.75">
            <circle cx="270" cy="150" r="1.6" fill="#38BDF8" className="animate-ember-1" />
            <circle cx="330" cy="170" r="1.4" fill="#60A5FA" className="animate-ember-2" />
            <circle cx="300" cy="190" r="1.8" fill="#FFFFFF" className="animate-ember-3" />
            <circle cx="285" cy="220" r="1.2" fill="#38BDF8" className="animate-ember-1" />
            <circle cx="315" cy="210" r="1.5" fill="#93C5FD" className="animate-ember-2" />
          </g>

          {/* 2. SILHOUETTE TREE BRANCHES FRAMING THE NOCTURNAL SCENE */}
          <g opacity="0.85">
            <path
              d="M 560,0 C 545,35 538,75 542,120 C 545,150 530,175 505,200 C 490,215 470,225 445,230 L 447,234 C 475,228 495,218 515,202 C 540,180 558,145 556,105 C 554,65 568,25 580,0 Z"
              fill="#07090E"
            />
            <path
              d="M 525,168 C 495,160 475,172 458,178 L 460,181 C 475,175 495,164 525,171 Z"
              fill="#07090E"
            />
            <path
              d="M 40,0 C 52,45 58,85 48,135 C 40,170 18,205 0,230 L 0,235 C 22,210 44,175 54,135 C 64,85 58,40 45,0 Z"
              fill="#07090E"
            />
          </g>

          {/* 3. REALISTIC ANATOMICAL WOLF HEAD WITH SLOW BREATHING ANIMATION */}
          <g id="realisticWolfHead" className={prefersReducedMotion ? '' : 'animate-wolf-breathe'}>
            {/* Outer Ear Shells */}
            <path
              d="M 225,235 C 215,210 190,140 178,110 C 174,100 184,95 192,102 C 210,120 240,175 258,212 Z"
              fill="#0B101B"
            />
            <path
              d="M 375,235 C 385,210 410,140 422,110 C 426,100 416,95 408,102 C 390,120 360,175 342,212 Z"
              fill="#0B101B"
            />

            {/* Inner Ear Cavity & Thick Fur Tufts */}
            <path
              d="M 220,225 C 210,195 192,145 186,118 C 195,130 220,175 236,210 Z"
              fill="#172235"
            />
            <path
              d="M 215,190 L 230,196 L 218,204 L 235,212 L 222,218"
              stroke="#25334A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            <path
              d="M 380,225 C 390,195 408,145 414,118 C 405,130 380,175 364,210 Z"
              fill="#172235"
            />
            <path
              d="M 385,190 L 370,196 L 382,204 L 365,212 L 378,218"
              stroke="#25334A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Main Wolf Skull & Wide Cheek Ruffs */}
            <path
              d="M 300,220 C 275,220 245,218 226,232 C 210,244 195,268 185,295 C 175,320 152,342 140,372 C 134,386 142,398 155,395 C 142,408 135,425 142,438 C 148,448 162,446 172,440 C 158,458 152,482 165,502 C 178,522 208,546 240,572 C 265,592 288,604 300,604 C 312,604 335,592 360,572 C 392,546 422,522 435,502 C 448,482 442,458 428,440 C 438,446 452,448 458,438 C 465,425 458,408 445,395 C 458,398 466,386 460,372 C 448,342 425,320 415,295 C 405,268 390,244 374,232 C 355,218 325,220 300,220 Z"
              fill="url(#wolfFurDarkGradient)"
              stroke="url(#dorsalRimLightGrad)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Forehead Furrow & Fur Textures */}
            <path
              d="M 285,232 C 290,240 300,242 300,242 C 300,242 310,240 315,232"
              stroke="#25334A"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 275,250 C 285,260 300,262 300,262 C 300,262 315,260 325,250"
              stroke="#1E293B"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 268,268 C 282,280 300,284 300,284 C 300,284 318,280 332,268"
              stroke="#1A2536"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Supraorbital Eyebrow Arches */}
            <path
              d="M 242,298 C 260,308 280,314 290,316"
              stroke="#0B101B"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 242,298 C 260,308 280,314 290,316"
              stroke="#25334A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            <path
              d="M 358,298 C 340,308 320,314 310,316"
              stroke="#0B101B"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 358,298 C 340,308 320,314 310,316"
              stroke="#25334A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Vertical Forehead Scowl Stop */}
            <path
              d="M 295,286 L 297,314 M 305,286 L 303,314"
              stroke="#0B101B"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Broad Canid Nasal Bridge & Snout */}
            <path
              d="M 276,328 L 264,432 C 264,458 282,476 300,476 C 318,476 336,458 336,432 L 324,328 C 314,332 300,334 300,334 C 300,334 286,332 276,328 Z"
              fill="url(#muzzleBridgeGrad)"
              stroke="#172235"
              strokeWidth="1.8"
            />

            {/* Muzzle Center Dorsal Ridge Highlight */}
            <path
              d="M 300,334 L 300,428"
              stroke="#334668"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Realistic Wolf Nose Pad (Rhinarium) */}
            <path
              d="M 278,434 C 284,428 292,425 300,425 C 308,425 316,428 322,434 C 328,442 322,456 300,458 C 278,456 272,442 278,434 Z"
              fill="#04060A"
              stroke="#1E293B"
              strokeWidth="1.4"
            />
            {/* Nostrils */}
            <path
              d="M 285,441 C 288,437 294,440 293,445 C 291,448 286,447 285,441 Z"
              fill="#000000"
            />
            <path
              d="M 315,441 C 312,437 306,440 307,445 C 309,448 314,447 315,441 Z"
              fill="#000000"
            />
            {/* Philtrum Groove */}
            <line
              x1="300"
              y1="446"
              x2="300"
              y2="458"
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Wolf Upper Lip & Philtrum */}
            <path
              d="M 300,458 L 300,472 M 276,467 C 288,473 300,473 300,473 C 300,473 312,473 324,467"
              stroke="#04060A"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
            />

            {/* Whisker Follicle Dots */}
            <circle cx="282" cy="452" r="1.2" fill="#141E30" />
            <circle cx="276" cy="456" r="1.2" fill="#141E30" />
            <circle cx="284" cy="460" r="1.2" fill="#141E30" />
            <circle cx="274" cy="463" r="1.2" fill="#141E30" />

            <circle cx="318" cy="452" r="1.2" fill="#141E30" />
            <circle cx="324" cy="456" r="1.2" fill="#141E30" />
            <circle cx="316" cy="460" r="1.2" fill="#141E30" />
            <circle cx="326" cy="463" r="1.2" fill="#141E30" />

            {/* Lower Chin Contour */}
            <path
              d="M 286,478 C 293,485 300,486 300,486 C 300,486 307,485 314,478"
              stroke="#121A2A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Cheek Ruffs Fur Strands */}
            <path
              d="M 188,382 L 155,395 L 182,410"
              stroke="#1F2C42"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M 194,420 L 160,438 L 192,450"
              stroke="#1F2C42"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M 412,382 L 445,395 L 418,410"
              stroke="#1F2C42"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M 406,420 L 440,438 L 408,450"
              stroke="#1F2C42"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />

            {/* Throat & Cervical Mane Fur Highlights */}
            <path
              d="M 270,510 L 300,535 L 330,510"
              stroke="#1B263B"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 255,540 L 300,570 L 345,540"
              stroke="#172235"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* 4. PIERCING GLOWING CRIMSON EYES WITH INTERACTIVE MOUSE TRACKING */}
            <g className={prefersReducedMotion ? '' : 'animate-eye-flare'} opacity="0.85">
              <line
                x1="210"
                y1="330"
                x2="295"
                y2="330"
                stroke="#FF1E38"
                strokeWidth="1.6"
                strokeLinecap="round"
                filter="url(#horizontalFlareFilter)"
              />
              <line
                x1="305"
                y1="330"
                x2="390"
                y2="330"
                stroke="#FF1E38"
                strokeWidth="1.6"
                strokeLinecap="round"
                filter="url(#horizontalFlareFilter)"
              />
            </g>

            <g className={prefersReducedMotion ? '' : 'animate-crimson-eye'}>
              <ellipse
                cx="254"
                cy="330"
                rx="24"
                ry="17"
                fill="rgba(255, 30, 60, 0.8)"
                filter="url(#crimsonEyeGlowFilter)"
              />
              <ellipse
                cx="346"
                cy="330"
                rx="24"
                ry="17"
                fill="rgba(255, 30, 60, 0.8)"
                filter="url(#crimsonEyeGlowFilter)"
              />
            </g>

            {/* Left Eye Canthal Eyeliner Rim */}
            <path
              d="M 234,328 C 242,320 262,322 272,332 C 262,338 242,338 234,328 Z"
              fill="#04060A"
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Left Eye Crimson Iris */}
            <path
              d="M 238,328 C 244,322 260,323 268,331 C 260,336 244,336 238,328 Z"
              fill="#FF1E38"
              stroke="#FF3856"
              strokeWidth="1.2"
            />
            {/* Left Eye Lagging Crimson Motion Trail (The Menacing Red Trail) */}
            <ellipse
              cx={253 + trailLeft.x}
              cy={329 + trailLeft.y}
              rx="3.2"
              ry="4.8"
              fill="#FF1E38"
              opacity={isTracking ? "0.65" : "0.2"}
              filter="url(#crimsonEyeGlowFilter)"
            />
            {/* Left Eye Outer Ethereal Gaze Flame Streak */}
            <path
              d={`M 235,327 Q ${230 - leftPupil.x * 2},${326 - leftPupil.y * 2} ${220 - leftPupil.x * 3},${324 - leftPupil.y * 3}`}
              fill="none"
              stroke="#FF2A48"
              strokeWidth={isWolfHovered ? "2.5" : "1.8"}
              strokeLinecap="round"
              opacity={isTracking ? "0.8" : "0.35"}
              filter="url(#crimsonEyeGlowFilter)"
            />

            {/* Left Eye Dark Pupil with Clean Real-Time Stare */}
            <ellipse
              cx={253 + leftPupil.x}
              cy={329 + leftPupil.y}
              rx={isWolfHovered ? 1.7 : 2.5}
              ry={isWolfHovered ? 5.2 : 4.5}
              fill="#120103"
            />
            {/* Left Eye Specular Reflection Core */}
            <circle
              cx={254.5 + leftPupil.x * 0.7}
              cy={327.8 + leftPupil.y * 0.7}
              r={isWolfHovered ? 1.1 : 1.6}
              fill="#FFFFFF"
            />
            <circle
              cx={256 + leftPupil.x * 0.7}
              cy={329 + leftPupil.y * 0.7}
              r={0.7}
              fill="#FFE2E6"
            />

            {/* Right Eye Canthal Eyeliner Rim */}
            <path
              d="M 366,328 C 358,320 338,322 328,332 C 338,338 358,338 366,328 Z"
              fill="#04060A"
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Right Eye Crimson Iris */}
            <path
              d="M 362,328 C 356,322 340,323 332,331 C 340,336 356,336 362,328 Z"
              fill="#FF1E38"
              stroke="#FF3856"
              strokeWidth="1.2"
            />

            {/* Right Eye Lagging Crimson Motion Trail (The Menacing Red Trail) */}
            <ellipse
              cx={347 + trailRight.x}
              cy={329 + trailRight.y}
              rx="3.2"
              ry="4.8"
              fill="#FF1E38"
              opacity={isTracking ? "0.65" : "0.2"}
              filter="url(#crimsonEyeGlowFilter)"
            />
            {/* Right Eye Outer Ethereal Gaze Flame Streak */}
            <path
              d={`M 365,327 Q ${370 - rightPupil.x * 2},${326 - rightPupil.y * 2} ${380 - rightPupil.x * 3},${324 - rightPupil.y * 3}`}
              fill="none"
              stroke="#FF2A48"
              strokeWidth={isWolfHovered ? "2.5" : "1.8"}
              strokeLinecap="round"
              opacity={isTracking ? "0.8" : "0.35"}
              filter="url(#crimsonEyeGlowFilter)"
            />

            {/* Right Eye Dark Pupil with Clean Real-Time Stare */}
            <ellipse
              cx={347 + rightPupil.x}
              cy={329 + rightPupil.y}
              rx={isWolfHovered ? 1.7 : 2.5}
              ry={isWolfHovered ? 5.2 : 4.5}
              fill="#120103"
            />
            {/* Right Eye Specular Reflection Core */}
            <circle
              cx={345.5 + rightPupil.x * 0.7}
              cy={327.8 + rightPupil.y * 0.7}
              r={isWolfHovered ? 1.1 : 1.6}
              fill="#FFFFFF"
            />
            <circle
              cx={344 + rightPupil.x * 0.7}
              cy={329 + rightPupil.y * 0.7}
              r={0.7}
              fill="#FFE2E6"
            />
          </g>

          {/* 5. Seamless Multi-Stop Mist Blend into Footer Base */}
          <rect x="0" y="470" width="600" height="170" fill="url(#footerMistBlend)" />
          {/* Subtle Outer Edge Vignette */}
          <rect x="0" y="0" width="600" height="640" fill="url(#vignetteSoftFade)" pointerEvents="none" />
        </svg>
      </div>

      {/* Cinematic Brand Typography: ONGRYWOLF (Clean, stable, non-interactive, perfectly unclipped) */}
      <div
        className={`relative z-10 -mt-6 sm:-mt-10 text-center space-y-4 transform transition-all duration-700 ease-out delay-300 pointer-events-none select-none w-full px-4 sm:px-6 ${
          isRevealed || prefersReducedMotion
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative inline-block max-w-full">
          {/* Main ONGRYWOLF Headline with Crazy Font (Orbitron/Cinzel) & Platinum Sheen */}
          <h2 className="font-crazy-wolf text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black ongrywolf-metallic-title drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] filter tracking-[0.14em] pl-[0.14em]">
            ONGRYWOLF
          </h2>
        </div>

        {/* Animated Laser Divider Beam */}
        <div className="w-64 sm:w-80 md:w-96 mx-auto h-0.5 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-300 to-transparent laser-sweep-beam" />
        </div>

        <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-slate-400">
          <span className="w-6 sm:w-10 h-px bg-gradient-to-r from-transparent to-brand-500/60" />
          <span className="text-glow">Built for worlds beyond ordinary</span>
          <span className="w-6 sm:w-10 h-px bg-gradient-to-l from-transparent to-brand-500/60" />
        </div>
      </div>
    </div>
  );
}
