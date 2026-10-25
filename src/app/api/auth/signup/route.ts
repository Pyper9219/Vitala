import { NextResponse } from 'next/server';
import { createUser, generateTokens } from '@/lib/auth';
import { serializeSessionCookie } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await createUser(email, password, name);
    const { accessToken } = generateTokens(user);

    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
      },
      { status: 201 },
    );
    response.headers.append('Set-Cookie', serializeSessionCookie(accessToken));
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create account';
    console.error('Signup error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
