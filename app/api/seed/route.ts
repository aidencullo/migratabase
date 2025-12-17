import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // First, ensure database is initialized
    const schemaPath = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'schema.sql'),
      'utf-8'
    );
    const statements = schemaPath.split(';').filter((stmt: string) => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    // Check if Aiden Cullo already exists
    const existing = await pool.query('SELECT id FROM migrants WHERE name = $1', ['Aiden Cullo']);

    if (existing.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Aiden Cullo already exists in the database',
        migrantId: existing.rows[0].id 
      });
    }

    // Insert Aiden Cullo
    const inserted = await pool.query(
      `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        'Aiden Cullo',
        'United States',
        '1995-06-15',
        29,
        'New York, NY',
        'Active'
      ]
    );

    const migrantId = inserted.rows[0].id;

    // Add primary name to migrant_names table
    await pool.query(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES ($1, $2, $3)',
      [migrantId, 'Aiden Cullo', true]
    );

    // Add alternative name variations
    await pool.query(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES ($1, $2, $3)',
      [migrantId, 'Aiden', false]
    );

    await pool.query(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES ($1, $2, $3)',
      [migrantId, 'Cullo', false]
    );

    return NextResponse.json({ 
      message: 'Aiden Cullo seeded successfully',
      migrantId 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
