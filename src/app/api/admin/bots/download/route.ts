import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/store';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Owner access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get('id');

  if (!botId) {
    return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
  }

  const bot = await db.getHostedBotById(botId);
  if (!bot || !bot.codeArchiveName) {
    return NextResponse.json({ error: 'No code archive found for this bot' }, { status: 404 });
  }

  const storageDir = path.resolve(process.cwd(), 'hosted_bots_storage');
  if (!fs.existsSync(storageDir)) {
    return NextResponse.json({ error: 'Storage directory not found' }, { status: 404 });
  }

  // Find file matching code archive name
  const files = fs.readdirSync(storageDir);
  const targetFile = files.find((f) => f.endsWith(bot.codeArchiveName!));

  if (!targetFile) {
    return NextResponse.json({ error: 'Archive file not found on disk' }, { status: 404 });
  }

  const fullPath = path.join(storageDir, targetFile);
  const fileBuffer = fs.readFileSync(fullPath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${bot.codeArchiveName}"`,
      'Content-Type': 'application/octet-stream',
    },
  });
}
