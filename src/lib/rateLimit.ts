import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Configuration from environment
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export function rateLimit(maxRequests: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
  return function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    const clientIP = getClientIP(req);
    const now = Date.now();
    const key = `${clientIP}:${req.url}`;
    
    // Clean up expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[key].count++;
    }
    
    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      const timeLeft = Math.ceil((store[key].resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: timeLeft
      });
      return;
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000).toString());
    
    next();
  };
}

// Stricter rate limit for authentication endpoints
export const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// More lenient rate limit for public endpoints
export const publicRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes

// Helper function to get client IP
function getClientIP(req: NextApiRequest): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIp = req.headers['x-real-ip'];
  const ipFromXff = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0];
  const ipFromXri = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  const remoteAddr = req.socket?.remoteAddress;

  return ipFromXff || ipFromXri || remoteAddr || '127.0.0.1';
}
