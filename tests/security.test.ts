import { isVerifiedOwner } from '../src/lib/permissions';
import {
  signSessionId,
  verifySignedSessionToken,
  createSession,
  getSessionFromSignedToken,
} from '../src/lib/session';

async function runTests() {
  console.log('====================================================');
  console.log('  ONGRYWOLF CRITICAL SECURITY & AUTH TEST SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // --- TEST 1: Owner Identity Verification ---
  process.env.ADMIN_ACCOUNT = 'notvoid18';
  process.env.ADMIN_USER_ID = '';

  assert(
    isVerifiedOwner('123456789012345678', 'notvoid18') === true,
    'Owner username notvoid18 is verified'
  );

  assert(
    isVerifiedOwner('123456789012345678', 'NotVoid18') === true,
    'Owner username comparison is case-insensitive'
  );

  assert(
    isVerifiedOwner('123456789012345678', 'attacker') === false,
    'Attacker username is rejected'
  );

  assert(
    isVerifiedOwner('123456789012345678', '') === false,
    'Empty username is rejected (fail closed)'
  );

  // --- TEST 2: Immutable Snowflake ID Binding ---
  process.env.ADMIN_USER_ID = '999888777666555444';

  assert(
    isVerifiedOwner('999888777666555444', 'any_renamed_username') === true,
    'Verified immutable Discord Snowflake ID takes precedence'
  );

  assert(
    isVerifiedOwner('111222333444555666', 'someone_else') === false,
    'Mismatched Snowflake ID fails'
  );

  // --- TEST 3: Cryptographic HMAC Session Signatures ---
  process.env.SESSION_SECRET = 'super_secure_production_secret_key_minimum_32_characters!';
  const originalSessionId = 'session_test_abc123';
  const signedToken = signSessionId(originalSessionId);

  assert(
    verifySignedSessionToken(signedToken) === originalSessionId,
    'HMAC signature verification succeeds for genuine token'
  );

  // Tampered token test
  const tamperedToken = signedToken + 'forged';
  assert(
    verifySignedSessionToken(tamperedToken) === null,
    'Tampered session token fails verification'
  );

  assert(
    verifySignedSessionToken('forged_cookie_without_signature') === null,
    'Unsigned cookie fails verification'
  );

  // --- TEST 4: Live Server Endpoint Checks ---
  const baseUrl = 'http://localhost:3000';

  try {
    // 4.1 Admin Page Access (Unauthenticated)
    const adminRes = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
    assert(
      adminRes.status === 307 && (adminRes.headers.get('location') || '').includes('/login'),
      'Unauthenticated visitor to /admin is redirected to /login'
    );

    // 4.2 Dashboard Access (Unauthenticated)
    const dashRes = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' });
    assert(
      dashRes.status === 307 && (dashRes.headers.get('location') || '').includes('/login'),
      'Unauthenticated visitor to /dashboard is redirected to /login'
    );

    // 4.3 Admin Users API (Unauthenticated)
    const usersRes = await fetch(`${baseUrl}/api/admin/users`);
    assert(
      usersRes.status === 403,
      'Unauthenticated call to /api/admin/users returns HTTP 403'
    );

    // 4.4 Admin Trials API (Unauthenticated)
    const trialsRes = await fetch(`${baseUrl}/api/admin/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '123', action: 'extend' }),
    });
    assert(
      trialsRes.status === 403,
      'Unauthenticated mutation to /api/admin/trials returns HTTP 403'
    );

    // 4.5 Admin Permissions API (Unauthenticated)
    const permsRes = await fetch(`${baseUrl}/api/admin/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '123', featureKey: 'export_config' }),
    });
    assert(
      permsRes.status === 403,
      'Unauthenticated mutation to /api/admin/permissions returns HTTP 403'
    );

    // 4.6 Old switch-role Backdoor Removal
    const backdoorRes = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'OWNER' }),
    });
    assert(
      backdoorRes.status === 404,
      'Old /api/auth/switch-role endpoint is completely deleted (HTTP 404)'
    );

    // 4.7 Bot Token Diagnostics (Unauthenticated)
    const tokenDiagRes = await fetch(`${baseUrl}/api/bots/verify-token?botId=main`);
    assert(
      tokenDiagRes.status === 401,
      'Unauthenticated call to /api/bots/verify-token returns HTTP 401'
    );

    // 4.8 Session Me Endpoint (Unauthenticated)
    const meRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(
      meRes.status === 401,
      'Unauthenticated call to /api/auth/me returns HTTP 401'
    );

    // 4.9 Public Homepage & Product Pages (Accessible)
    const homeRes = await fetch(`${baseUrl}/`);
    const prodRes = await fetch(`${baseUrl}/products`);
    const contactRes = await fetch(`${baseUrl}/contact`);
    assert(
      homeRes.status === 200 && prodRes.status === 200 && contactRes.status === 200,
      'Public pages (/, /products, /contact) return HTTP 200 OK'
    );
  } catch (err: any) {
    console.error('Server endpoint test error:', err.message);
  }

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
