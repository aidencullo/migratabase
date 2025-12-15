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
        await pool.execute(statement);
      }
    }

    // Check if Aiden Cullo already exists
    const [existing] = await pool.execute(
      'SELECT id FROM migrants WHERE name = ?',
      ['Aiden Cullo']
    ) as any[];

    if (existing.length > 0) {
      return NextResponse.json({ 
        message: 'Aiden Cullo already exists in the database',
        migrantId: existing[0].id 
      });
    }

    // Insert Aiden Cullo
    const [result] = await pool.execute(
      `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Aiden Cullo',
        'United States',
        '1995-06-15',
        29,
        'New York, NY',
        'Active'
      ]
    ) as any[];

    const migrantId = result.insertId;

    // Add primary name to migrant_names table
    await pool.execute(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)',
      [migrantId, 'Aiden Cullo', true]
    );

    // Add alternative name variations
    await pool.execute(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)',
      [migrantId, 'Aiden', false]
    );

    await pool.execute(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)',
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
