import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE_NAME,
  getSessionFromSignedToken,
  SessionData,
} from './session';
import { isVerifiedOwner } from './permissions';

export { SESSION_COOKIE_NAME };
export type { SessionData };

/**
 * Retrieves the currently authenticated session from signed HttpOnly cookie.
 * Returns null if not logged in, expired, or tampered.
 * Never returns a mock or fallback user.
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = getSessionFromSignedToken(token);
  if (!session) {
    return null;
  }

  // Re-verify owner status against server environment variables on every request
  const currentlyOwner = isVerifiedOwner(session.discordId, session.discordUsername);
  session.isOwner = currentlyOwner;
  session.role = currentlyOwner ? 'OWNER' : 'USER';

  return session;
}

/**
 * Requires user to be authenticated via Discord OAuth2.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

/**
 * Requires user to be the verified owner (ADMIN_ACCOUNT=notvoid18 or ADMIN_USER_ID).
 * In page server component context: redirects to /login or returns null for forbidden check.
 */
export async function requireAdmin(): Promise<SessionData | null> {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }
  if (!session.isOwner) {
    return null;
  }
  return session;
}
