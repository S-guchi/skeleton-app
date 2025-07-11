import { supabase } from '@/lib/supabase';

export interface InviteCode {
  id: string;
  code: string;
  household_id: string;
  created_by: string;
  expires_at: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteCodeValidationResult {
  isValid: boolean;
  inviteCode?: InviteCode;
  reason?: 'expired' | 'used' | 'not_found' | 'error';
  error?: string;
}

export interface CreateInviteCodeResult {
  success: boolean;
  inviteCode?: InviteCode;
  error?: string;
}

export interface MarkAsUsedResult {
  success: boolean;
  error?: string;
}

/**
 * 6文字の英数字の招待コードを生成
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 招待コードの有効性をチェック
 */
export async function isInviteCodeValid(code: string): Promise<InviteCodeValidationResult> {
  try {
    if (__DEV__) console.log('🔍 招待コード検証開始:', { code: code.toUpperCase() });
    
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (__DEV__) console.log('🔍 データベースクエリ結果:', { data, error });

    if (error) {
      if (__DEV__) console.log('🔍 エラー詳細:', { code: error.code, message: error.message, details: error.details });
      
      if (error.code === 'PGRST116') {
        if (__DEV__) console.log('🔍 招待コードが見つかりません (PGRST116)');
        return { isValid: false, reason: 'not_found' };
      }
      if (__DEV__) console.log('🔍 データベースエラー:', error.message);
      return { isValid: false, reason: 'error', error: error.message };
    }

    if (!data) {
      if (__DEV__) console.log('🔍 データが見つかりません');
      return { isValid: false, reason: 'not_found' };
    }

    if (__DEV__) console.log('🔍 招待コードデータ:', { 
      id: data.id,
      code: data.code,
      household_id: data.household_id,
      is_used: data.is_used,
      expires_at: data.expires_at,
      created_at: data.created_at
    });

    // 使用済みかチェック
    if (data.is_used) {
      if (__DEV__) console.log('🔍 招待コードは既に使用済み');
      return { isValid: false, reason: 'used', inviteCode: data };
    }

    // 期限切れかチェック
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (__DEV__) console.log('🔍 有効期限チェック:', { 
      now: now.toISOString(), 
      expiresAt: expiresAt.toISOString(),
      isExpired: expiresAt <= now
    });
    
    if (expiresAt <= now) {
      if (__DEV__) console.log('🔍 招待コードの有効期限が切れています');
      return { isValid: false, reason: 'expired', inviteCode: data };
    }

    if (__DEV__) console.log('🔍 招待コードは有効です');
    return { isValid: true, inviteCode: data };
  } catch (error) {
    if (__DEV__) console.log('🔍 予期しないエラー:', error);
    return { 
      isValid: false, 
      reason: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 新しい招待コードを作成
 */
export async function createInviteCode(
  householdId: string,
  createdBy: string,
  expirationHours: number = 24
): Promise<CreateInviteCodeResult> {
  try {
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        household_id: householdId,
        created_by: createdBy,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, inviteCode: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 招待コードを使用済みとしてマーク
 */
export async function markInviteCodeAsUsed(
  inviteCodeId: string,
  usedBy: string
): Promise<MarkAsUsedResult> {
  try {
    const { error } = await supabase
      .from('invite_codes')
      .update({
        is_used: true,
        used_by: usedBy,
        used_at: new Date().toISOString(),
      })
      .eq('id', inviteCodeId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 世帯の有効な招待コードを取得
 */
export async function getActiveInviteCodes(householdId: string): Promise<InviteCode[]> {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('household_id', householdId)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active invite codes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active invite codes:', error);
    return [];
  }
}

/**
 * 期限切れの招待コードを削除
 */
export async function cleanupExpiredInviteCodes(): Promise<void> {
  try {
    await supabase
      .from('invite_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Error cleaning up expired invite codes:', error);
  }
}