import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initializeDatabase } from '@/lib/initializeDatabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initializeDatabase();

    // Check if Aiden Cullo already exists
    const existing = await prisma.migrant.findFirst({
      where: { name: 'Aiden Cullo' },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Aiden Cullo already exists in the database',
        migrantId: existing.id,
      });
    }

    // Insert Aiden Cullo
    const created = await prisma.migrant.create({
      data: {
        name: 'Aiden Cullo',
        country_of_origin: 'United States',
        date_of_birth: '1995-06-15',
        age: 29,
        current_location: 'New York, NY',
        status: 'Active',
        migrant_names: {
          create: [
            { name: 'Aiden Cullo', is_primary: true },
            { name: 'Aiden', is_primary: false },
            { name: 'Cullo', is_primary: false },
          ],
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      message: 'Aiden Cullo seeded successfully',
      migrantId: created.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
