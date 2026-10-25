import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Safe client fields only — never return tokens or internal secrets
  return NextResponse.json({
    authenticated: true,
    user: {
      discordId: session.discordId,
      username: session.discordUsername,
      globalName: session.globalName,
      avatarUrl: session.avatarUrl,
      isOwner: session.isOwner,
      role: session.role,
    },
  });
}
