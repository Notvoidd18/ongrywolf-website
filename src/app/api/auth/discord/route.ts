import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDiscordAuthUrl, getRequestOrigin, isRequestSecure } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);

  try {
    const state = crypto.randomBytes(24).toString('hex');
    const authUrl = getDiscordAuthUrl(state, req);

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('discord_oauth_state', state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isRequestSecure(req),
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (err: any) {
    const errorMsg = encodeURIComponent(err.message || 'discord_config_error');
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }
}
