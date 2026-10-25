import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { isRequestSecure } from '@/lib/discord';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

function getValidPasskeys(): string[] {
  const keys: string[] = [];
  if (process.env.ADMIN_ACCESS_KEY?.trim()) {
    keys.push(process.env.ADMIN_ACCESS_KEY.trim());
  }
  if (process.env.OWNER_PASSKEY?.trim()) {
    keys.push(process.env.OWNER_PASSKEY.trim());
  }
  return keys;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const providedKey = (body?.passkey || '').trim();

    if (!providedKey) {
      return NextResponse.json({ error: 'Please enter your passkey.' }, { status: 400 });
    }

    const validKeys = getValidPasskeys();
    if (validKeys.length === 0) {
      return NextResponse.json(
        { error: 'ADMIN_ACCESS_KEY is not configured in server environment variables.' },
        { status: 503 }
      );
    }

    const isValid = validKeys.some((k) => {
      if (k.length !== providedKey.length) return false;
      try {
        return crypto.timingSafeEqual(Buffer.from(k), Buffer.from(providedKey));
      } catch {
        return false;
      }
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid passkey.' },
        { status: 401 }
      );
    }

    const adminUsername = (process.env.ADMIN_ACCOUNT || 'notvoid18').trim().toLowerCase();
    const adminId = process.env.ADMIN_USER_ID || '1563076245850296361';

    // 1. Create authenticated OWNER session
    const { signedCookieValue } = createSession({
      discordId: adminId,
      discordUsername: adminUsername,
      globalName: `Studio Owner (${adminUsername})`,
      avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
      isOwner: true,
      role: 'OWNER',
    });

    // 2. Ensure owner exists in database store
    await db.upsertDiscordUser({
      id: adminId,
      discordId: adminId,
      username: adminUsername,
      avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
      role: 'OWNER',
      status: 'active',
    });

    // 3. Audit log passkey authentication
    await db.logAudit({
      adminId,
      adminUsername,
      action: 'OWNER_PASSKEY_LOGIN',
      targetType: 'SYSTEM',
      targetId: 'auth_passkey',
      details: { via: 'owner_passkey' },
    });

    const response = NextResponse.json({
      success: true,
      redirect: '/admin',
    });

    // 4. Set HttpOnly session cookie
    response.cookies.set(SESSION_COOKIE_NAME, signedCookieValue, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isRequestSecure(req),
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal authentication error' },
      { status: 500 }
    );
  }
}
