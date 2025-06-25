export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          level: number;
          total_exp: number;
          coins: number;
          current_streak: number;
          longest_streak: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          total_exp?: number;
          coins?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          total_exp?: number;
          coins?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string | null;
          type: 'income' | 'expense';
          date: string;
          exp_gained: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          description?: string | null;
          type: 'income' | 'expense';
          date?: string;
          exp_gained?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          type?: 'income' | 'expense';
          date?: string;
          exp_gained?: number;
          created_at?: string;
        };
      };
    };
  };
}
