import { NextApiRequest, NextApiResponse } from 'next';
import { validatePassword, createSession, createSessionCookie } from '../../../lib/auth';
import { authRateLimit } from '../../../lib/rateLimit';
import { validateRequest, loginSchema } from '../../../lib/validation';
import { securityHeaders, corsHeaders } from '../../../lib/security';
import { ApiResponse } from '../../../types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse>
) {
  // Apply security headers
  await new Promise<void>((resolve) => {
    securityHeaders(req, res, () => resolve());
  });

  // Apply CORS headers
  await new Promise<void>((resolve) => {
    corsHeaders(req, res, () => resolve());
  });

  // Apply rate limiting
  await new Promise<void>((resolve) => {
    authRateLimit(req, res, () => resolve());
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Validate input
  const validate = validateRequest(loginSchema);
  const { error, value } = validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error
    });
  }

  const { password } = value as { password: string };

  const isValidPassword = await validatePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid password' 
    });
  }

  try {
    const sessionId = createSession();
    const cookie = createSessionCookie(sessionId);
    
    res.setHeader('Set-Cookie', cookie);
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create session' 
    });
  }
}
