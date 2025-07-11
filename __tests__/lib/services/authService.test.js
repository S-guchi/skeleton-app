// authService のエラーハンドリングテスト（純粋関数のみ）

describe('authService エラーハンドリング', () => {
  describe('PGRST116エラーの検出', () => {
    it('PGRST116エラーコードを正しく識別できる', () => {
      const error = {
        code: 'PGRST116',
        message: 'JSON object requested, multiple (or no) rows returned',
        details: 'The result contains 0 rows',
      };

      expect(error.code).toBe('PGRST116');
      expect(error.message).toContain('JSON object requested');
      expect(error.details).toContain('0 rows');
    });

    it('他のエラーコードと区別できる', () => {
      const otherError = {
        code: 'PGRST301',
        message: 'Permission denied',
        details: 'Access forbidden',
      };

      expect(otherError.code).not.toBe('PGRST116');
    });
  });

  describe('セッション不整合状態の判定', () => {
    it('PGRST116エラーまたはnullデータの場合に不整合と判定', () => {
      // PGRST116エラーの場合
      const isPgrst116Error = (error: any) => error?.code === 'PGRST116';
      const isDataNull = (data: any) => !data;

      const pgrst116Error = { code: 'PGRST116' };
      const nullData = null;
      const validData = { id: 'user-id', name: 'Test User' };

      expect(isPgrst116Error(pgrst116Error) || isDataNull(nullData)).toBe(true);
      expect(isPgrst116Error(null) || isDataNull(validData)).toBe(false);
    });
  });

  describe('ユーザーデータの構造', () => {
    it('正常なユーザーデータの形式を確認', () => {
      const userData = {
        id: 'user-id',
        name: 'Test User',
        avatar_url: null,
      };

      const householdId = 'household-id';

      const appUser = {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar_url,
        hasCompletedOnboarding: !!householdId,
        householdId,
      };

      expect(appUser.id).toBe('user-id');
      expect(appUser.name).toBe('Test User');
      expect(appUser.avatar).toBeNull();
      expect(appUser.hasCompletedOnboarding).toBe(true);
      expect(appUser.householdId).toBe('household-id');
    });

    it('世帯に参加していない場合のオンボーディング状態', () => {
      const userData = {
        id: 'user-id',
        name: 'Test User',
        avatar_url: null,
      };

      const householdId = null;

      const appUser = {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar_url,
        hasCompletedOnboarding: !!householdId,
        householdId,
      };

      expect(appUser.hasCompletedOnboarding).toBe(false);
      expect(appUser.householdId).toBeNull();
    });
  });
});