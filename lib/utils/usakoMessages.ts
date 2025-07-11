/**
 * うさこのメッセージをランダムに選択するユーティリティ
 */

export function getRandomUsakoMessage(messages: string[]): string {
  if (!messages || messages.length === 0) {
    return "お疲れさまうさ〜！"; // フォールバック
  }
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * ランダムな開始インデックスを取得
 */
export function getRandomStartIndex(messages: string[]): number {
  if (!messages || messages.length === 0) {
    return 0;
  }
  return Math.floor(Math.random() * messages.length);
}

/**
 * 次のメッセージのインデックスを取得（循環）
 */
export function getNextMessageIndex(currentIndex: number, messages: string[]): number {
  if (!messages || messages.length === 0) {
    return 0;
  }
  return (currentIndex + 1) % messages.length;
}

/**
 * インデックスに基づいてメッセージを取得
 */
export function getMessageByIndex(index: number, messages: string[]): string {
  if (!messages || messages.length === 0) {
    return "お疲れさまうさ〜！"; // フォールバック
  }
  if (index < 0 || index >= messages.length) {
    return messages[0]; // 安全なフォールバック
  }
  return messages[index];
}

/**
 * 時間帯に応じたメッセージを取得（将来的な拡張用）
 */
export function getTimeBasedUsakoMessage(messages: string[]): string {
  const hour = new Date().getHours();
  
  // 時間帯別のメッセージインデックス（将来的な機能拡張用）
  if (hour >= 6 && hour < 12) {
    // 朝: 元気なメッセージを優先
    return getRandomUsakoMessage(messages);
  } else if (hour >= 12 && hour < 18) {
    // 昼: 中間のメッセージ
    return getRandomUsakoMessage(messages);
  } else {
    // 夜: お疲れ様メッセージを優先
    return getRandomUsakoMessage(messages);
  }
}