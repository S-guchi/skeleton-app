import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Image, 
  Dimensions,
  StatusBar
} from 'react-native';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { getRandomUsakoMessage } from '@/lib/utils/usakoMessages';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  choreCount: number;
  choreNames?: string[];
}

const USAKO_IMAGES = [
  require('@/assets/images/usako/usako_saraarai.png'),
  require('@/assets/images/usako/usako_sentaku.png'),
  require('@/assets/images/usako/usako_korokoro.png'),
  require('@/assets/images/usako/usako_hataki.png'),
  require('@/assets/images/usako/usako_kaimono.png'),
  require('@/assets/images/usako/usako_kyukei.png'),
  require('@/assets/images/usako/usako_mizuyari.png'),
  require('@/assets/images/usako/usako_neru.png'),
  require('@/assets/images/usako/usako_nomikai.png'),
  require('@/assets/images/usako/usako_siboru.png'),
];

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  choreCount,
  choreNames = []
}) => {
  const { t } = useLocalization();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // アニメーション値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // キラキラエフェクト用のアニメーション配列
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // ランダムな画像を選択
      const randomIndex = Math.floor(Math.random() * USAKO_IMAGES.length);
      setCurrentImageIndex(randomIndex);

      // メッセージを選択
      const multipleMessages = [
        "まとめて%{count}個も！？\nすごすぎるうさ〜！✨",
        "一度に%{count}個なんて\n家事マスターうさ〜！🌟",
        "%{count}個も頑張って\n本当にお疲れさまうさ〜！💖",
        "効率的に%{count}個完了！\n素晴らしいうさ〜！👏"
      ];
      
      const singleMessages = [
        "素晴らしいうさ〜！✨\nとってもきれいになったうさ〜！",
        "がんばったうさね〜！🌟\nピカピカうさ〜♪",
        "お疲れさまでしたうさ〜！💖\n家がきれいで気持ちいいうさ〜！",
        "すごいうさ〜！👏\nあなたのおかげでお家が輝いてるうさ〜！",
        "えらいうさ〜！🎉\nこんなにがんばってくれてありがとううさ〜！",
        "最高うさ〜！✨\n家事の達人うさね〜！",
        "感動したうさ〜！😊\nとっても助かったうさ〜！",
        "完璧うさ〜！🌈\nみんなが喜んでるうさ〜！"
      ];
      
      const messages = choreCount > 1 ? multipleMessages : singleMessages;
      const selectedMessage = choreCount > 1
        ? getRandomUsakoMessage(messages).replace('%{count}', choreCount.toString())
        : getRandomUsakoMessage(messages);
      
      setCelebrationMessage(selectedMessage);

      // アニメーション開始
      startAnimation();

      // 4秒後に自動で閉じる
      const autoCloseTimer = setTimeout(() => {
        closeModal();
      }, 4000);

      return () => clearTimeout(autoCloseTimer);
    } else {
      // リセット
      setShowMessage(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      messageAnim.setValue(0);
      sparkleAnim.setValue(0);
      bounceAnim.setValue(1);
      sparkleAnims.forEach(anim => {
        anim.opacity.setValue(0);
        anim.scale.setValue(0);
      });
    }
  }, [visible, choreCount]);

  const startAnimation = () => {
    // メイン画像のアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // うさこの登場アニメーション完了後、メッセージ表示
      setShowMessage(true);
      
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // バウンスアニメーション
      startBounceAnimation();
      
      // キラキラエフェクト開始
      startSparkleAnimation();
    });
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();
  };

  const startSparkleAnimation = () => {
    // キラキラエフェクトを順次開始
    sparkleAnims.forEach((anim, index) => {
      const delay = index * 200;
      const randomX = (Math.random() - 0.5) * screenWidth * 0.8;
      const randomY = (Math.random() - 0.5) * screenHeight * 0.6;
      
      anim.translateX.setValue(randomX);
      anim.translateY.setValue(randomY);
      
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.spring(anim.scale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          { iterations: -1 }
        ).start();
      }, delay);
    });
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <TouchableOpacity 
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={closeModal}
      >
        <Animated.View 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeAnim,
          }}
        >
          {/* キラキラエフェクト */}
          {sparkleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                opacity: anim.opacity,
                transform: [
                  { scale: anim.scale },
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                ],
              }}
            >
              <Text style={{ fontSize: 30, color: '#FFD700' }}>✨</Text>
            </Animated.View>
          ))}

          {/* メインコンテンツ */}
          <Animated.View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              transform: [
                { scale: scaleAnim },
                { scale: bounceAnim }
              ],
            }}
          >
            {/* うさこ画像 */}
            <Image
              source={USAKO_IMAGES[currentImageIndex]}
              style={{
                width: 200,
                height: 200,
                marginBottom: 20,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              resizeMode="contain"
            />

            {/* お疲れ様タイトル */}
            <View
              style={{
                backgroundColor: '#FFE4E1',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                marginBottom: 20,
                borderWidth: 3,
                borderColor: '#FF69B4',
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#FF1493',
                  textAlign: 'center',
                }}
              >
                {t('record.celebration.title')}
              </Text>
            </View>

            {/* 褒めメッセージ */}
            {showMessage && (
              <Animated.View
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderRadius: 16,
                  marginHorizontal: 20,
                  maxWidth: screenWidth * 0.8,
                  borderWidth: 2,
                  borderColor: '#FF69B4',
                  opacity: messageAnim,
                  transform: [
                    {
                      translateY: messageAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#333',
                    textAlign: 'center',
                    lineHeight: 26,
                  }}
                >
                  {celebrationMessage}
                </Text>
              </Animated.View>
            )}

            {/* タップで続ける */}
            {showMessage && (
              <Animated.View
                style={{
                  marginTop: 30,
                  opacity: messageAnim,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#FFF',
                    textAlign: 'center',
                    opacity: 0.8,
                  }}
                >
                  {t('record.celebration.tapToContinue')}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};