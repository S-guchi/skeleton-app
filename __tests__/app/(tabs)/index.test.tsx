import HomeScreen from '@/app/(app)/(tabs)/index';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));


// Mock session context
jest.mock('@/lib/contexts/SessionContext', () => ({
  useSession: () => ({
    session: { user: { is_anonymous: false } },
    isAuthLoading: false,
  }),
}));

// Mock user context
jest.mock('@/lib/contexts/UserContext', () => ({
  useUser: () => ({
    user: { name: 'Test User' },
    isUserLoading: false,
  }),
}));

// Mock localization hook
jest.mock('@/lib/hooks/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string, params?: { [key: string]: any }) => {
      const translations: { [key: string]: string } = {
        'home.title': 'ホーム',
        'home.monthlyPoints': `${params?.month || 7}月の家事ポイント`,
        'home.weeklyTrend': '1週間の家事',
      };
      return translations[key] || key;
    },
    deviceTimeZone: 'Asia/Tokyo',
    deviceRegion: 'JP',
    getCurrentTimeInDeviceTimeZone: () => '2024-07-01 12:00:00',
  }),
}));

// Mock dashboard hook
jest.mock('@/lib/hooks/useDashboard', () => ({
  useDashboard: jest.fn(() => ({
    monthlyStats: [
      { memberId: '1', memberName: 'Test User', totalPoints: 100, count: 5 },
    ],
    weeklyTrend: [
      { date: '2024-07-01', count: 2 },
      { date: '2024-07-02', count: 3 },
    ],
    isLoading: false,
    error: null,
  })),
}));

// Mock ranking hook
jest.mock('@/lib/hooks/useRanking', () => ({
  useTopRankings: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock RankingPreview
jest.mock('@/components/dashboard/RankingPreview', () => ({
  RankingPreview: () => null,
}));

// Note: MonthlySummaryコンポーネントは削除されたため、モックは不要

jest.mock('@/components/dashboard/WeeklyTrend', () => {
  return function MockWeeklyTrend() {
    const { Text } = require('react-native');
    return <Text>1週間の家事</Text>;
  };
});

jest.mock('@/components/dashboard/RankingPreview', () => {
  return function MockRankingPreview() {
    const { Text } = require('react-native');
    return <Text>ランキング</Text>;
  };
});

describe('HomeScreen - MonthlySummary削除テスト', () => {
  it('「7月の家事ポイント」セクション（MonthlySummary）が表示されない', () => {
    render(<HomeScreen />);

    // 「7月の家事ポイント」テキストが表示されないことを確認
    expect(() => screen.getByText('7月の家事ポイント')).toThrow();
  });

  it('1週間の家事セクションは引き続き表示される', () => {
    render(<HomeScreen />);

    // 1週間の家事セクションは残っていることを確認
    expect(screen.getByText('1週間の家事')).toBeTruthy();
  });
});

describe('HomeScreen - 1週間の家事0回表示テスト', () => {
  beforeEach(() => {
    // 家事が0回の場合のモックデータに変更
    const mockUseDashboard = require('@/lib/hooks/useDashboard').useDashboard;
    mockUseDashboard.mockReturnValue({
      monthlyStats: [],
      weeklyTrend: [
        { date: '7/1', count: 0, points: 0 },
        { date: '7/2', count: 0, points: 0 },
        { date: '7/3', count: 0, points: 0 },
        { date: '7/4', count: 0, points: 0 },
        { date: '7/5', count: 0, points: 0 },
        { date: '7/6', count: 0, points: 0 },
        { date: '7/7', count: 0, points: 0 },
      ],
      recentActivities: [],
      isLoading: false,
      error: null,
      formatTimeAgo: (date: Date | string) => 'formatted time',
    });
  });

  it('家事が0回でも1週間の家事が表示される', () => {
    render(<HomeScreen />);

    // 1週間の家事セクションが表示されることを確認
    expect(screen.getByText('1週間の家事')).toBeTruthy();
  });
});
