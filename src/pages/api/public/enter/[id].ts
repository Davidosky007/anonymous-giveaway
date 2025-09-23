import { NextApiRequest, NextApiResponse } from 'next';
import { dbQueries } from '../../../../lib/db';
import { generateId, getClientIP } from '../../../../lib/utils';
import { hashIP } from '../../../../lib/auth';
import { publicRateLimit } from '../../../../lib/rateLimit';
import { validateRequest, giveawayIdSchema } from '../../../../lib/validation';
import { securityHeaders, corsHeaders } from '../../../../lib/security';
import { ApiResponse } from '../../../../types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<{ anonymousId: string }>>
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
    publicRateLimit(req, res, () => resolve());
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Validate giveaway ID
  const validate = validateRequest(giveawayIdSchema);
  const { error, value } = validate({ id: req.query.id });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid giveaway ID'
    });
  }

  const { id: giveawayId } = value as { id: string };

  try {
    // Check if giveaway exists and is active
    const giveaway = dbQueries.getGiveawayById.get(giveawayId) as { status: string } | undefined;
    if (!giveaway || giveaway.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        error: 'Giveaway not available' 
      });
    }

    // Rate limiting: One entry per IP per giveaway
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);
    
    const existingEntry = dbQueries.checkIPEntry.get(giveawayId, ipHash) as { count: number } | undefined;
    if (existingEntry && existingEntry.count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already entered this giveaway' 
      });
    }

    // Create entry
    const entryId = generateId();
    const anonymousId = generateId();
    
    dbQueries.createEntry.run(entryId, giveawayId, anonymousId, ipHash);
    
    res.json({ 
      success: true, 
      data: { anonymousId }
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit entry' 
    });
  }
}
