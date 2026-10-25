import { NextRequest } from 'next/server';

/**
 * Official Discord OAuth2 API Client
 * Server-side only. Never exposed to browser or client JavaScript.
 */

export interface DiscordOAuthUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
}

/**
 * Resolves safe routable origin from request headers.
 * Never returns internal 0.0.0.0 binding address to the browser.
 */
export function getRequestOrigin(req: NextRequest): string {
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'localhost:3000';
  const proto =
    req.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Determines if cookies should have the Secure flag.
 * Disables Secure flag when accessed locally over plain HTTP so browsers don't drop cookies.
 */
export function isRequestSecure(req: NextRequest): boolean {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return false;
  }
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) {
    return proto === 'https';
  }
  return process.env.NODE_ENV === 'production';
}

export function isDiscordOAuthConfigured(): boolean {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.BOT_CLIENT_ID_MAIN;
  return Boolean(clientId && clientId.trim().length > 0);
}

export function getDiscordOAuthCredentials(req?: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.BOT_CLIENT_ID_MAIN;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  const origin = req ? getRequestOrigin(req) : 'http://localhost:3000';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');

  let redirectUri = process.env.DISCORD_REDIRECT_URI?.trim();
  // When running locally, prioritize local callback URL so local testing routes back to localhost
  if (!redirectUri || isLocal) {
    redirectUri = `${origin}/api/auth/callback`;
  }

  return {
    clientId: clientId?.trim(),
    clientSecret: clientSecret?.trim(),
    redirectUri,
  };
}

/**
 * Returns the exact Redirect URI that must be added to Discord Developer Portal
 */
export function getDiscordRedirectUri(req?: NextRequest): string {
  return getDiscordOAuthCredentials(req).redirectUri;
}

/**
 * Builds the official Discord authorization URL
 */
export function getDiscordAuthUrl(state: string, req?: NextRequest): string {
  const { clientId, redirectUri } = getDiscordOAuthCredentials(req);
  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID is not configured in your environment variables. Please add DISCORD_CLIENT_ID in your Render Dashboard or .env.local file.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify',
    state,
    prompt: 'consent',
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchanges authorization code for Discord access token
 */
export async function exchangeDiscordCode(
  code: string,
  req?: NextRequest
): Promise<{ accessToken: string; tokenType: string; expiresIn: number }> {
  const { clientId, clientSecret, redirectUri } = getDiscordOAuthCredentials(req);

  if (!clientId || !clientSecret) {
    throw new Error('DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET must be configured in Render environment variables or .env.local.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let friendlyReason = errorText;
    try {
      const errObj = JSON.parse(errorText);
      friendlyReason = errObj.error_description || errObj.message || errObj.error || errorText;
    } catch {}
    throw new Error(`Discord authorization exchange rejected: ${friendlyReason}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
}

/**
 * Fetches verified user identity from Discord official API
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordOAuthUser> {
  const response = await fetch('https://discord.com/api/v10/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Discord user identity: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Constructs CDN avatar URL
 */
export function getDiscordAvatarUrl(user: DiscordOAuthUser): string | undefined {
  if (!user.avatar) {
    return undefined;
  }
  const isAnimated = user.avatar.startsWith('a_');
  const format = isAnimated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=128`;
}
