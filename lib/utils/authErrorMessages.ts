/**
 * Supabaseエラーコードを日本語メッセージに変換
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return '不明なエラーが発生しました';
  }

  const message = String(error.message).toLowerCase();

  // メール認証関連
  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return 'メールアドレスが確認されていません。受信ボックスをご確認ください。';
  }

  // パスワード関連
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'メールアドレスまたはパスワードが間違っています。';
  }

  if (message.includes('password should be at least')) {
    return 'パスワードは6文字以上で入力してください。';
  }

  // メールアドレス関連
  if (message.includes('invalid email') || message.includes('invalid_email')) {
    return '有効なメールアドレスを入力してください。';
  }

  if (message.includes('email already registered') || message.includes('user_already_exists') || message.includes('user already registered')) {
    return 'このメールアドレスは既に登録されています。';
  }

  // アカウント関連
  if (message.includes('user not found') || message.includes('user_not_found')) {
    return 'アカウントが見つかりません。';
  }

  if (message.includes('too many requests') || message.includes('rate_limit')) {
    return '試行回数が上限に達しました。時間をおいてから再度お試しください。';
  }

  // ネットワーク関連
  if (message.includes('network') || message.includes('fetch')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }

  // データベース・権限関連
  if (message.includes('insufficient_privilege') || message.includes('42501')) {
    return 'データベースの操作権限がありません。管理者にお問い合わせください。';
  }

  if (message.includes('foreign key constraint') || message.includes('23503')) {
    return '関連するデータが存在するため削除できません。';
  }

  if (message.includes('infinite recursion detected')) {
    return 'データベースの設定に問題があります。管理者にお問い合わせください。';
  }

  // その他のエラー
  if (message.includes('weak password')) {
    return 'パスワードが弱すぎます。より複雑なパスワードを設定してください。';
  }

  if (message.includes('token')) {
    return 'セッションが期限切れです。再度ログインしてください。';
  }

  // デフォルトメッセージ（元のエラーメッセージを日本語に）
  return String(error.message) || '不明なエラーが発生しました';
}