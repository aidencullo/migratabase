import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initializeDatabase } from '@/lib/initializeDatabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeDatabase();

    const result = await prisma.migrant.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { name, country_of_origin, date_of_birth, age, current_location, status } = body;

    const created = await prisma.migrant.create({
      data: {
        name,
        country_of_origin,
        date_of_birth,
        age,
        current_location,
        status,
        migrant_names: {
          create: [{ name, is_primary: true }],
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
