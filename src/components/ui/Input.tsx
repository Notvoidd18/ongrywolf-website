import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={twMerge(
          clsx(
            'w-full bg-surface-subtle border border-surface-border rounded-md px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors',
            'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
            error && 'border-rose-600 focus:border-rose-500 focus:ring-rose-500',
            className
          )
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={twMerge(
          clsx(
            'w-full bg-surface-subtle border border-surface-border rounded-md px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors resize-y min-h-[90px]',
            'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
            error && 'border-rose-600 focus:border-rose-500 focus:ring-rose-500',
            className
          )
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
