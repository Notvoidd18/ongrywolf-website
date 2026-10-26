/**
 * Ongrywolf Client ID Utility
 * Format: OW-XXXX (e.g. OW-WAAD)
 * Exactly 6 letters and 1 symbol (hyphen), total 7 characters.
 * Enforces 1 unique deterministic/persistent ID per user.
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Unambiguous uppercase alphabet (excluding I, O to avoid confusion)

/**
 * Generates a random Client ID formatted as OW-XXXX
 */
export function generateRandomClientId(): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * LETTERS.length);
    suffix += LETTERS[randomIndex];
  }
  return `OW-${suffix}`;
}

/**
 * Deterministically generates a Client ID from a Discord ID, email, or username.
 * Guarantees that the same user identity always produces the exact same ID.
 */
export function getDeterministicClientId(input: string): string {
  if (!input || typeof input !== 'string') {
    return generateRandomClientId();
  }

  // FNV-1a 32-bit hash
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let unsignedHash = hash >>> 0;
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += LETTERS[unsignedHash % LETTERS.length];
    unsignedHash = Math.floor(unsignedHash / LETTERS.length);
  }

  return `OW-${suffix}`;
}

/**
 * Validates whether an ID matches the OW-XXXX format (6 letters, 1 symbol)
 */
export function isValidClientId(id?: string | null): boolean {
  if (!id) return false;
  return /^OW-[A-Z]{4}$/.test(id.trim());
}

/**
 * Gets or creates a single persistent Client ID per user stored in browser localStorage.
 * Guaranteed format OW-XXXX (6 letters, 1 symbol).
 */
export function getPersistentClientId(): string {
  if (typeof window === 'undefined') {
    return generateRandomClientId();
  }
  try {
    const stored = localStorage.getItem('ongrywolf_client_id');
    if (stored && isValidClientId(stored)) {
      return stored;
    }
    const created = generateRandomClientId();
    localStorage.setItem('ongrywolf_client_id', created);
    return created;
  } catch {
    return generateRandomClientId();
  }
}
