import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(
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
    return NextResponse.json({ error: 'Forbidden: You do not have permission to view logs for this bot' }, { status: 403 });
  }

  try {
    const logs = await db.getHostedBotLogs(id);
    return NextResponse.json({ success: true, botId: id, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
