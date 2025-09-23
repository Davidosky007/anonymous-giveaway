import { NextApiRequest, NextApiResponse } from 'next';
import { dbQueries } from '../../../lib/db';
import { validateSession } from '../../../lib/auth';
import { generateId } from '../../../lib/utils';
import { ApiResponse, Giveaway } from '../../../types';

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<Giveaway | Giveaway[]>>
) {
  const sessionId = req.cookies.admin_session;
  if (!validateSession(sessionId || '')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized' 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const giveaways = dbQueries.getAllGiveaways.all() as Giveaway[];
        return res.json({ success: true, data: giveaways });
        
      case 'POST':
        const { title, description } = req.body;
        
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Title is required' 
          });
        }

        const giveawayId = generateId();
        dbQueries.createGiveaway.run(giveawayId, title.trim(), description || null);
        
        const newGiveaway = dbQueries.getGiveawayById.get(giveawayId) as Giveaway;
        return res.json({ success: true, data: newGiveaway });
        
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Error handling giveaways:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
