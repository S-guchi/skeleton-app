import { supabase } from '../supabase';
import type { AuthUser } from '../types/auth';
import { getAuthErrorMessage } from '../utils/authErrorMessages';

/**
 * メールアドレスとパスワードでサインイン
 */
export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }
  } catch (error) {
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * メールアドレス、パスワード、名前でサインアップ
 */
export async function signUpWithEmail(email: string, password: string, name: string): Promise<void> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }

  } catch (error) {
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * 匿名でサインイン
 */
export async function signInAnonymously(): Promise<void> {
  try {
    if (__DEV__) console.log('🔐 Starting anonymous sign in...');
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('🔐 Anonymous auth error:', error);
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }

    if (__DEV__) console.log('🔐 Anonymous auth successful:', data.user?.id);
  } catch (error) {
    console.error('🔐 Anonymous sign in failed:', error);
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * 匿名アカウントをメールアカウントに昇格
 */
export async function upgradeAnonymousUser(email: string, password: string, name: string): Promise<void> {
  try {
    // まず現在のユーザーがいることを確認
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // 匿名ユーザーかチェック
    if (!user.is_anonymous) {
      throw new Error('匿名ユーザーではありません');
    }

    // メールとパスワードでアカウント昇格
    const { error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }

    // ユーザープロファイルを更新
    const { error: profileError } = await supabase
      .from('users')
      .update({
        name,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to update user profile:', profileError);
      throw new Error('プロファイルの更新に失敗しました');
    }
  } catch (error) {
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }
  } catch (error) {
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      const message = getAuthErrorMessage(error);
      throw new Error(message);
    }
  } catch (error) {
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * ユーザー情報を取得（世帯情報含む）
 */
export async function fetchUserWithHousehold(userId: string): Promise<AuthUser | null> {
  try {
    // ユーザー基本情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Failed to fetch user:', userError);
      // ユーザーレコードが存在しない場合
      if (userError?.code === 'PGRST116' || !userData) {
        console.warn('User record not found, this may indicate a trigger issue with handle_new_user');
        // 匿名ユーザーの場合は自動サインアウトを行わない
        // トリガーの問題を修正する必要がある
      }
      return null;
    }

    // 世帯メンバー情報を取得
    const { data: memberData, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    // 世帯に参加していない場合はエラーにしない
    const householdId = memberError ? null : memberData?.household_id;

    return {
      id: userData.id,
      name: userData.name,
      avatar_url: userData.avatar_url,
      hasCompletedOnboarding: !!householdId, // 世帯に参加していればオンボーディング完了
      householdId,
    };
  } catch (error) {
    console.error('Failed to fetch user with household:', error);
    return null;
  }
}

/**
 * アカウントのデータを削除してサインアウト
 * 注意: Supabase Authアカウント自体の削除はサーバーサイドで行う必要があります
 */
export async function deleteAccount(): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('ユーザー情報を取得できませんでした');
    }

    console.log('🗑️ Starting account deletion for user:', user.id);

    // 1. 関連する家事ログを削除（外部キー制約があるため先に削除）
    const { error: choreLogsError } = await supabase
      .from('chore_logs')
      .delete()
      .eq('user_id', user.id);

    if (choreLogsError) {
      console.error('Failed to delete chore logs:', choreLogsError);
      // 家事ログがない場合は問題ないので続行
    } else {
      console.log('✅ Chore logs deleted successfully');
    }

    // 2. 世帯メンバーから削除
    const { error: memberError } = await supabase
      .from('household_members')
      .delete()
      .eq('user_id', user.id);

    if (memberError) {
      console.error('Failed to remove from household:', memberError);
      throw new Error('世帯からの退会に失敗しました');
    } else {
      console.log('✅ Removed from household successfully');
    }

    // 3. ユーザープロファイルを削除
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to delete user profile:', profileError);
      // RLSポリシーエラーの場合は詳細なメッセージを表示
      if (profileError.code === '42501') {
        throw new Error('ユーザーデータの削除権限がありません。管理者にお問い合わせください。');
      }
      throw new Error('ユーザーデータの削除に失敗しました');
    } else {
      console.log('✅ User profile deleted successfully');
    }

    // 4. アプリからサインアウト
    await signOut();
    console.log('✅ Account deletion completed successfully');

  } catch (error) {
    console.error('❌ Account deletion failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    const message = getAuthErrorMessage(error);
    throw new Error(message);
  }
}
