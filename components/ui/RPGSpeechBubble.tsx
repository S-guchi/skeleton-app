import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface RPGSpeechBubbleProps {
  message: string;
  typeSpeed?: number; // ms per character
  onComplete?: () => void;
  bubbleStyle?: 'right' | 'left'; // 吹き出しの向き
}

export const RPGSpeechBubble: React.FC<RPGSpeechBubbleProps> = ({
  message,
  typeSpeed = 60,
  onComplete,
  bubbleStyle = 'right'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const currentIndex = useRef(0);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const isInitialized = useRef(false);

  // 統合されたメッセージ表示制御
  useEffect(() => {
    // 既存のタイマーを確実にクリア
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    
    // 状態を完全にリセット
    setDisplayedText('');
    setIsComplete(false);
    currentIndex.current = 0;
    
    if (!message) return;

    const startAnimation = () => {
      setShowBubble(true);
      bubbleAnim.setValue(0);
      
      Animated.spring(bubbleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start(() => {
        startTyping();
      });
    };

    if (!isInitialized.current) {
      // 初回のみ少し遅延
      const timer = setTimeout(startAnimation, 300);
      isInitialized.current = true;
      return () => clearTimeout(timer);
    } else {
      // メッセージ変更時は即座に開始
      startAnimation();
    }
  }, [message]);

  const startTyping = () => {
    if (currentIndex.current < message.length) {
      animationRef.current = setTimeout(() => {
        setDisplayedText(message.slice(0, currentIndex.current + 1));
        currentIndex.current += 1;
        
        // 軽い文字追加エフェクト
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();

        startTyping();
      }, typeSpeed);
    } else {
      // 表示完了時の処理
      setIsComplete(true);
      onComplete?.();
    }
  };

  const handleTap = () => {
    if (isComplete) {
      // タイピング完了後のタップで次のメッセージ
      onComplete?.();
    }
  };

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  if (!showBubble) {
    return null;
  }

  return (
    <Animated.View
      style={{
        transform: [
          { scale: bubbleAnim },
          { scale: bounceAnim }
        ],
        opacity: bubbleAnim
      }}
    >
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.8}
        className="relative"
      >
        {/* 吹き出し本体 */}
        <View className="bg-white dark:bg-gray-100 border-2 border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3 flex-1 min-w-[120px]">
          <Text 
            className="text-gray-800 dark:text-gray-800 text-sm font-medium leading-5"
            style={{ minHeight: 20 }}
          >
            {displayedText}
            {!isComplete && (
              <Text className="text-pink-500 animate-pulse">|</Text>
            )}
          </Text>
        </View>

        {/* 吹き出しの尻尾 */}
        {bubbleStyle === 'right' && (
          <View className="absolute -right-1 top-1/2 -translate-y-1/2">
            <View 
              className="w-0 h-0 border-l-[12px] border-l-white dark:border-l-gray-100 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
            />
            <View 
              className="absolute -right-[2px] top-0 w-0 h-0 border-l-[12px] border-l-gray-800 dark:border-l-gray-700 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
            />
          </View>
        )}

        {bubbleStyle === 'left' && (
          <View className="absolute -left-1 top-1/2 -translate-y-1/2">
            <View 
              className="w-0 h-0 border-r-[12px] border-r-white dark:border-r-gray-100 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
            />
            <View 
              className="absolute -left-[2px] top-0 w-0 h-0 border-r-[12px] border-r-gray-800 dark:border-r-gray-700 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
            />
          </View>
        )}

      </TouchableOpacity>
    </Animated.View>
  );
};