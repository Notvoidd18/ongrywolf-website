import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const { userId, action } = await req.json();

    if (action === 'extend') {
      await db.extendTrial(userId, admin.discordUsername);
      return NextResponse.json({ success: true, message: '7-day trial granted/extended' });
    } else if (action === 'revoke') {
      await db.revokeTrial(userId, admin.discordUsername);
      return NextResponse.json({ success: true, message: 'Trial revoked' });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
