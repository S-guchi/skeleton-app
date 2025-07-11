import React, { useContext, createContext, type PropsWithChildren, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import type { Session } from '@supabase/supabase-js';
import type { SessionContextType } from '../types/auth/session';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInAnonymously,
  upgradeAnonymousUser,
  signOut as authSignOut
} from '../services/authService';

const SessionContext = createContext<SessionContextType>({
  session: null,
  isAuthLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signInAnonymously: async () => {},
  upgradeToEmailUser: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function useSession() {
  const value = useContext(SessionContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    // 初期セッション取得
    const initializeSession = async () => {
      try {
        // まず最新のセッション情報を取得（メール認証完了後の状態を反映）
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          // refreshに失敗した場合は通常のgetSessionを実行
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Failed to get initial session:', error);
          }
          setSession(data?.session || null);
        } else {
          // refresh成功時は更新されたセッションを使用
          setSession(refreshData?.session || null);
        }
        
        setIsAuthLoading(false);
      } catch (err) {
        console.error('Error initializing session:', err);
        setIsAuthLoading(false);
      }
    };
    
    initializeSession();

    // 認証状態変更リスナー
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 同じセッションIDの場合は何もしない（重複実行を防ぐ）
      const currentSessionId = session?.access_token || null;
      if (currentSessionId === lastSessionId.current) {
        return;
      }
      
      lastSessionId.current = currentSessionId;
      setSession(session);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      await signInWithEmail(email, password);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsAuthLoading(true);
    try {
      await signUpWithEmail(email, password, name);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOut = async () => {
    setIsAuthLoading(true);
    try {
      await authSignOut();
      setSession(null);
      lastSessionId.current = null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInAnonymouslyHandler = async () => {
    setIsAuthLoading(true);
    try {
      await signInAnonymously();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const upgradeToEmailUser = async (email: string, password: string, name: string) => {
    // UI側でローディング状態を管理するため、AuthContext側では設定しない
    try {
      await upgradeAnonymousUser(email, password, name);
      // onAuthStateChangeが発火するので、明示的にsessionを更新する必要はない
    } catch (error) {
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      // まず現在のトークンを強制更新
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // 更新に失敗した場合は、現在のセッションを取得
        const { data: currentData, error: currentError } = await supabase.auth.getSession();
        if (currentError) {
          console.error('Failed to get current session:', currentError);
          return;
        }
        
        if (currentData.session) {
          setSession(currentData.session);
          lastSessionId.current = currentData.session.access_token;
        }
        return;
      }
      
      if (refreshData.session) {
        setSession(refreshData.session);
        lastSessionId.current = refreshData.session.access_token;
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return (
    <SessionContext.Provider value={{
      session,
      isAuthLoading,
      signIn,
      signUp,
      signInAnonymously: signInAnonymouslyHandler,
      upgradeToEmailUser,
      signOut,
      refreshSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
}