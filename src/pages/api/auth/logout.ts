import { NextApiRequest, NextApiResponse } from 'next';
import { destroySession, destroySessionCookie } from '../../../lib/auth';
import { ApiResponse } from '../../../types';

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const sessionId = req.cookies.admin_session;
    if (sessionId) {
      destroySession(sessionId);
    }
    
    const cookie = destroySessionCookie();
    res.setHeader('Set-Cookie', cookie);
    res.json({ success: true });
  } catch (error) {
    console.error('Error destroying session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to logout' 
    });
  }
}
