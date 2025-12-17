import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM migrants ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, country_of_origin, date_of_birth, age, current_location, status } = body;

    const [result]: any = await pool.execute(
      'INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, country_of_origin, date_of_birth, age, current_location, status]
    );

    // Also add to migrant_names table
    await pool.execute(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)',
      [result.insertId, name, true]
    );

    return NextResponse.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
