import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        ホーム画面
      </Text>
    </View>
  );
}