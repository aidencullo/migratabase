import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const [rows] = await pool.execute(
      `SELECT DISTINCT m.* FROM migrants m 
       LEFT JOIN migrant_names mn ON m.id = mn.migrant_id 
       WHERE m.name LIKE ? OR mn.name LIKE ? OR m.country_of_origin LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
