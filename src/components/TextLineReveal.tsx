'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TextLineRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p' | 'div';
  delayMs?: number;
  durationMs?: number;
  distance?: number;
}

/**
 * TextLineReveal — Slow, ultra-smooth, clean line-up scroll animation.
 * Softly reveals text with an elegant upward glide, silky physical deceleration curve,
 * and delicate optical deblur for a luxurious editorial aesthetic.
 */
export function TextLineReveal({
  children,
  className = '',
  as: Component = 'h2',
  delayMs = 0,
  durationMs = 1150,
  distance = 32,
}: TextLineRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window === 'undefined') return;

    // Accessibility: immediate reveal for reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="overflow-hidden py-1 w-full">
      <Component
        className={`${className} will-change-transform`}
        style={{
          transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
          opacity: isVisible ? 1 : 0,
          filter: isVisible ? 'blur(0px)' : 'blur(6px)',
          transition: `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, filter ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        }}
      >
        {children}
      </Component>
    </div>
  );
}
