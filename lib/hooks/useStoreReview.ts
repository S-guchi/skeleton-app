import { useCallback, useEffect, useState } from 'react';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';
import { useStorageState } from '@/lib/contexts/useStorageState';
import { useUser } from '@/lib/contexts/UserContext';
// getChoreLogsTotalCount インポートを削除（household機能除去のため）

const STORE_REVIEW_THRESHOLD = 15;
const STORE_REVIEW_KEY = 'has_requested_store_review';
const CHORE_LOGS_COUNT_KEY = 'chore_logs_count';

/**
 * ストアレビュー機能を管理するフック
 * ローカルカウンターで家事記録数を管理し、15個に到達したタイミングでストアレビューを促す
 */
export function useStoreReview() {
  const { user } = useUser();
  const [hasRequestedReview, setHasRequestedReview] = useStorageState(STORE_REVIEW_KEY);
  const [choreLogsCount, setChoreLogsCount] = useStorageState(CHORE_LOGS_COUNT_KEY);
  const [isCheckingReview, setIsCheckingReview] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初回のみローカルカウンターを初期化
   */
  useEffect(() => {
    const initializeCounter = async () => {
      if (!user?.id || isInitialized || choreLogsCount?.[1]) return;

      try {
        // ユーザーベースのカウンターを0で初期化
        await setChoreLogsCount('0');
        setIsInitialized(true);
      } catch (error) {
        console.error('家事ログカウンター初期化エラー:', error);
        // エラーの場合は0から開始
        await setChoreLogsCount('0');
        setIsInitialized(true);
      }
    };

    initializeCounter();
  }, [user?.id, choreLogsCount, setChoreLogsCount, isInitialized]);

  /**
   * ストアレビューリクエストを実行
   */
  const requestStoreReview = useCallback(async () => {
    if (isCheckingReview) return;
    
    setIsCheckingReview(true);
    
    try {
      // Webプラットフォームではストアレビューをサポートしない
      if (Platform.OS === 'web') {
        setIsCheckingReview(false);
        return;
      }

      // ストアレビューが利用可能かチェック
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.log('ストアレビューは利用できません');
        setIsCheckingReview(false);
        return;
      }

      // レビューアクションが可能かチェック
      const hasAction = await StoreReview.hasAction();
      if (!hasAction) {
        console.log('ストアレビューアクションは利用できません');
        setIsCheckingReview(false);
        return;
      }

      // ストアレビューをリクエスト
      await StoreReview.requestReview();
      console.log('ストアレビューをリクエストしました');

      // フラグを設定して今後表示しないようにする
      await setHasRequestedReview('true');
      
    } catch (error) {
      console.error('ストアレビューリクエストエラー:', error);
    } finally {
      setIsCheckingReview(false);
    }
  }, [setHasRequestedReview, isCheckingReview]);

  /**
   * 家事記録時にカウンターを増加させ、閾値チェック
   */
  const incrementAndCheckReview = useCallback(async (incrementBy: number = 1) => {
    // 既にレビューをリクエストしている場合は何もしない
    if (hasRequestedReview?.[1] === 'true') {
      return;
    }

    // カウンターが初期化されていない場合は何もしない
    if (!choreLogsCount?.[1]) {
      return;
    }

    // カウンターをインクリメント
    const currentCount = parseInt(choreLogsCount[1], 10) || 0;
    const newCount = currentCount + incrementBy;
    await setChoreLogsCount(newCount.toString());

    // 閾値に到達した場合はストアレビューをリクエスト
    if (newCount >= STORE_REVIEW_THRESHOLD) {
      await requestStoreReview();
    }
  }, [hasRequestedReview, choreLogsCount, setChoreLogsCount, requestStoreReview]);

  /**
   * カウンターをリセット
   */
  const resetCounter = useCallback(async () => {
    if (!user?.id) return;

    try {
      await setChoreLogsCount('0');
    } catch (error) {
      console.error('カウンターリセットエラー:', error);
    }
  }, [user?.id, setChoreLogsCount]);

  return {
    incrementAndCheckReview,
    resetCounter,
    hasRequestedReview: hasRequestedReview?.[1] === 'true',
    isCheckingReview,
    currentCount: parseInt(choreLogsCount?.[1] || '0', 10),
    isInitialized,
  };
}