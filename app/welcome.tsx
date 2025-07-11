import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// カルーセル用のアプリ説明データ
const appIntroSlides = [
  {
    id: 1,
    title: "ようこそうさ！",
    description: "一緒に家事をがんばろうね〜！",
    image: require('@/assets/images/usako_dokusyo.png'),
  },
  {
    id: 2,
    title: "お疲れさまうさ〜！",
    description: "やった家事をポチポチ記録するうさ！\nみんなの頑張りが見えるうさよ〜",
    image: require('@/assets/images/usako/usako_saraarai.png'),
  },
  {
    id: 3,
    title: "家事にポイントを設定うさ！",
    description: "家事の大変さに応じてポイントを設定できるうさ〜\nみんなで相談して決めるうさよ！",
    image: require('@/assets/images/usako/usako_sentaku.png'),
  },
  {
    id: 4,
    title: "みんなの頑張りを可視化うさ！",
    description: "誰がどれだけ家事を頑張ったか一目でわかるうさ〜\nグラフやランキングで楽しく確認できるうさよ！",
    image: require('@/assets/images/usako/usako_korokoro.png'),
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const handleStart = () => {
    router.push("/household/create-with-invite");
  };

  const handleJoinHousehold = () => {
    router.push("/household/join-with-invite");
  };

  const handleEmailLogin = () => {
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
          {/* ウェルカムスライドの場合はうさこ画像、それ以外は絵文字 */}
          <View className={isSmallScreen ? "mb-3" : "mb-4"}>
            <Image
              source={item.image}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 28
              }}
              resizeMode="contain"
            />
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
    <View className="flex-1 bg-usako-accent1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 justify-between">
        {/* タイトルエリア */}
        <View className={`items-center ${isSmallScreen ? 'py-2' : 'py-4'}`}>
          <Text className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
            うさこの家事ノート
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
                ? 'w-8 h-2 bg-usako-primary'
                : 'w-2 h-2 bg-usako-secondary'
                }`}
              style={{
                shadowColor: index === currentSlide ? '#FF90BB' : 'transparent',
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
            className={`bg-usako-primary ${buttonPadding} px-6 rounded-2xl ${isSmallScreen ? 'mb-2' : 'mb-3'}`}
            style={{
              shadowColor: '#FF90BB',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className={`text-white font-bold ${isSmallScreen ? 'text-base' : 'text-lg'} text-center`}>
              はじめる
            </Text>
          </TouchableOpacity>

          {/* 招待された方はこちらボタン */}
          <TouchableOpacity
            onPress={handleJoinHousehold}
            className={`border-2 border-usako-secondary ${buttonPadding} px-6 rounded-2xl bg-white ${isSmallScreen ? 'mb-2' : 'mb-3'}`}
            style={{
              shadowColor: '#FF90BB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className={`text-usako-primary font-semibold ${isSmallScreen ? 'text-base' : 'text-lg'} text-center`}>
              招待された方はこちら
            </Text>
          </TouchableOpacity>

          {/* メール認証ログインボタン */}
          <TouchableOpacity
            onPress={handleEmailLogin}
            className={`${buttonPadding} px-6 rounded-2xl bg-usako-accent1 border border-usako-secondary ${isSmallScreen ? 'mb-2' : 'mb-4'}`}
            style={{
              shadowColor: '#FF90BB',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text className={`text-usako-primary text-center ${isSmallScreen ? 'text-sm' : 'text-base'} font-semibold`}>
              メールアドレスでログイン
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
