import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PasskeyLoginForm from '@/components/PasskeyLoginForm';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await getCurrentSession();
  if (session) {
    if (session.isOwner) {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  const { error } = await searchParams;

  return (
    <div className="py-20 max-w-md mx-auto px-4 sm:px-6 w-full space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Home
      </Link>

      <Card className="p-8 space-y-6 text-center border-surface-border bg-surface">
        <div className="w-12 h-12 rounded bg-brand-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-sm">
          O
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign in to Ongrywolf
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authenticate with your Discord account to manage your bots, feature configurations, and administrative tools.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-rose-950/90 border border-rose-800 text-rose-200 text-xs text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-rose-100">Notice</div>
              <div className="text-[11px] leading-relaxed break-words">{decodeURIComponent(error)}</div>
            </div>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <a
            href="/api/auth/discord"
            className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Continue with Discord</span>
          </a>

          <PasskeyLoginForm />
        </div>
      </Card>
    </div>
  );
}
