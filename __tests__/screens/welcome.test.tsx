import WelcomeScreen from '@/app/welcome';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })), // iPhone SE size
    },
  };
});

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('スクロール機能', () => {
    it('ScrollViewコンポーネントが存在する', () => {
      render(<WelcomeScreen />);

      // ScrollViewが存在することを確認
      const scrollView = screen.getByTestId('welcome-scroll-view');
      expect(scrollView).toBeTruthy();
    });

    it('ScrollViewのpropsが正しく設定されている', () => {
      render(<WelcomeScreen />);

      const scrollView = screen.getByTestId('welcome-scroll-view');

      // showsVerticalScrollIndicatorがfalseであることを確認
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);

      // contentContainerStyleが設定されていることを確認
      expect(scrollView.props.contentContainerStyle).toBeDefined();
    });

    it('すべてのコンテンツがScrollView内に配置されている', () => {
      render(<WelcomeScreen />);

      // タイトルが存在することを確認
      expect(screen.getByText('Skeleton App')).toBeTruthy();

      // カルーセルスライドのタイトルが存在することを確認
      expect(screen.getByText('ようこそ！')).toBeTruthy();

      // ボタンが存在することを確認
      expect(screen.getByText('はじめる')).toBeTruthy();
      expect(screen.getByText('ログイン')).toBeTruthy();
    });

    it('カルーセルエリアの高さが動的に設定されている', () => {
      render(<WelcomeScreen />);

      const carouselArea = screen.getByTestId('carousel-area');

      // flex: 1 または動的な高さが設定されていることを確認
      expect(carouselArea.props.style).toEqual(
        expect.objectContaining({
          minHeight: expect.any(Number),
        })
      );
    });

    it('ボタンエリアが適切な最小高さを持つ', () => {
      render(<WelcomeScreen />);

      const buttonArea = screen.getByTestId('button-area');

      // 最小高さが設定されていることを確認
      expect(buttonArea.props.style).toEqual(
        expect.objectContaining({
          minHeight: expect.any(Number),
        })
      );
    });
  });

  describe('コンテンツアクセシビリティ', () => {
    it('小さい画面でもすべてのコンテンツにアクセス可能', () => {
      // 小さい画面サイズでテスト（iPhone SE）
      render(<WelcomeScreen />);

      // すべてのメインコンテンツが表示されることを確認
      expect(screen.getByText('はじめる')).toBeTruthy();
      expect(screen.getByText('ログイン')).toBeTruthy();
    });
  });
});
