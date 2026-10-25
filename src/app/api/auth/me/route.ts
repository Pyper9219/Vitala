import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSessionTokenFromRequest } from '@/lib/session';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getTokenFromHeaders(headers: Headers): string | null {
  const cookie = headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(/vitala_session=([^;]+)/);
  return match ? match[1] : null;
}

export async function GET(req: Request): Promise<Response> {
  const token = getTokenFromHeaders(req.headers);
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const sessionUser = verifyToken(token);
  if (!sessionUser) {
    return NextResponse.json({ user: null });
  }

  const res = await query(
    'SELECT id, email, name, role, subscription_tier, created_at FROM users WHERE id = $1',
    [sessionUser.id],
  );

  const user = res.rows[0] ?? null;
  return NextResponse.json({ user });
}

export async function PUT(req: Request): Promise<Response> {
  const token = getTokenFromHeaders(req.headers);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = verifyToken(token);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { full_name, display_name, phone_number } = body;

  // Use the first non-empty name field
  const name = (full_name || display_name || "").trim() || null;

  await query(
    'UPDATE users SET name = $1 WHERE id = $2',
    [name, sessionUser.id],
  );

  return NextResponse.json({ ok: true });
}
