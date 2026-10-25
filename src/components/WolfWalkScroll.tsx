'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

// Inverse Kinematics for front leg (Shoulder -> Elbow -> Wrist -> Paw)
function solveForeleg(
  sx: number,
  sy: number,
  px: number,
  py: number,
  L1 = 19,
  L2 = 20
) {
  const wx = px;
  const wy = py - 4;
  const dx = wx - sx;
  const dy = wy - sy;
  const d = Math.min(
    (L1 + L2) * 0.999,
    Math.max(Math.abs(L1 - L2) * 1.001, Math.hypot(dx, dy))
  );
  const base = Math.atan2(dy, dx);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const elbowAngle = base + alpha; // Elbow bends backwards (posterior)
  const ex = sx + L1 * Math.cos(elbowAngle);
  const ey = sy + L1 * Math.sin(elbowAngle);
  return {
    shoulder: { x: sx, y: sy },
    elbow: { x: ex, y: ey },
    wrist: { x: wx, y: wy },
    paw: { x: px, y: py },
  };
}

// Inverse Kinematics for hind leg (Hip -> Knee/Stifle -> Hock -> Paw)
function solveHindleg(
  hx: number,
  hy: number,
  px: number,
  py: number,
  L1 = 20,
  L2 = 20
) {
  const ax = px - 3;
  const ay = py - 9;
  const dx = ax - hx;
  const dy = ay - hy;
  const d = Math.min(
    (L1 + L2) * 0.999,
    Math.max(Math.abs(L1 - L2) * 1.001, Math.hypot(dx, dy))
  );
  const base = Math.atan2(dy, dx);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const kneeAngle = base - alpha; // Stifle/knee bends forward (anterior)
  const kx = hx + L1 * Math.cos(kneeAngle);
  const ky = hy + L1 * Math.sin(kneeAngle);
  return {
    hip: { x: hx, y: hy },
    knee: { x: kx, y: ky },
    hock: { x: ax, y: ay },
    paw: { x: px, y: py },
  };
}

// Stance (60%) and Swing (40%) trajectory generator for quadruped walk
function getPawPos(t: number, baseXPaw: number, S = 34, lift = 8.5) {
  const normT = ((t % 1) + 1) % 1;
  let relX: number;
  let relY: number;
  if (normT < 0.6) {
    // Stance phase: paw is planted, traveling rearward relative to hip/shoulder
    const u = normT / 0.6;
    relX = (S / 2) * (1 - 2 * u);
    relY = 0;
  } else {
    // Swing phase: paw lifts in a smooth arc to step forward
    const s = (normT - 0.6) / 0.4;
    const smoothS = s * s * (3 - 2 * s);
    relX = -S / 2 + S * smoothS;
    relY = -Math.sin(Math.PI * s) * lift;
  }
  return { x: baseXPaw + relX, y: 88 + relY };
}

export function WolfWalkScroll() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const scrollStateRef = useRef({
    currentScroll: 0,
    targetScroll: 0,
    progress: 0,
    lastDrawnScroll: -9999,
  });

  // Handle prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Subscribe to Lenis smooth scroll updates
  useLenis((lenis) => {
    if (prefersReducedMotion) return;
    scrollStateRef.current.targetScroll = lenis.scroll;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    scrollStateRef.current.progress = Math.min(
      1,
      Math.max(0, lenis.scroll / maxScroll)
    );
  });

  // Animation and Canvas rendering engine
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    const height = 96;

    const updateDimensions = () => {
      width = window.innerWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      scrollStateRef.current.lastDrawnScroll = -9999; // force redraw
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Fallback standard scroll listener if Lenis is idle or not yet engaged
    const onNativeScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      scrollStateRef.current.targetScroll = scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollStateRef.current.progress = Math.min(
        1,
        Math.max(0, scrollY / maxScroll)
      );
    };
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    // Drawing routine
    const drawWolf = (
      c: CanvasRenderingContext2D,
      originX: number,
      originY: number,
      phase: number,
      scale: number
    ) => {
      c.save();
      c.translate(originX, originY);
      c.scale(scale, scale);

      // Symmetrical 4-beat lateral walk gait offsets
      const pLH = getPawPos(phase + 0.0, 54);
      const pLF = getPawPos(phase + 0.25, 114);
      const pRH = getPawPos(phase + 0.5, 54);
      const pRF = getPawPos(phase + 0.75, 114);

      // Spine and head dynamic bobbing
      const bobY = Math.sin(phase * Math.PI * 4) * 1.8;
      const tailSway = Math.sin(phase * Math.PI * 2) * 4;

      const foreNear = solveForeleg(114, 48 + bobY, pLF.x, pLF.y);
      const foreFar = solveForeleg(114, 48 + bobY, pRF.x, pRF.y);
      const hindNear = solveHindleg(54, 46 + bobY, pLH.x, pLH.y);
      const hindFar = solveHindleg(54, 46 + bobY, pRH.x, pRH.y);

      // 1. Subtle ground contact shadow
      const shadowGrad = c.createRadialGradient(85, 90, 2, 85, 90, 55);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      shadowGrad.addColorStop(0.6, 'rgba(2, 6, 23, 0.3)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = shadowGrad;
      c.beginPath();
      c.ellipse(85, 90, 55, 4, 0, 0, Math.PI * 2);
      c.fill();

      // Hindleg path renderer
      const renderHindLeg = (
        leg: ReturnType<typeof solveHindleg>,
        strokeColor: string,
        pawColor: string,
        strokeWidth: number
      ) => {
        c.strokeStyle = strokeColor;
        c.lineWidth = strokeWidth;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.beginPath();
        c.moveTo(leg.hip.x, leg.hip.y);
        c.quadraticCurveTo(leg.knee.x - 3, leg.knee.y, leg.knee.x, leg.knee.y);
        c.lineTo(leg.hock.x, leg.hock.y);
        c.lineTo(leg.paw.x, leg.paw.y);
        c.stroke();

        c.fillStyle = pawColor;
        c.beginPath();
        c.ellipse(leg.paw.x + 1, leg.paw.y, 4.5, 2, 0, 0, Math.PI * 2);
        c.fill();
      };

      // Foreleg path renderer
      const renderForeLeg = (
        leg: ReturnType<typeof solveForeleg>,
        strokeColor: string,
        pawColor: string,
        strokeWidth: number
      ) => {
        c.strokeStyle = strokeColor;
        c.lineWidth = strokeWidth;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.beginPath();
        c.moveTo(leg.shoulder.x, leg.shoulder.y);
        c.lineTo(leg.elbow.x, leg.elbow.y);
        c.lineTo(leg.wrist.x, leg.wrist.y);
        c.lineTo(leg.paw.x, leg.paw.y);
        c.stroke();

        c.fillStyle = pawColor;
        c.beginPath();
        c.ellipse(leg.paw.x + 1, leg.paw.y, 4, 2, 0, 0, Math.PI * 2);
        c.fill();
      };

      // 2. Far legs (Shaded darker behind torso for 3D depth)
      renderHindLeg(hindFar, '#0B111D', '#090E17', 6.5);
      renderForeLeg(foreFar, '#0B111D', '#090E17', 6.0);

      // 3. Far ear
      c.fillStyle = '#0C1322';
      c.beginPath();
      c.moveTo(136, 19 + bobY);
      c.lineTo(139, 7 + bobY);
      c.lineTo(143, 17 + bobY);
      c.closePath();
      c.fill();

      // 4. Tail & Body Torso
      c.save();
      c.translate(0, bobY);

      // Bushy tail with fluid sway
      const bodyGrad = c.createLinearGradient(30, 20, 170, 70);
      bodyGrad.addColorStop(0, '#1E293B');
      bodyGrad.addColorStop(0.55, '#131C31');
      bodyGrad.addColorStop(1, '#0F1626');

      c.fillStyle = bodyGrad;
      c.strokeStyle = '#1E293B';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(38, 43);
      c.quadraticCurveTo(26 + tailSway * 0.5, 54, 23 + tailSway, 66);
      c.quadraticCurveTo(25 + tailSway, 76, 27 + tailSway, 78);
      c.quadraticCurveTo(32 + tailSway * 0.8, 68, 35 + tailSway * 0.4, 54);
      c.closePath();
      c.fill();
      c.stroke();

      // Torso, neck, withers, mane, and wolf skull
      c.beginPath();
      c.moveTo(38, 43); // Croup / tail base
      c.quadraticCurveTo(48, 39, 60, 41);
      c.quadraticCurveTo(78, 43, 95, 41);
      c.quadraticCurveTo(108, 39, 116, 38); // Withers
      c.quadraticCurveTo(128, 27, 140, 20); // Mane crest
      c.lineTo(143, 6); // Pointed near ear tip
      c.lineTo(148, 16);
      c.quadraticCurveTo(154, 20, 166, 25); // Sloping brow
      c.quadraticCurveTo(171, 26.5, 170, 28); // Snout & nose
      c.quadraticCurveTo(166, 29.5, 158, 31);
      c.quadraticCurveTo(152, 33, 146, 38); // Jaw & throat ruff
      c.lineTo(142, 37);
      c.quadraticCurveTo(138, 44, 130, 48); // Mane ruff tuft
      c.lineTo(128, 47);
      c.quadraticCurveTo(120, 53, 112, 55); // Deep ribcage brisket
      c.quadraticCurveTo(98, 56, 82, 52); // Tucked abdomen
      c.quadraticCurveTo(64, 50, 50, 47); // Flank into croup
      c.closePath();
      c.fill();

      // Subtle cyan/electric-blue dorsal rim lighting
      const rimGrad = c.createLinearGradient(38, 6, 170, 28);
      rimGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.55)');
      rimGrad.addColorStop(0.7, 'rgba(96, 165, 250, 0.3)');
      rimGrad.addColorStop(1, 'rgba(56, 189, 248, 0.7)');
      c.strokeStyle = rimGrad;
      c.lineWidth = 1.2;
      c.lineJoin = 'round';
      c.stroke();

      // Near Ear Inner Specular Highlight
      c.fillStyle = '#22324C';
      c.beginPath();
      c.moveTo(144, 14);
      c.lineTo(145, 9);
      c.lineTo(147, 15);
      c.closePath();
      c.fill();

      // Muzzle / Whisker Accent
      c.strokeStyle = '#334155';
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(162, 28);
      c.quadraticCurveTo(166, 28.5, 169, 28);
      c.stroke();

      // Nose Pad
      c.fillStyle = '#0F172A';
      c.beginPath();
      c.arc(169.5, 27.2, 0.8, 0, Math.PI * 2);
      c.fill();

      // Signature Glowing Ice-Cyan Wolf Eye (Ongrywolf Accent)
      c.fillStyle = 'rgba(56, 189, 248, 0.45)';
      c.beginPath();
      c.arc(154, 22, 2.5, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#38BDF8';
      c.beginPath();
      c.arc(154, 22, 1.2, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.arc(154.3, 21.7, 0.5, 0, Math.PI * 2);
      c.fill();

      c.restore();

      // 5. Near Hindleg (Foreground tone)
      renderHindLeg(hindNear, '#1E293B', '#2E3F5B', 6.5);

      // 6. Near Foreleg (Foreground tone)
      renderForeLeg(foreNear, '#22324C', '#2E3F5B', 6.0);

      c.restore();
    };

    // Render loop synced with requestAnimationFrame
    const loop = () => {
      const state = scrollStateRef.current;
      // Smooth interpolation for silky responsiveness
      state.currentScroll += (state.targetScroll - state.currentScroll) * 0.18;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isMobile = width < 640;
      const wolfScale = isMobile ? 0.72 : 0.88;
      const wolfWidth = 175 * wolfScale;

      const minX = isMobile ? 12 : 24;
      const maxX = width - wolfWidth - minX;
      const wolfX = minX + state.progress * Math.max(0, maxX - minX);

      const stridePx = 64;
      const phase = (state.currentScroll / stridePx) % 1.0;

      // Redraw canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Ground alignment: bottom of paws rests cleanly near bottom
      const yOffset = isMobile ? 14 : 6;
      drawWolf(ctx, wolfX, yOffset, phase, wolfScale);

      ctx.restore();
      state.lastDrawnScroll = state.currentScroll;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', onNativeScroll);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-30 select-none overflow-hidden h-20 sm:h-24"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
