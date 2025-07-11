import React, { useRef, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { UsakoIcon } from "@/components/ui/UsakoIcon";

export function UsakoMessage() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim]);
  return (
    <Animated.View
      style={{
        transform: [{ scale: bounceAnim }],
        opacity: bounceAnim
      }}
      className="mt-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg"
    >
      <View className="flex-row items-start">
        <UsakoIcon size="medium" style={{ marginRight: 12, marginTop: 2 }} />
        <View className="flex-1">
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            今日も家事お疲れさまうさ〜！
            みんなで協力して、楽しい生活を送りましょううさ〜
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
