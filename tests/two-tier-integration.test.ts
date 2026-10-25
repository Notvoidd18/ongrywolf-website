import assert from 'node:assert';
import test from 'node:test';
import http from 'http';
import path from 'path';

// Import Render 1 Management API server directly to run an integrated test instance
// We use relative path to import compiled or ts-node managementServer
const { createManagementServer } = require('../../Discord bot/src/api/managementServer');
import { botHostClient } from '../src/lib/botHostClient';
import { isVerifiedOwner } from '../src/lib/permissions';

let server: http.Server;
let port: number;

test('Two-Tier Architecture: Website (Render 2) <-> Bot Host (Render 1) Integration Suite', async (t) => {
  // 1. Setup Render 1 mock/live Management Server
  await new Promise<void>((resolve) => {
    process.env.BOT_HOST_API_KEY = 'integration_test_secret_key_42';
    server = createManagementServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      port = addr.port;
      process.env.BOT_HOST_API_URL = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(async () => {
    try {
      const { botManager } = require('../../Discord bot/src/platform/botManager');
      await botManager.deleteBot(testBotId);
    } catch (_) {}
    server.close();
  });

  await t.test('1. botHostClient.checkHealth probes Render 1 successfully', async () => {
    const health = await botHostClient.checkHealth();
    assert.strictEqual(health.ok, true, 'Health check should report ok: true');
    assert.ok(typeof health.uptimeSeconds === 'number', 'Uptime should be numeric');
    assert.ok(typeof health.totalBots === 'number', 'totalBots should be numeric');
  });

  await t.test('2. botHostClient.listBots lists initial bots', async () => {
    const result = await botHostClient.listBots();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.remoteAvailable, true);
    assert.ok(Array.isArray(result.bots));
  });

  const testBotId = `e2e_test_bot_${Date.now()}`;
  const testSecretToken = 'synthetic_secret_token_MTU2MzA3NjI0NTg1MDI5NjM2MQ';

  await t.test('3. botHostClient.registerBot provisions a new Discord bot to Render 1', async () => {
    const res = await botHostClient.registerBot({
      id: testBotId,
      displayName: 'E2E Integration Bot',
      applicationId: '1250267167065112616',
      token: testSecretToken,
      defaultPrefix: '!',
      defaultStatusText: 'Testing Two-Tier Architecture',
      ownerAccount: 'notvoid18',
      enabledModules: ['work_logging', 'official_commands'],
      desiredEnabled: true,
    });

    assert.strictEqual(res.success, true, `Provisioning failed: ${res.error}`);
    assert.ok(res.bot);
    assert.strictEqual(res.bot?.id, testBotId);
    assert.strictEqual(res.bot?.displayName, 'E2E Integration Bot');
    assert.strictEqual(res.bot?.applicationId, '1250267167065112616');
    // Ensure token is NOT leaked in the returned bot status object
    assert.strictEqual((res.bot as any).token, undefined, 'Bot token must never be present in returned status');
  });

  await t.test('4. botHostClient.getBot retrieves the registered bot status', async () => {
    const res = await botHostClient.getBot(testBotId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.bot?.id, testBotId);
    assert.strictEqual(res.bot?.ownerAccount, 'notvoid18');
  });

  await t.test('5. botHostClient.updateConfig updates runtime settings on Render 1', async () => {
    const res = await botHostClient.updateConfig(testBotId, {
      displayName: 'Renamed E2E Bot',
      statusText: 'Updated Status via Website Client',
      prefix: '?',
      enabledModules: ['work_logging'],
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status?.displayName, 'Renamed E2E Bot');
    assert.strictEqual(res.status?.statusText, 'Updated Status via Website Client');
    assert.strictEqual(res.status?.prefix, '?');
  });

  await t.test('6. botHostClient.getLogs retrieves sanitized logs and redacts tokens', async () => {
    const res = await botHostClient.getLogs(testBotId);
    assert.strictEqual(res.success, true);
    assert.ok(Array.isArray(res.logs));

    // Confirm that the secret token is nowhere in the logs
    const logDump = JSON.stringify(res.logs);
    assert.strictEqual(
      logDump.includes(testSecretToken),
      false,
      'Raw Discord bot token must be redacted from all log streams'
    );
  });

  await t.test('7. botHostClient.restartBot triggers runtime restart sequence', async () => {
    const res = await botHostClient.restartBot(testBotId);
    assert.strictEqual(res.success, true);
  });

  await t.test('8. botHostClient.stopBot stops the bot process', async () => {
    const res = await botHostClient.stopBot(testBotId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status?.desiredEnabled, false);
  });

  await t.test('9. botHostClient.deleteBot removes bot instance completely from Render 1', async () => {
    const res = await botHostClient.deleteBot(testBotId);
    assert.strictEqual(res.success, true);

    const check = await botHostClient.getBot(testBotId);
    assert.strictEqual(check.success, false, 'Deleted bot should no longer be found');
  });

  await t.test('10. Graceful degradation when Render 1 is unreachable', async () => {
    // Point to non-existent port
    const originalUrl = process.env.BOT_HOST_API_URL;
    process.env.BOT_HOST_API_URL = 'http://127.0.0.1:49999';

    const health = await botHostClient.checkHealth();
    assert.strictEqual(health.ok, false);
    assert.ok(health.error !== undefined);

    const listRes = await botHostClient.listBots();
    assert.strictEqual(listRes.success, false);
    assert.strictEqual(listRes.remoteAvailable, false);
    assert.deepStrictEqual(listRes.bots, []);

    // Restore URL
    process.env.BOT_HOST_API_URL = originalUrl;
  });

  await t.test('11. Owner Authorization Guard validation', async () => {
    process.env.ADMIN_ACCOUNT = 'notvoid18';
    process.env.ADMIN_USER_ID = '1098582262569783367';

    // Immutable Discord Snowflake ID
    assert.strictEqual(isVerifiedOwner('1098582262569783367', 'notvoid18'), true);
    assert.strictEqual(isVerifiedOwner('1098582262569783367', 'renamed_account'), true);

    // Impersonator / unauthorized user
    assert.strictEqual(isVerifiedOwner('999999999999999999', 'notvoid18'), false);
    assert.strictEqual(isVerifiedOwner('999999999999999999', 'hacker'), false);
    assert.strictEqual(isVerifiedOwner('', ''), false);
  });
});
