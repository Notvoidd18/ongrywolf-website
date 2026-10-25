import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  const users = await db.getUsers();
  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const { userId, toggleStatus } = await req.json();

    if (toggleStatus) {
      await db.toggleUserSuspension(userId, admin.discordUsername);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
