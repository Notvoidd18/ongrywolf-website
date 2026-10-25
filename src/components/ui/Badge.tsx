import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'neutral' | 'emerald' | 'amber' | 'rose';
}

export function Badge({ className, variant = 'blue', children, ...props }: BadgeProps) {
  const variants = {
    blue: 'bg-brand-950/80 text-brand-300 border-brand-800/80',
    neutral: 'bg-surface-elevated text-slate-300 border-surface-border',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-800/70',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border tracking-wide uppercase',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
