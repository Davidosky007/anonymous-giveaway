import { NextApiRequest, NextApiResponse } from 'next';
import { dbQueries } from '../../../../lib/db';
import { validateSession } from '../../../../lib/auth';
import { ApiResponse, Entry, Giveaway } from '../../../../types';

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<{ winner: Entry | null }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const sessionId = req.cookies.admin_session;
  if (!validateSession(sessionId || '')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized' 
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
    const giveaway = dbQueries.getGiveawayById.get(giveawayId) as Giveaway;
    if (!giveaway) {
      return res.status(404).json({ 
        success: false, 
        error: 'Giveaway not found' 
      });
    }

    if (giveaway.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Winner already selected' 
      });
    }

    const entries = dbQueries.getEntriesByGiveaway.all(giveawayId) as Entry[];
    
    if (entries.length === 0) {
      return res.json({ 
        success: true, 
        data: { winner: null } 
      });
    }

    const randomIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[randomIndex];
    
    dbQueries.updateGiveawayWinner.run(winner.id, giveawayId);
    
    res.json({ 
      success: true, 
      data: { winner } 
    });
  } catch (error) {
    console.error('Error picking winner:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to pick winner' 
    });
  }
}
