import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initializeDatabase } from '@/lib/initializeDatabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${query}%`;

    // SQLite does not support Prisma's `mode: 'insensitive'` string filters, so we
    // keep the original SQL behavior (LOWER(...) LIKE LOWER(?)).
    const result = await prisma.$queryRaw`
      SELECT DISTINCT m.* FROM migrants m
      LEFT JOIN migrant_names mn ON m.id = mn.migrant_id
      WHERE
        LOWER(m.name) LIKE LOWER(${searchTerm})
        OR LOWER(mn.name) LIKE LOWER(${searchTerm})
        OR LOWER(m.country_of_origin) LIKE LOWER(${searchTerm})
      ORDER BY m.created_at DESC
    `;

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Search error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
