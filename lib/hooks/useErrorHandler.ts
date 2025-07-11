import { Alert } from 'react-native';
import { useCallback } from 'react';
import { useLocalization } from './useLocalization';

// 日本語エラーメッセージのマッピング
const ERROR_MESSAGES: { [key: string]: string } = {
  // ネットワークエラー
  'NetworkError': 'ネットワークエラーが発生しました。インターネット接続を確認してください',
  'Failed to fetch': 'サーバーに接続できませんでした。しばらく経ってから再試行してください',
  
  // 認証エラー
  'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
  'Email not confirmed': 'メールアドレスが確認されていません',
  'User already registered': 'このメールアドレスは既に登録されています',
  'Signup requires email verification': 'メール認証が必要です',
  
  // データベースエラー
  'Foreign key violation': '関連するデータが存在しないため、操作を完了できませんでした',
  'Unique constraint violation': '既に存在するデータです',
  'Check constraint violation': '入力データが制約に違反しています',
  
  // 世帯関連エラー
  '世帯IDが見つかりません': '世帯情報が見つかりません。再度ログインしてください',
  'Household not found': '世帯が見つかりません',
  'Member already exists': 'このユーザーは既にメンバーです',
  
  // 家事関連エラー
  'Chore not found': '家事項目が見つかりません',
  'Invalid chore data': '家事データが無効です',
  
  // ランキング関連エラー
  'Ranking data not found': 'ランキングデータが見つかりません',
  'Invalid ranking period': 'ランキング期間が無効です',
  
  // 一般的なエラー
  'Permission denied': '権限がありません',
  'Invalid input': '入力データが無効です',
  'Server error': 'サーバーエラーが発生しました',
};

// エラータイプの定義
export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface ErrorContext {
  action?: string;
  component?: string;
  userId?: string;
  householdId?: string;
  additionalInfo?: Record<string, any>;
}

/**
 * 統一エラーハンドリングフック
 */
export function useErrorHandler() {
  const { t } = useLocalization();
  
  /**
   * エラーメッセージを翻訳
   */
  const translateError = useCallback((error: Error | string): string => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // 完全一致チェック
    if (ERROR_MESSAGES[errorMessage]) {
      return ERROR_MESSAGES[errorMessage];
    }
    
    // 部分一致チェック
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // PostgreSQLエラーコードの処理
    if (errorMessage.includes('23505')) {
      return t('errors.uniqueConstraint', { defaultValue: '既に存在するデータです' });
    }
    if (errorMessage.includes('23503')) {
      return t('errors.foreignKeyConstraint', { defaultValue: '関連するデータが不足しています' });
    }
    if (errorMessage.includes('23514')) {
      return t('errors.checkConstraint', { defaultValue: '入力データが制約に違反しています' });
    }
    
    // デフォルトメッセージ
    return t('errors.unknownError', { defaultValue: `エラーが発生しました: ${errorMessage}` });
  }, [t]);

  /**
   * エラーをログに記録
   */
  const logError = useCallback((
    error: Error | string, 
    severity: ErrorSeverity = 'error',
    context?: ErrorContext
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const timestamp = new Date().toISOString();
    
    console.group(`🚨 [${severity.toUpperCase()}] ${timestamp}`);
    console.error('Error:', errorMessage);
    if (typeof error === 'object' && error.stack) {
      console.error('Stack:', error.stack);
    }
    if (context) {
      console.info('Context:', context);
    }
    console.groupEnd();
    
    // 本番環境では外部ログサービスに送信することも可能
    // if (process.env.NODE_ENV === 'production') {
    //   // 外部ログサービスへの送信
    // }
  }, []);

  /**
   * ユーザーフレンドリーなエラー表示
   */
  const showError = useCallback((
    error: Error | string,
    title?: string,
    context?: ErrorContext
  ) => {
    const message = translateError(error);
    logError(error, 'error', context);
    
    Alert.alert(title || t('common.error'), message, [
      { text: t('common.ok'), style: 'default' }
    ]);
  }, [translateError, logError, t]);

  /**
   * 成功メッセージ表示
   */
  const showSuccess = useCallback((
    message: string,
    title?: string
  ) => {
    Alert.alert(title || t('common.success'), message, [
      { text: t('common.ok'), style: 'default' }
    ]);
  }, [t]);

  /**
   * 警告メッセージ表示
   */
  const showWarning = useCallback((
    message: string,
    title?: string
  ) => {
    Alert.alert(title || t('common.warning'), message, [
      { text: t('common.ok'), style: 'default' }
    ]);
  }, [t]);

  /**
   * 確認ダイアログ
   */
  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title?: string
  ) => {
    Alert.alert(title || t('common.confirm'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), style: 'default', onPress: onConfirm }
    ]);
  }, [t]);

  /**
   * 非同期関数のエラーハンドリングラッパー
   */
  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorMessage = customErrorMessage || (error instanceof Error ? error.message : t('errors.unknownError'));
      showError(errorMessage, undefined, context);
      return null;
    }
  }, [showError, t]);

  return {
    translateError,
    logError,
    showError,
    showSuccess,
    showWarning,
    showConfirm,
    handleAsync,
  };
}