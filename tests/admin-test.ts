import { createSession, SESSION_COOKIE_NAME } from '../src/lib/session';

async function run() {
  const session = createSession({
    discordId: '1098582262569783367',
    discordUsername: 'notvoid18',
    isOwner: true,
    role: 'OWNER',
  });

  const cookie = `${SESSION_COOKIE_NAME}=${session.signedCookieValue}`;

  console.log('Testing GET /api/admin/bots ...');
  const resBots = await fetch('http://localhost:3000/api/admin/bots', {
    headers: { Cookie: cookie },
  });
  const dataBots = await resBots.json();
  console.log('Bots response status:', resBots.status);
  console.log('Hosted bots count:', dataBots.hostedBots?.length);
  if (dataBots.hostedBots?.[0]) {
    console.log('Bot 0:', dataBots.hostedBots[0].name, 'Ping:', dataBots.hostedBots[0].pingMs, 'ms, State:', dataBots.hostedBots[0].observedState);
  }
  console.log('Server Uptime:', dataBots.serverUptime?.formatted);

  console.log('\nTesting POST /api/admin/work-logs ...');
  const resWorkPost = await fetch('http://localhost:3000/api/admin/work-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      guildId: 'Ongrywolf HQ',
      channelId: '#staff-logs',
      description: 'Tested bot deployment and Discord API latency probes.',
    }),
  });
  const dataWorkPost = await resWorkPost.json();
  console.log('Work Log POST status:', resWorkPost.status, 'Success:', dataWorkPost.success);

  console.log('\nTesting GET /api/admin/work-logs ...');
  const resWorkGet = await fetch('http://localhost:3000/api/admin/work-logs', {
    headers: { Cookie: cookie },
  });
  const dataWorkGet = await resWorkGet.json();
  console.log('Work logs count:', dataWorkGet.logs?.length);
}

run().catch(console.error);
