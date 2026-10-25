import { NextRequest, NextResponse } from 'next/server';
import { exchangeDiscordCode, getDiscordUser, getDiscordAvatarUrl, getRequestOrigin, isRequestSecure } from '@/lib/discord';
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { isVerifiedOwner } from '@/lib/permissions';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const discordError = searchParams.get('error');
  const discordErrorDesc = searchParams.get('error_description');
  const storedState = req.cookies.get('discord_oauth_state')?.value;

  // 1. Handle explicit Discord OAuth errors (e.g. user denied permission)
  if (discordError) {
    const errorNotice = discordErrorDesc || (discordError === 'access_denied' ? 'Discord login cancelled by user.' : `Discord OAuth error: ${discordError}`);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorNotice)}`);
  }

  // 2. Verify OAuth2 State parameter to prevent CSRF
  if (!state || !storedState || state !== storedState) {
    const errorNotice = !storedState
      ? 'Login session expired or browser cookies are blocked. Please try again.'
      : 'Security state verification mismatch. Please restart login.';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorNotice)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No authorization code was provided by Discord.')}`);
  }

  try {
    // 3. Exchange authorization code securely on server
    const tokenData = await exchangeDiscordCode(code, req);

    // 3. Fetch verified user identity from Discord /users/@me
    const discordUser = await getDiscordUser(tokenData.accessToken);
    const avatarUrl = getDiscordAvatarUrl(discordUser);

    // 4. Verify Owner Authorization against server environment variables
    const isOwner = isVerifiedOwner(discordUser.id, discordUser.username);
    const role = isOwner ? 'OWNER' : 'USER';

    // 5. Create secure server-side session
    const { signedCookieValue } = createSession({
      discordId: discordUser.id,
      discordUsername: discordUser.username,
      globalName: discordUser.global_name || undefined,
      avatarUrl,
      isOwner,
      role,
    });

    // 6. Record/upsert into database store
    await db.upsertDiscordUser({
      id: discordUser.id,
      discordId: discordUser.id,
      username: discordUser.username,
      avatarUrl,
      role,
      status: 'active',
    });

    // 7. Audit log the login
    await db.logAudit({
      adminId: discordUser.id,
      adminUsername: discordUser.username,
      action: isOwner ? 'OWNER_DISCORD_LOGIN' : 'USER_DISCORD_LOGIN',
      targetType: 'USER',
      targetId: discordUser.id,
      details: { username: discordUser.username, isOwner },
    });

    // 8. Redirect destination: Admin Panel for owner, Dashboard for user
    const destination = isOwner ? '/admin' : '/dashboard';
    const response = NextResponse.redirect(`${origin}${destination}`);

    // 9. Set secure HttpOnly session cookie
    response.cookies.set(SESSION_COOKIE_NAME, signedCookieValue, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isRequestSecure(req),
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    // 10. Clear one-time OAuth state cookie
    response.cookies.delete('discord_oauth_state');

    return response;
  } catch (err: any) {
    console.error('Discord OAuth2 Callback Error:', err.message);
    const errorMsg = encodeURIComponent(err.message || 'authentication_failed');
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }
}
