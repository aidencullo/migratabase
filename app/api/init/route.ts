import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/initializeDatabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
