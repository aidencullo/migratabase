import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const result = await pool.query(
      `SELECT DISTINCT m.* FROM migrants m 
       LEFT JOIN migrant_names mn ON m.id = mn.migrant_id 
       WHERE m.name ILIKE $1 OR mn.name ILIKE $1 OR m.country_of_origin ILIKE $1`,
      [`%${query}%`]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Search error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
