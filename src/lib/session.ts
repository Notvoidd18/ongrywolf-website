import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'ongrywolf_sid';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  id: string;
  discordId: string;
  discordUsername: string;
  globalName?: string;
  avatarUrl?: string;
  isOwner: boolean;
  role: 'OWNER' | 'USER';
  createdAt: number;
  expiresAt: number;
}

// In-memory active session store (backed by server lifecycle)
const activeSessions = new Map<string, SessionData>();

// Server-side session secret
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.trim().length >= 32) {
    return secret.trim();
  }
  // Safe fallback if SESSION_SECRET is not yet in Render variables
  return 'ongrywolf_fallback_secret_key_32_characters_min_len_hash_2026';
}

/**
 * Creates an HMAC signature for a sessionId
 */
export function signSessionId(sessionId: string): string {
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(sessionId).digest('base64url');
  return `${sessionId}.${signature}`;
}

/**
 * Validates an HMAC signature and extracts the sessionId
 */
export function verifySignedSessionToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [sessionId, providedSignature] = parts;
  const secret = getSessionSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(sessionId).digest('base64url');

  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
    return isMatch ? sessionId : null;
  } catch {
    return null;
  }
}

/**
 * Creates and registers a new authenticated session
 */
export function createSession(data: Omit<SessionData, 'id' | 'createdAt' | 'expiresAt'>): {
  session: SessionData;
  signedCookieValue: string;
} {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;

  const session: SessionData = {
    ...data,
    id: sessionId,
    createdAt: now,
    expiresAt,
  };

  activeSessions.set(sessionId, session);
  const signedCookieValue = signSessionId(sessionId);

  return { session, signedCookieValue };
}

/**
 * Retrieves a session by its signed cookie value, failing closed if expired or tampered
 */
export function getSessionFromSignedToken(signedToken?: string | null): SessionData | null {
  if (!signedToken) return null;

  const sessionId = verifySignedSessionToken(signedToken);
  if (!sessionId) return null;

  const session = activeSessions.get(sessionId);
  if (!session) return null;

  // Verify expiry
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Destroys an active session
 */
export function destroySession(signedToken?: string | null): void {
  if (!signedToken) return;
  const sessionId = verifySignedSessionToken(signedToken);
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
}
