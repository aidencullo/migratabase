import { NextResponse } from 'next/server';
import db from '@/lib/db';
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
        db.exec(statement);
      }
    }

    // Check if Aiden Cullo already exists
    const existing = db.prepare('SELECT id FROM migrants WHERE name = ?').get('Aiden Cullo') as { id: number } | undefined;

    if (existing) {
      return NextResponse.json({ 
        message: 'Aiden Cullo already exists in the database',
        migrantId: existing.id 
      });
    }

    // Insert Aiden Cullo
    const insertMigrant = db.prepare(
      `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    
    insertMigrant.run(
      'Aiden Cullo',
      'United States',
      '1995-06-15',
      29,
      'New York, NY',
      'Active'
    );

    const migrantId = db.lastInsertRowid;

    // Add primary name to migrant_names table
    const insertName = db.prepare(
      'INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)'
    );
    insertName.run(migrantId, 'Aiden Cullo', 1);

    // Add alternative name variations
    insertName.run(migrantId, 'Aiden', 0);
    insertName.run(migrantId, 'Cullo', 0);

    return NextResponse.json({ 
      message: 'Aiden Cullo seeded successfully',
      migrantId 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
