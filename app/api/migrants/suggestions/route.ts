import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const DEFAULT_LIMIT = 8;

function clampLimit(raw: string | null) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(25, Math.floor(parsed)));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get('q') || '').trim();
    const limit = clampLimit(searchParams.get('limit'));

    // If no query provided, return a small "recent" list so the UI can prefetch on focus.
    if (!query) {
      const [rows] = await pool.execute(
        `SELECT m.id, m.name, m.country_of_origin
         FROM migrants m
         ORDER BY m.created_at DESC
         LIMIT ?`,
        [limit]
      );
      return NextResponse.json(rows);
    }

    // Prefix match for fast typeahead behavior.
    const prefix = `${query}%`;

    const [rows] = await pool.execute(
      `SELECT m.id, m.name, m.country_of_origin
       FROM migrants m
       LEFT JOIN migrant_names mn ON m.id = mn.migrant_id
       WHERE m.name LIKE ? OR mn.name LIKE ?
       GROUP BY m.id
       ORDER BY (m.name LIKE ?) DESC, m.name ASC
       LIMIT ?`,
      [prefix, prefix, prefix, limit]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Suggestions error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

