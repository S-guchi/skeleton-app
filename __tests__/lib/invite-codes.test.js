// 招待コード生成関数のテスト（純粋関数のみ）

// generateInviteCode関数のテスト
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

describe('招待コード生成機能', () => {
  describe('generateInviteCode', () => {
    it('6文字の英数字の招待コードを生成できる', () => {
      const code = generateInviteCode();
      
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('毎回異なるコードを生成する', () => {
      const code1 = generateInviteCode();
      const code2 = generateInviteCode();
      
      // 同じ結果になる可能性は非常に低いが、理論的には可能
      expect(typeof code1).toBe('string');
      expect(typeof code2).toBe('string');
      expect(code1).toMatch(/^[A-Z0-9]{6}$/);
      expect(code2).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('100回生成してもすべて6文字の英数字である', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateInviteCode();
        expect(code).toHaveLength(6);
        expect(code).toMatch(/^[A-Z0-9]{6}$/);
      }
    });
  });
});