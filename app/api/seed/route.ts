import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureSchema } from '@/lib/db';

export async function POST() {
  try {
    await ensureSchema();

    const [countRows] = (await pool.execute('SELECT COUNT(*) as count FROM migrants')) as any;
    const count = Number(countRows?.[0]?.count ?? 0);
    if (count > 0) {
      return NextResponse.json({
        message: 'Database already has data; skipping seed',
        count,
      });
    }

    const migrants = [
      {
        name: 'Aiden Cullo',
        country_of_origin: 'United States',
        date_of_birth: '1995-06-15',
        age: 29,
        current_location: 'New York, NY',
        status: 'Active',
        altNames: ['Aiden', 'Cullo'],
      },
      {
        name: 'Leila Haddad',
        country_of_origin: 'Lebanon',
        date_of_birth: '1990-03-02',
        age: 34,
        current_location: 'Paris, FR',
        status: 'Active',
        altNames: ['Leila', 'Haddad'],
      },
      {
        name: 'Mateo Silva',
        country_of_origin: 'Brazil',
        date_of_birth: '1987-11-21',
        age: 37,
        current_location: 'Lisbon, PT',
        status: 'Inactive',
        altNames: ['Mateo', 'Silva'],
      },
      {
        name: 'Soo-jin Park',
        country_of_origin: 'South Korea',
        date_of_birth: '1998-08-09',
        age: 26,
        current_location: 'Seattle, WA',
        status: 'Active',
        altNames: ['Soo-jin', 'Park', 'Soojin Park'],
      },
    ];

    const insertedIds: Record<string, number> = {};

    for (const m of migrants) {
      const [result] = (await pool.execute(
        `INSERT INTO migrants (name, country_of_origin, date_of_birth, age, current_location, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [m.name, m.country_of_origin, m.date_of_birth, m.age, m.current_location, m.status]
      )) as any;

      const migrantId = Number(result.insertId);
      insertedIds[m.name] = migrantId;

      await pool.execute('INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)', [
        migrantId,
        m.name,
        1,
      ]);

      for (const alt of m.altNames) {
        await pool.execute('INSERT INTO migrant_names (migrant_id, name, is_primary) VALUES (?, ?, ?)', [
          migrantId,
          alt,
          0,
        ]);
      }
    }

    // Simple relationship example (idempotent because table is empty on first seed)
    await pool.execute(
      'INSERT INTO migrant_relationships (migrant_id_1, migrant_id_2, relationship_type, notes) VALUES (?, ?, ?, ?)',
      [insertedIds['Aiden Cullo'], insertedIds['Leila Haddad'], 'friend', 'Met through community program']
    );

    return NextResponse.json({ 
      message: 'Seeded sample migrants successfully',
      inserted: insertedIds,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
