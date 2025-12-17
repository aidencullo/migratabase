import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const result = db.query('SELECT * FROM migrants ORDER BY created_at DESC').all();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, country_of_origin, date_of_birth, age, current_location, status } = body;

    const insertMigrant = db.prepare(
      `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    
    insertMigrant.run(name, country_of_origin, date_of_birth, age, current_location, status);
    const migrantId = db.lastInsertRowid;

    // Also add to migrant_names table
    const insertName = db.prepare(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)'
    );
    insertName.run(migrantId, name, 1);

    return NextResponse.json({ id: migrantId, ...body }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
