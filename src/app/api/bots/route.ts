import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { db } from '@/lib/store';
import { botHostClient } from '@/lib/botHostClient';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const registerBotSchema = z.object({
  botName: z.string().min(2, 'Bot name is required (min 2 characters)'),
  applicationId: z.string().min(17, 'Application ID must be a valid Discord snowflake (17-20 digits)').max(22),
  token: z.string().min(20, 'A valid Discord bot token is required'),
  commandPrefix: z.string().min(1).max(3).default('!'),
  statusText: z.string().min(1).max(100).default('Hosting on Ongrywolf'),
  enabledModules: z.array(z.string()).default(['work_logs']),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  // Retrieve user's trial status
  const trial = await db.getTrialByUserId(session.discordId);

  // Retrieve user's bots (owner sees all, regular users see their own)
  const allBots = await db.getHostedBots(false);
  const userBots = session.isOwner
    ? allBots
    : allBots.filter((b) => b.ownerAccount === session.discordUsername || b.ownerAccount === session.discordId);

  // Check remote host status
  const remoteHealth = await botHostClient.checkHealth();

  return NextResponse.json({
    bots: userBots,
    trial,
    remoteHostAvailable: remoteHealth.ok,
    user: {
      username: session.discordUsername,
      discordId: session.discordId,
      isOwner: session.isOwner,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // Server-side Trial Enforcement
    const trial = await db.getTrialByUserId(session.discordId);
    if (!session.isOwner && trial) {
      const isExpired = trial.status === 'revoked' || new Date(trial.expiresAt).getTime() < Date.now();
      if (isExpired) {
        return NextResponse.json(
          { error: 'Your 7-day evaluation trial has expired. Contact @notvoid18 to extend your evaluation access.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const validated = registerBotSchema.parse(body);

    // 1. Verify token with Discord's official REST API
    let discordUser: any = null;
    try {
      const probeRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${validated.token.trim()}` },
        cache: 'no-store',
      });
      if (!probeRes.ok) {
        return NextResponse.json(
          { error: 'Discord API rejected this bot token. Please check credentials in Discord Developer Portal.' },
          { status: 400 }
        );
      }
      discordUser = await probeRes.json();
    } catch (err: any) {
      return NextResponse.json({ error: `Discord verification probe error: ${err.message}` }, { status: 500 });
    }

    const cleanBotId = `user_${session.discordUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_${Date.now().toString().slice(-4)}`;

    // 2. Provision directly to Render 1 (Bot Hosting) over authenticated HTTPS
    const provisionResult = await botHostClient.registerBot({
      id: cleanBotId,
      displayName: validated.botName.trim(),
      applicationId: validated.applicationId.trim(),
      token: validated.token.trim(),
      defaultPrefix: validated.commandPrefix.trim(),
      defaultStatusText: validated.statusText.trim(),
      ownerAccount: session.discordUsername,
      enabledModules: validated.enabledModules,
      desiredEnabled: true,
    });

    if (!provisionResult.success && provisionResult.error?.includes('rejected')) {
      return NextResponse.json({ error: provisionResult.error }, { status: 400 });
    }

    // 3. Save metadata on Render 2 Website (token kept strictly server-side, never exposed)
    const saved = await db.saveHostedBot(
      {
        id: cleanBotId,
        name: validated.botName.trim(),
        clientId: validated.applicationId.trim(),
        botId: discordUser?.id,
        username: discordUser ? `${discordUser.username}#${discordUser.discriminator === '0' ? '' : discordUser.discriminator}`.replace(/#$/, '') : undefined,
        avatarUrl: discordUser?.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined,
        ownerAccount: session.discordUsername,
        statusText: validated.statusText.trim(),
        hostingEnv: 'Dedicated (Render)',
        prefix: validated.commandPrefix.trim(),
        assignedCommands: ['log', 'listlog', 'channellog'],
        enabledModules: validated.enabledModules,
        desiredEnabled: true,
        observedState: 'online',
        trialStatus: trial?.status === 'active' ? 'active' : 'exempt',
        trialExpiresAt: trial?.expiresAt,
        lastStartedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
      },
      session.discordUsername
    );

    // Audit log
    await db.logAudit({
      adminId: session.discordId,
      adminUsername: session.discordUsername,
      action: 'USER_REGISTERED_BOT',
      targetType: 'BOT_CONFIG',
      targetId: saved.id,
      details: {
        botName: saved.name,
        applicationId: saved.clientId,
        discordTag: saved.username,
      },
    });

    // Sanitize response: NEVER return token
    const { token, ...safeBot } = saved;
    return NextResponse.json({ success: true, bot: safeBot });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
