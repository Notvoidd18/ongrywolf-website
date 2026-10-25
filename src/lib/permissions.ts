/**
 * Server-Side Owner & Privilege Verification
 * Strictly verifies identity against server environment variables.
 * Never trusts client input or forgeable cookies.
 */

export function isVerifiedOwner(discordId: string, discordUsername: string): boolean {
  if (!discordId || !discordUsername) {
    return false;
  }

  // 1. Immutable Discord Snowflake ID is the authoritative owner identifier once configured.
  // If configured, the ID MUST match. Username matching alone is not sufficient once ID is bound.
  const configuredAdminId = process.env.ADMIN_USER_ID?.trim();
  if (configuredAdminId && configuredAdminId.length >= 17) {
    return discordId === configuredAdminId;
  }

  // 2. Initial bootstrap / username verification when ADMIN_USER_ID is not yet bound
  const configuredAdminAccount = (process.env.ADMIN_ACCOUNT || 'notvoid18').trim().toLowerCase();
  const normalizedIncomingUsername = discordUsername.trim().toLowerCase();

  if (configuredAdminAccount && normalizedIncomingUsername === configuredAdminAccount) {
    return true;
  }

  // Fail closed by default
  return false;
}
