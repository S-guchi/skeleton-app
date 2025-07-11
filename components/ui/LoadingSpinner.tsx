import { View, ActivityIndicator, Text } from "react-native";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "large", 
  color = "#3B82F6", 
  text,
  className 
}: LoadingSpinnerProps) {
  return (
    <View className={cn("items-center justify-center", className)}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-600 dark:text-gray-400 mt-2 text-center">
          {text}
        </Text>
      )}
    </View>
  );
}

export function FullScreenLoader({ text = "読み込み中..." }: { text?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <LoadingSpinner text={text} />
    </View>
  );
}