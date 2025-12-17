import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseIntParam(value: string | null): number | null {
  if (value == null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function parseCsvParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseDateParam(value: string | null): string | null {
  if (!value) return null;
  // Expect YYYY-MM-DD (MySQL DATE literal format)
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const country = parseCsvParam(searchParams.get('country'));
    const status = parseCsvParam(searchParams.get('status'));
    const location = (searchParams.get('location') || '').trim();
    const ageMin = parseIntParam(searchParams.get('ageMin'));
    const ageMax = parseIntParam(searchParams.get('ageMax'));
    const dobFrom = parseDateParam(searchParams.get('dobFrom'));
    const dobTo = parseDateParam(searchParams.get('dobTo'));

    const limitRaw = parseIntParam(searchParams.get('limit'));
    const offsetRaw = parseIntParam(searchParams.get('offset'));
    const limit = Math.max(1, Math.min(limitRaw ?? 50, 200));
    const offset = Math.max(0, offsetRaw ?? 0);

    const hasAnyFilter =
      Boolean(q) ||
      country.length > 0 ||
      status.length > 0 ||
      Boolean(location) ||
      ageMin != null ||
      ageMax != null ||
      Boolean(dobFrom) ||
      Boolean(dobTo);

    if (!hasAnyFilter) {
      return NextResponse.json([]);
    }

    const where: string[] = [];
    const params: any[] = [];

    if (q) {
      where.push(
        `(m.name LIKE ? OR mn.name LIKE ? OR m.country_of_origin LIKE ? OR m.current_location LIKE ? OR m.status LIKE ?)`
      );
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    if (country.length > 0) {
      where.push(`m.country_of_origin IN (${country.map(() => '?').join(', ')})`);
      params.push(...country);
    }

    if (status.length > 0) {
      where.push(`m.status IN (${status.map(() => '?').join(', ')})`);
      params.push(...status);
    }

    if (location) {
      where.push(`m.current_location LIKE ?`);
      params.push(`%${location}%`);
    }

    if (ageMin != null) {
      where.push(`m.age >= ?`);
      params.push(ageMin);
    }

    if (ageMax != null) {
      where.push(`m.age <= ?`);
      params.push(ageMax);
    }

    if (dobFrom) {
      where.push(`m.date_of_birth >= ?`);
      params.push(dobFrom);
    }

    if (dobTo) {
      where.push(`m.date_of_birth <= ?`);
      params.push(dobTo);
    }

    const sql = `SELECT DISTINCT m.* FROM migrants m
      LEFT JOIN migrant_names mn ON m.id = mn.migrant_id
      WHERE ${where.join(' AND ')}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`;

    params.push(limit, offset);

    const [rows] = await pool.execute(sql, params);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Search error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
