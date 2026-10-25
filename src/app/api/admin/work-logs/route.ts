import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const logs = await db.getWorkLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { guildId, channelId, userId, username, description } = body;

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const log = await db.addWorkLog({
      guildId: guildId?.trim() || 'Ongrywolf HQ',
      channelId: channelId?.trim() || 'staff-work-logs',
      userId: userId?.trim() || admin.discordId,
      username: username?.trim() || admin.discordUsername,
      description: description.trim(),
    });

    await db.logAudit({
      adminId: admin.discordId,
      adminUsername: admin.discordUsername,
      action: 'WORK_LOG_CREATED',
      targetType: 'SYSTEM',
      targetId: log.id,
      details: { description: log.description, username: log.username },
    });

    return NextResponse.json({ success: true, log });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    const success = await db.deleteWorkLog(id, admin.discordUsername);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
