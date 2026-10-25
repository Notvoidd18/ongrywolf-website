import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import { botHostClient } from '@/lib/botHostClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const [hostedBots, userConfigs, serverUptime, remoteHostHealth] = await Promise.all([
      db.getHostedBots(false),
      db.getBotConfigs(),
      db.getServerUptime(),
      botHostClient.checkHealth(),
    ]);

    return NextResponse.json({
      hostedBots,
      userConfigs,
      serverUptime,
      remoteHostHealth,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let botName = '';
    let clientId = '';
    let token = '';
    let statusText = 'Hosting on Ongrywolf';
    let hostingEnv: any = 'Dedicated (Render)';
    let prefix = '!';
    let assignedCommands: string[] = ['log', 'listlog', 'channellog'];
    let description = '';
    let codeArchiveName: string | undefined;
    let codeArchiveSize: number | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      botName = (formData.get('name') as string) || '';
      clientId = (formData.get('clientId') as string) || '';
      token = (formData.get('token') as string) || '';
      statusText = (formData.get('statusText') as string) || 'Hosting on Ongrywolf';
      hostingEnv = (formData.get('hostingEnv') as string) || 'Dedicated (Render)';
      prefix = (formData.get('prefix') as string) || '!';
      description = (formData.get('description') as string) || '';

      const commandsRaw = formData.get('assignedCommands') as string;
      if (commandsRaw) {
        assignedCommands = commandsRaw.split(',').map((c) => c.trim()).filter(Boolean);
      }

      const file = formData.get('codeArchive') as File | null;
      if (file && file.size > 0) {
        codeArchiveName = file.name;
        codeArchiveSize = file.size;

        const uploadDir = path.resolve(process.cwd(), 'hosted_bots_storage');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, `${Date.now()}_${file.name}`);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
      }
    } else {
      const body = await req.json();
      botName = body.name || '';
      clientId = body.clientId || '';
      token = body.token || '';
      statusText = body.statusText || 'Hosting on Ongrywolf';
      hostingEnv = body.hostingEnv || 'Dedicated (Render)';
      prefix = body.prefix || '!';
      assignedCommands = body.assignedCommands || ['log', 'listlog', 'channellog'];
      description = body.description || '';
    }

    if (!botName.trim()) {
      return NextResponse.json({ error: 'Bot name is required.' }, { status: 400 });
    }

    if (!clientId.trim()) {
      return NextResponse.json({ error: 'Application / Client ID is required.' }, { status: 400 });
    }

    const botId = `bot_${botName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const saved = await db.saveHostedBot(
      {
        id: botId,
        name: botName.trim(),
        clientId: clientId.trim(),
        token: token.trim() || undefined,
        statusText: statusText.trim(),
        hostingEnv,
        prefix: prefix.trim() || '!',
        assignedCommands,
        description: description.trim(),
        codeArchiveName,
        codeArchiveSize,
        desiredEnabled: true,
        observedState: token.trim() ? 'online' : 'offline',
        lastStartedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
      },
      admin.discordUsername
    );

    return NextResponse.json({ success: true, bot: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, action, enabled, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    if (action === 'restart') {
      const success = await db.restartHostedBot(id, admin.discordUsername);
      return NextResponse.json({ success, action: 'restarted' });
    }

    if (action === 'config' && updates) {
      const success = await db.updateHostedBotConfig(id, updates, admin.discordUsername);
      return NextResponse.json({ success, action: 'configured' });
    }

    // Default power toggle
    const desiredState = enabled !== undefined ? Boolean(enabled) : action === 'start';
    const success = await db.toggleHostedBot(id, desiredState, admin.discordUsername);
    return NextResponse.json({ success, action: desiredState ? 'started' : 'stopped' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    let success = false;
    const bot = await db.getHostedBotById(id);
    if (bot) {
      success = await db.deleteHostedBot(id, admin.discordUsername);
    } else {
      success = await db.deleteBotConfig(id, admin.discordUsername);
    }
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
