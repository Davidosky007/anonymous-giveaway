import { NextApiRequest, NextApiResponse } from 'next';
import { validatePassword, createSession, createSessionCookie } from '../../../lib/auth';
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

  const { password } = req.body;

  if (!password || !validatePassword(password)) {
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
