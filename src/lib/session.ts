import { parse, serialize } from 'cookie';

const SESSION_COOKIE = 'vitala_session';

/** Read the session token from a Request (middleware-safe). */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE] ?? null;
}

/** Serialize a session cookie value for a Response. */
export function serializeSessionCookie(token: string): string {
  return serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/** Serialize an empty session cookie to clear it. */
export function clearSessionCookie(): string {
  return serialize(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
