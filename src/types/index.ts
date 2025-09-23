export interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'closed' | 'completed';
  winner_id: string | null;
  entry_count: number;
  created_at: number;
  updated_at: number;
}

export interface Entry {
  id: string;
  giveaway_id: string;
  anonymous_id: string;
  ip_hash: string | null;
  created_at: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
