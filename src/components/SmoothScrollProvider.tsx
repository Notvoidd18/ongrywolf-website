'use client';

import React, { useEffect, useState } from 'react';
import { ReactLenis } from 'lenis/react';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.35, // Perfectly balanced silky glide
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve (Apple/Awwwards physics)
        smoothWheel: true,
        wheelMultiplier: 0.95, // Immediate, natural response per notch
        touchMultiplier: 1.25,
        infinite: false,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
