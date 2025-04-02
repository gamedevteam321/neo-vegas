import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  balance?: number;
  email_confirmed_at?: string;
  profile?: {
    display_name?: string;
    bio?: string;
    preferences?: Record<string, any>;
  };
  game_stats?: {
    total_games?: number;
    total_wins?: number;
    total_losses?: number;
    total_profit?: number;
    favorite_game?: string;
    last_played?: string;
  };
  security?: {
    two_factor_enabled?: boolean;
    last_login?: string;
    login_attempts?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface GameHistory {
  id: string;
  userId: string;
  gameType: 'dragon-tower' | 'mines' | 'dice' | 'wheel';
  betAmount: number;
  outcome: 'win' | 'loss';
  multiplier: number;
  finalAmount: number;
  gameData: any;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'bet' | 'win' | 'bonus' | 'adjustment';
  amount: number;
  balance: number;
  gameId?: string;
  description: string;
  createdAt: Date;
} 