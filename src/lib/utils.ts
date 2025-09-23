import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
  connection?: { remoteAddress?: string | null };
};

export function getClientIP(req: RequestLike): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIp = req.headers['x-real-ip'];
  const ipFromXff = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0];
  const ipFromXri = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  const remoteAddr = req.socket?.remoteAddress || req.connection?.remoteAddress;

  return ipFromXff || ipFromXri || remoteAddr || '127.0.0.1';
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}
