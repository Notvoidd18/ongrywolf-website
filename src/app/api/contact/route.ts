import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/store';

const contactSchema = z.object({
  contactName: z.string().min(2, 'Name or Discord username must be at least 2 characters'),
  contactMethod: z.string().min(3, 'Please provide a valid contact method (e.g. Discord handle or email)'),
  category: z.enum(['plugins', 'discord-bots', 'client', 'builds', 'full-stack']),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  clientId: z.string().regex(/^OW-[A-Z]{4}$/).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    const record = await db.submitProjectRequest(validated);

    return NextResponse.json({
      success: true,
      message: 'Project request received and queued for review.',
      requestId: record.id,
      clientId: record.clientId,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || 'Internal server error while saving project request' },
      { status: 500 }
    );
  }
}
