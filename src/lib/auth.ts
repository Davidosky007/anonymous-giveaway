import { v4 as uuidv4 } from 'uuid';
import { dbQueries } from './db';
import { serialize } from 'cookie';
import crypto from 'crypto';

const ADMIN_PASSWORD = 'admin123';

export function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createSession(): string {
  const sessionId = uuidv4();
  const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
  
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
    maxAge: 24 * 60 * 60,
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
