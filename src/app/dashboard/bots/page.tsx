import React from 'react';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/store';
import { botHostClient } from '@/lib/botHostClient';
import { UserBotsDashboard } from './UserBotsDashboard';

export const dynamic = 'force-dynamic';

export default async function BotDashboardPage() {
  const session = await requireAuth();

  // Load user's evaluation trial
  const trial = await db.getTrialByUserId(session.discordId);

  // Retrieve bots from local database and Render 1 host
  const allBots = await db.getHostedBots(false);
  const userBots = session.isOwner
    ? allBots
    : allBots.filter(
        (b) => b.ownerAccount === session.discordUsername || b.ownerAccount === session.discordId
      );

  // Probe Render 1 host health
  const hostHealth = await botHostClient.checkHealth();

  return (
    <UserBotsDashboard
      initialBots={userBots}
      trial={trial}
      username={session.discordUsername}
      isOwner={session.isOwner}
      remoteAvailable={hostHealth.ok}
    />
  );
}
