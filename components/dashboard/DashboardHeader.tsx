import { RPGSpeechBubble } from "@/components/ui/RPGSpeechBubble";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { getMessageByIndex, getNextMessageIndex, getRandomStartIndex } from "@/lib/utils/usakoMessages";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

interface DashboardHeaderProps {
  userName?: string;
  currentMonth: Date;
}

export const DashboardHeader = React.memo<DashboardHeaderProps>(({ userName, currentMonth }) => {
  const { t } = useLocalization();
  const [messageState, setMessageState] = useState(() => {
    const messages = (t('home.usakoMessages') as unknown as string[]) || [];
    const startIndex = getRandomStartIndex(messages);
    return {
      index: startIndex,
      message: getMessageByIndex(startIndex, messages),
      key: Date.now(), // 強制再マウント用
    };
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const usakoScale = useRef(new Animated.Value(1)).current;

  // メッセージ配列が変更された時の初期化
  useEffect(() => {
    const messages = (t('home.usakoMessages') as unknown as string[]);
    if (messages.length > 0 && !messageState.message) {
      const startIndex = getRandomStartIndex(messages);
      setMessageState({
        index: startIndex,
        message: getMessageByIndex(startIndex, messages),
        key: Date.now(),
      });
    }
  }, [t, messageState.message]);

  const handleUsakoTap = useCallback(() => {
    // 処理中は無効化（debounce）
    if (isProcessing) return;

    setIsProcessing(true);

    // タップ時のアニメーション効果
    Animated.sequence([
      Animated.timing(usakoScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(usakoScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 状態を一括更新（バッチング）
    const messages = (t('home.usakoMessages') as unknown as string[]);
    setMessageState(prevState => {
      const nextIndex = getNextMessageIndex(prevState.index, messages);
      return {
        index: nextIndex,
        message: getMessageByIndex(nextIndex, messages),
        key: Date.now(), // 強制再マウント
      };
    });

    // 短時間後に処理フラグをリセット
    setTimeout(() => setIsProcessing(false), 500);
  }, [isProcessing, t, usakoScale]);

  return (
    <View className="bg-usako-primary dark:bg-pink-600 px-5 pt-16 pb-6">
      {/* うさこと吹き出しエリア */}
      <View className="flex-row items-start justify-between mb-4">
        {/* RPG風吹き出し - 左端まで広げる */}
        <View className="flex-1 mr-2 mt-2">
          {messageState.message && (
            <RPGSpeechBubble
              key={messageState.key} // 強制再マウント
              message={messageState.message}
              typeSpeed={70}
              bubbleStyle="right"
            />
          )}
        </View>

        {/* うさこキャラクター */}
        <TouchableOpacity
          onPress={handleUsakoTap}
          activeOpacity={0.8}
          className="items-center"
          disabled={isProcessing}
        >
          <Animated.View style={{
            transform: [{ scale: usakoScale }],
            opacity: isProcessing ? 0.6 : 1
          }}>
            <Image
              source={require('@/assets/images/usako_home.png')}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* タップヒント */}
          <View className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <Text className="text-xs text-white/70 text-center">
              {isProcessing ? '表示中...' : 'タップで次へ'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

DashboardHeader.displayName = 'DashboardHeader';
