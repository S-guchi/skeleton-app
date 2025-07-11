import React, { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import type { AuthUser, UserContextType, UserUpdate } from '../types/auth/user';
import { useSession } from './SessionContext';
import { 
  updateUserProfile, 
  fetchUserWithHousehold 
} from '../services/authService';

const UserContext = createContext<UserContextType>({
  user: null,
  isUserLoading: false,
  updateUser: async () => {},
  refreshUser: async () => {},
});

export function useUser() {
  const value = useContext(UserContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useUser must be wrapped in a <UserProvider />');
    }
  }
  return value;
}

export function UserProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadUserData(session.user.id);
    } else {
      // セッションがない場合はユーザーデータをクリア
      setUser(null);
      setIsUserLoading(false);
    }
  }, [session]);

  const loadUserData = async (userId: string) => {
    setIsUserLoading(true);
    try {
      const userData = await fetchUserWithHousehold(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setUser(null);
      
      // ユーザーが見つからない場合、セッション側でもクリアが必要な場合がある
      // ただし、SessionContextとの責務分離のため、ここではログのみ
      if (error instanceof Error && error.message?.includes('User record not found')) {
        console.warn('User record not found, session may need to be cleared');
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  const updateUser = async (updates: UserUpdate) => {
    if (!user) {
      throw new Error('No user to update');
    }
    
    try {
      await updateUserProfile(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!session?.user) {
      console.warn('No session available for user refresh');
      return;
    }
    await loadUserData(session.user.id);
  };

  return (
    <UserContext.Provider value={{
      user,
      isUserLoading,
      updateUser,
      refreshUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}