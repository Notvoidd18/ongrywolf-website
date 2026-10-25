import { db } from '../src/lib/store';
import { createOwnerSessionToken } from '../src/lib/auth';

async function runTests() {
  console.log('====================================================');
  console.log('  ONGRYWOLF ADMIN PANEL & BOT HOSTING VERIFICATION  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Test Server Uptime calculation
    const uptime = db.getServerUptime();
    assert(typeof uptime.seconds === 'number' && uptime.seconds >= 0, 'Server uptime seconds is a non-negative number');
    assert(typeof uptime.formatted === 'string' && uptime.formatted.includes('s'), 'Server uptime formatted string is valid');

    // 2. Test Real Hosted Bots fetching
    const bots = await db.getHostedBots(true);
    assert(Array.isArray(bots) && bots.length >= 2, `Hosted bots fleet loaded (${bots.length} bots)`);
    assert(bots.some((b) => b.id === 'main'), 'Main official bot instance is present in fleet');

    // 3. Test Bot probe mechanism
    const mainBot = bots.find((b) => b.id === 'main');
    assert(Boolean(mainBot), 'Main bot found');
    const probeRes = await db.probeBotLatency('main');
    assert(typeof probeRes.success === 'boolean', `Latency probe executed successfully (online: ${probeRes.observedState}, ping: ${probeRes.pingMs}ms)`);

    // 4. Test Bot Save & Lifecycle
    const testBot = await db.saveHostedBot(
      {
        id: 'test_audit_bot',
        name: 'Automated Test Bot',
        clientId: '999888777666555444',
        statusText: 'Hosting on Ongrywolf Test',
        hostingEnv: 'Dedicated (Render)',
        prefix: '?',
        assignedCommands: ['help', 'ping'],
        desiredEnabled: true,
        observedState: 'offline',
        lastStartedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
      },
      'notvoid18'
    );
    assert(testBot.id === 'test_audit_bot', 'New bot registered into hosting fleet');

    // 5. Test Toggle Bot power
    const toggled = await db.toggleHostedBot('test_audit_bot', false, 'notvoid18');
    assert(toggled === true, 'Bot stopped successfully via power control');

    // 6. Test Delete Bot
    const deleted = await db.deleteHostedBot('test_audit_bot', 'notvoid18');
    assert(deleted === true, 'Bot deleted from fleet successfully');

    // 7. Test Work Logs
    const workLog = await db.addWorkLog({
      guildId: '1250267167065112616',
      channelId: 'staff-logs',
      userId: '1098582262569783367',
      username: 'notvoid18',
      description: 'Tested bot hosting deployment pipeline and live latency probe.',
    });
    assert(Boolean(workLog.id), `Work log recorded (ID: ${workLog.id})`);

    const workLogs = await db.getWorkLogs();
    assert(workLogs.some((w) => w.id === workLog.id), 'Work log successfully persisted and retrievable');

    // Clean up test work log
    await db.deleteWorkLog(workLog.id, 'notvoid18');
    const remainingWorkLogs = await db.getWorkLogs();
    assert(!remainingWorkLogs.some((w) => w.id === workLog.id), 'Work log deleted successfully');

    // 8. Test Project Requests / Messages
    const projectReq = await db.submitProjectRequest({
      contactName: 'Alex Mercer',
      contactMethod: 'alex#0001',
      category: 'discord-bots',
      description: 'Need a custom moderation bot with ticket system and custom embeds.',
    });
    assert(Boolean(projectReq.id), `Project request submitted (ID: ${projectReq.id})`);

    // Update status
    const statusUpdated = await db.updateProjectRequestStatus(projectReq.id, 'contacted', 'notvoid18');
    assert(statusUpdated === true, 'Project request status transitioned to contacted');

    const allRequests = await db.getProjectRequests();
    const updatedReq = allRequests.find((r) => r.id === projectReq.id);
    assert(updatedReq?.status === 'contacted', 'Project request status change persisted');

    // Delete project request
    const reqDeleted = await db.deleteProjectRequest(projectReq.id, 'notvoid18');
    assert(reqDeleted === true, 'Project request deleted successfully');

    // 9. Test Audit Logs (Audacity Log)
    const auditLogs = await db.getAuditLogs();
    assert(Array.isArray(auditLogs) && auditLogs.length > 0, `Audit logs ledger populated (${auditLogs.length} events logged)`);
    assert(auditLogs.some((a) => a.adminUsername === 'notvoid18'), 'Audit log records actor as verified owner');

    console.log('\n====================================================');
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
