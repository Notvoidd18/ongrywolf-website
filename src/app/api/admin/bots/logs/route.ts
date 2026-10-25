import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get('id');

  if (!botId) {
    return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
  }

  try {
    const logs = await db.getHostedBotLogs(botId);
    return NextResponse.json({ success: true, botId, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
