import { NextApiRequest, NextApiResponse } from 'next';
import { dbQueries } from '../../../../lib/db';
import { generateId, getClientIP } from '../../../../lib/utils';
import { hashIP } from '../../../../lib/auth';
import { ApiResponse } from '../../../../types';

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<{ anonymousId: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { id: giveawayId } = req.query;

  if (!giveawayId || typeof giveawayId !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid giveaway ID' 
    });
  }

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
