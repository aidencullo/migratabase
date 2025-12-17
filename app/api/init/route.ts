import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureSchema } from '@/lib/db';

export async function POST() {
  try {
    await ensureSchema();

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
