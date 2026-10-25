import { NextResponse } from 'next/server';
import { authenticateUser, generateTokens } from '@/lib/auth';
import { serializeSessionCookie } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const { accessToken } = generateTokens(user);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
    response.headers.append('Set-Cookie', serializeSessionCookie(accessToken));
    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 },
    );
  }
}
