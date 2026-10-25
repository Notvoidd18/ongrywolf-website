import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#06090F] disabled:opacity-50 disabled:pointer-events-none rounded-md select-none';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-500 text-white shadow-blue-sm border border-brand-500/40 focus:ring-brand-500 active:scale-[0.98]',
    secondary:
      'bg-surface-elevated hover:bg-[#1A263E] text-slate-200 border border-surface-border hover:border-brand-500/50 focus:ring-brand-500 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-surface-subtle text-slate-300 hover:text-white border border-surface-border hover:border-brand-400 focus:ring-brand-500',
    ghost:
      'bg-transparent hover:bg-surface-subtle text-slate-300 hover:text-white focus:ring-brand-500',
    danger:
      'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 focus:ring-rose-500 active:scale-[0.98]',
  };

  return (
    <button
      className={twMerge(clsx(base, sizes[size], variants[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
