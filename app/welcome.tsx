import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signInAnonymously } from "@/lib/services/authService";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// カルーセル用のアプリ説明データ
const appIntroSlides = [
  {
    id: 1,
    title: "ようこそ！",
    description: "あなたのアプリへようこそ！",
    icon: "home",
  },
  {
    id: 2,
    title: "機能1",
    description: "便利な機能を使って\n効率的に作業できます",
    icon: "checkmark-circle",
  },
  {
    id: 3,
    title: "機能2",
    description: "設定をカスタマイズして\nあなた好みに調整できます",
    icon: "settings",
  },
  {
    id: 4,
    title: "始めましょう！",
    description: "さあ、アプリを\n使い始めましょう！",
    icon: "rocket",
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // 利用可能な画面高さを計算（セーフエリアを考慮）
  const availableHeight = screenHeight - insets.top - insets.bottom;

  // 小画面端末かどうかを判定（iPhone SE などの高さ667px以下）
  const isSmallScreen = availableHeight < 750;

  // 動的なサイズ調整
  const slideHeight = isSmallScreen ? 420 : 520;
  const imageSize = isSmallScreen ? 180 : 250;
  const titleFontSize = isSmallScreen ? "text-base" : "text-xl";
  const descriptionFontSize = isSmallScreen ? "text-sm" : "text-base";
  const buttonPadding = isSmallScreen ? "py-3" : "py-4";

  const handleStart = async () => {
    if (isStarting) return; // 重複実行を防ぐ
    
    setIsStarting(true);
    try {
      await signInAnonymously();
      // 認証成功後、少し待ってから遷移（UserContextが更新されるまで）
      setTimeout(() => {
        router.push("/(app)/(tabs)");
      }, 500);
    } catch (error) {
      console.error('匿名認証に失敗しました:', error);
      Alert.alert(
        "エラー",
        "アプリの開始に失敗しました。もう一度お試しください。",
        [{ text: "OK" }]
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleJoinHousehold = () => {
    router.push("/sign-in");
  };

  const renderSlide = ({ item }: { item: typeof appIntroSlides[0] }) => (
    <View style={{ width: screenWidth }} className="items-center justify-center px-6">
      <View
        className={`bg-white rounded-3xl ${isSmallScreen ? 'p-6' : 'p-8'} items-center mx-4`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 8,
          height: slideHeight,
          width: screenWidth - 80,
        }}
      >
        <View className="flex-1 justify-center items-center">
          <View className={isSmallScreen ? "mb-3" : "mb-4"}>
            <View
              className="bg-blue-500 rounded-full items-center justify-center"
              style={{
                width: imageSize,
                height: imageSize,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={imageSize * 0.5}
                color="white"
              />
            </View>
          </View>
          <Text className={`${titleFontSize} font-bold text-gray-800 text-center ${isSmallScreen ? 'mb-2' : 'mb-3'}`}>
            {item.title}
          </Text>
          <Text className={`text-gray-600 text-center ${descriptionFontSize} ${isSmallScreen ? 'leading-5' : 'leading-6'} px-3`}>
            {item.description}
          </Text>
        </View>
      </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View className="flex-1 bg-blue-100" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 justify-between">
        {/* タイトルエリア */}
        <View className={`items-center ${isSmallScreen ? 'py-2' : 'py-4'}`}>
          <Text className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
            Skeleton App
          </Text>
        </View>

        {/* カルーセルエリア */}
        <View
          testID="carousel-area"
          style={{ height: slideHeight }}
          className="justify-center flex-shrink-0"
        >
          <FlatList
            ref={flatListRef}
            data={appIntroSlides}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* ページインジケーター */}
        <View className={`flex-row items-center justify-center space-x-3 ${isSmallScreen ? 'py-2' : 'py-3'}`}>
          {appIntroSlides.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${index === currentSlide
                ? 'w-8 h-2 bg-blue-500'
                : 'w-2 h-2 bg-blue-300'
                }`}
              style={{
                shadowColor: index === currentSlide ? '#3B82F6' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
          ))}
        </View>

        {/* ボタンエリア */}
        <View
          testID="button-area"
          className="px-6 mt-auto"
        >
          {/* はじめるボタン */}
          <TouchableOpacity
            onPress={handleStart}
            disabled={isStarting}
            className={`${isStarting ? 'bg-blue-400' : 'bg-blue-500'} ${buttonPadding} px-6 rounded-2xl ${isSmallScreen ? 'mb-2' : 'mb-3'}`}
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-center">
              {isStarting && (
                <Ionicons 
                  name="refresh" 
                  size={isSmallScreen ? 16 : 20} 
                  color="white" 
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className={`text-white font-bold ${isSmallScreen ? 'text-base' : 'text-lg'} text-center`}>
                {isStarting ? '開始中...' : 'はじめる'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* サインインボタン */}
          <TouchableOpacity
            onPress={handleJoinHousehold}
            className={`border-2 border-blue-300 ${buttonPadding} px-6 rounded-2xl bg-white ${isSmallScreen ? 'mb-2' : 'mb-3'}`}
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className={`text-blue-500 font-semibold ${isSmallScreen ? 'text-base' : 'text-lg'} text-center`}>
              ログイン
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}
