import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { query } from './db';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Please add it to .env.local',
    );
  }
  return secret;
}

const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  subscription_tier?: string;
  created_at?: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

export function generateTokens(user: User): AuthTokens {
  const secret = getJWTSecret();
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
  };

  const accessToken = sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = sign(payload, secret, { expiresIn: '30d' });

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const secret = getJWTSecret();
    const decoded = verify(token, secret) as JwtPayload & {
      sub: string;
      email: string;
      name?: string | null;
      role?: string;
    };
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? null,
      role: decoded.role ?? 'user',
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;
  return getUserById(payload.id);
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>('SELECT id, email, name, role, subscription_tier, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>('SELECT id, email, name, role, subscription_tier, created_at FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  const { rows } = await query<User & { id: string }>(
    `INSERT INTO users (email, password_hash, name, role, subscription_tier) VALUES ($1, $2, $3, 'user', 'free') RETURNING id, email, name, role, subscription_tier, created_at`,
    [email, hashedPassword, name ?? null],
  );
  return rows[0];
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const result = await query<User & { password_hash: string }>(
    'SELECT id, email, name, role, subscription_tier, created_at, password_hash FROM users WHERE email = $1',
    [email],
  );
  const user = result.rows[0];
  if (!user) {
    return null;
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return null;
  }

  const { password_hash, ...rest } = user;
  return rest;
}

export async function updateSubscriptionTier(
  userId: string,
  tier: 'free' | 'premium',
): Promise<void> {
  await query('UPDATE users SET subscription_tier = $1 WHERE id = $2', [tier, userId]);
}