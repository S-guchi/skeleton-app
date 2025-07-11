import type { Session } from '@supabase/supabase-js';

export interface SessionContextType {
  // 認証状態
  session: Session | null;
  isAuthLoading: boolean;
  
  // 認証操作
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  upgradeToEmailUser: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}