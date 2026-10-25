import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Require authenticated session
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required to verify tokens' },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const botId = url.searchParams.get('botId') || 'main';

  let tokenFound = false;
  let sourceVar = '';
  let errorMessage: string | null = null;

  if (botId === 'bot_a') {
    if (process.env.BOT_TOKEN_A?.trim()) {
      tokenFound = true;
      sourceVar = 'BOT_TOKEN_A';
    } else {
      errorMessage =
        'Error: Bot token not found! "BOT_TOKEN_A" is not defined in your Render environment variables. Please add BOT_TOKEN_A to your Render service.';
    }
  } else {
    // Main bot check
    if (process.env.BOT_TOKEN_MAIN?.trim()) {
      tokenFound = true;
      sourceVar = 'BOT_TOKEN_MAIN';
    } else if (process.env.DISCORD_TOKEN?.trim()) {
      tokenFound = true;
      sourceVar = 'DISCORD_TOKEN';
    } else {
      errorMessage =
        'Error: Bot token not found! Neither "BOT_TOKEN_MAIN" nor "DISCORD_TOKEN" was found in your Render environment variables. The bot cannot connect until you add this variable in your Render dashboard.';
    }
  }

  if (!tokenFound) {
    return NextResponse.json(
      {
        success: false,
        tokenFound: false,
        botId,
        error: errorMessage,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    tokenFound: true,
    botId,
    sourceVar,
    message: `Bot token verified in environment variable: ${sourceVar}`,
  });
}
