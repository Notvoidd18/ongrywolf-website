import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const bot = await db.getHostedBotById(id);

  if (!bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  // Ownership Check
  if (!session.isOwner && bot.ownerAccount !== session.discordUsername && bot.ownerAccount !== session.discordId) {
    return NextResponse.json({ error: 'Forbidden: You do not have permission to manage this bot' }, { status: 403 });
  }

  // Trial Expiry Check
  if (!session.isOwner) {
    const trial = await db.getTrialByUserId(session.discordId);
    if (trial && (trial.status === 'revoked' || new Date(trial.expiresAt).getTime() < Date.now())) {
      return NextResponse.json(
        { error: 'Cannot restart bot: Your 7-day evaluation trial has expired. Contact @notvoid18 to extend.' },
        { status: 403 }
      );
    }
  }

  const success = await db.restartHostedBot(id, session.discordUsername);
  return NextResponse.json({ success, message: `Bot "${bot.name}" restarted.` });
}
