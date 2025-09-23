import { NextApiRequest, NextApiResponse } from 'next';
import { dbQueries } from '../../../lib/db';
import { ApiResponse, Giveaway } from '../../../types';

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<Giveaway[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const giveaways = dbQueries.getActiveGiveaways.all() as Giveaway[];
    res.json({ success: true, data: giveaways });
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch giveaways' 
    });
  }
}
