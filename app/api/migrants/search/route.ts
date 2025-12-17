import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${query}%`;
    const result = db.prepare(
      `SELECT DISTINCT m.* FROM migrants m 
       LEFT JOIN migrant_names mn ON m.id = mn.migrant_id 
       WHERE LOWER(m.name) LIKE LOWER(?) OR LOWER(mn.name) LIKE LOWER(?) OR LOWER(m.country_of_origin) LIKE LOWER(?)`
    ).all(searchTerm, searchTerm, searchTerm);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Search error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
