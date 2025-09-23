import { v4 as uuidv4 } from 'uuid';
import { dbQueries } from './db';
import { serialize } from 'cookie';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Environment configuration with fallbacks
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  // Default hash for 'admin123' - should be changed in production
  '$2b$10$rOcEaBJfaVhJF6x4N8cHpOQdNAKbX4OwGYRZbYUUYBqY6Q4xPzrB2';

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400'); // 24 hours default

export async function validatePassword(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export function createSession(): string {
  const sessionId = uuidv4();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  
  dbQueries.createSession.run(sessionId, expiresAt);
  return sessionId;
}

export function validateSession(sessionId: string): boolean {
  if (!sessionId) return false;
  const session = dbQueries.getSession.get(sessionId);
  return !!session;
}

export function createSessionCookie(sessionId: string): string {
  return serialize('admin_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/'
  });
}

export function destroySession(sessionId: string): void {
  dbQueries.deleteSession.run(sessionId);
}

export function destroySessionCookie(): string {
  return serialize('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
    expires: new Date(0)
  });
}

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}
