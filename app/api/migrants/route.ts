import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM migrants ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, country_of_origin, date_of_birth, age, current_location, status } = body;

    const insertMigrant = await pool.query(
      `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [name, country_of_origin, date_of_birth, age, current_location, status]
    );
    const migrantId = insertMigrant.rows[0]?.id;

    // Also add to migrant_names table
    await pool.query(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES ($1, $2, $3)',
      [migrantId, name, true]
    );

    return NextResponse.json({ id: migrantId, ...body }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
