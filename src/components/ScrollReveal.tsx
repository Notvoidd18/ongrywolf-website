'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  durationMs?: number;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  durationMs = 750,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(28px) scale(0.985)';
      case 'down':
        return 'translateY(-28px) scale(0.985)';
      case 'left':
        return 'translateX(28px) scale(0.985)';
      case 'right':
        return 'translateX(-28px) scale(0.985)';
      case 'none':
      default:
        return 'scale(0.985)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0, 0) scale(1)' : getInitialTransform(),
        filter: isVisible ? 'blur(0px)' : 'blur(4px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth physical deceleration curve
        transitionDelay: `${delayMs}ms`,
        willChange: 'opacity, transform, filter',
      }}
    >
      {children}
    </div>
  );
}
