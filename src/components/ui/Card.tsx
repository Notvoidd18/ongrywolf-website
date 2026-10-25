import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-2xl bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1d]/95 to-[#060812]/95 border border-white/[0.08] p-6 sm:p-7 transition-all duration-300 shadow-xl backdrop-blur-xl',
          hoverEffect &&
            'hover:border-brand-500/50 hover:shadow-[0_15px_35px_-10px_rgba(37,99,235,0.25)] hover:-translate-y-1',
          className
        )
      )}
      {...props}
    >
      {/* Subtle top edge gradient highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('flex flex-col space-y-1.5 pb-4', className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        clsx('text-base font-bold tracking-tight text-white flex items-center gap-2', className)
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={twMerge(clsx('text-xs text-slate-400 leading-relaxed font-normal', className))}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('pt-0', className))} {...props}>
      {children}
    </div>
  );
}
