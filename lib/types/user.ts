export interface AuthUser {
  id: string;
  name: string;
  avatar?: string;
  hasCompletedOnboarding?: boolean;
}

export interface UserContextType {
  // ユーザーデータ
  user: AuthUser | null;
  isUserLoading: boolean;
  
  // ユーザー操作
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}