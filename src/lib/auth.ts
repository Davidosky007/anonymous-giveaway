import { v4 as uuidv4 } from 'uuid';
import { dbQueries } from './db';
import { serialize } from 'cookie';
import crypto from 'crypto';

// Simple password configuration - no hashing
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400'); // 24 hours default

export async function validatePassword(password: string): Promise<boolean> {
  try {
    return password === ADMIN_PASSWORD;
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
}

// Remove the hashPassword function since we're not using bcrypt anymore

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
