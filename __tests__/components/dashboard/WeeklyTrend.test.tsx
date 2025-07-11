import { WeeklyTrend } from '@/components/dashboard/WeeklyTrend';
import { render } from '@testing-library/react-native';
import React from 'react';

// Localization mock
jest.mock('@/lib/hooks/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string, params?: any) => {
      if (key === 'home.weeklyTrend') return '1週間の家事';
      if (key === 'home.times') return `${params?.count || 0}回`;
      return key;
    },
  }),
}));

describe('WeeklyTrend Component', () => {
  it('renders weekly trend with data', () => {
    const mockData = [
      { date: '7/1', count: 3, points: 15 },
      { date: '7/2', count: 2, points: 10 },
      { date: '7/3', count: 1, points: 5 },
      { date: '7/4', count: 0, points: 0 },
      { date: '7/5', count: 4, points: 20 },
      { date: '7/6', count: 2, points: 8 },
      { date: '7/7', count: 1, points: 3 },
    ];

    const { getByText } = render(<WeeklyTrend weeklyTrend={mockData} />);

    // Check title
    expect(getByText('1週間の家事')).toBeTruthy();

    // Check dates
    expect(getByText('7/1')).toBeTruthy();
    expect(getByText('7/4')).toBeTruthy();

    // Check counts
    expect(getByText('3回')).toBeTruthy();
    expect(getByText('0回')).toBeTruthy();
  });

  it('displays 0 counts when no chores are performed', () => {
    const mockDataWithZeros = [
      { date: '7/1', count: 0, points: 0 },
      { date: '7/2', count: 0, points: 0 },
      { date: '7/3', count: 0, points: 0 },
      { date: '7/4', count: 0, points: 0 },
      { date: '7/5', count: 0, points: 0 },
      { date: '7/6', count: 0, points: 0 },
      { date: '7/7', count: 0, points: 0 },
    ];

    const { getByText, getAllByText } = render(
      <WeeklyTrend weeklyTrend={mockDataWithZeros} />
    );

    // Check title is still displayed
    expect(getByText('1週間の家事')).toBeTruthy();

    // Check all dates are displayed
    expect(getByText('7/1')).toBeTruthy();
    expect(getByText('7/7')).toBeTruthy();

    // Check all counts show 0
    const zeroCounts = getAllByText('0回');
    expect(zeroCounts).toHaveLength(7);
  });

  it('handles empty weekly trend data', () => {
    const { getByText } = render(<WeeklyTrend weeklyTrend={[]} />);

    // Title should still be displayed
    expect(getByText('1週間の家事')).toBeTruthy();
  });

  it('displays minimum bar height for days with zero activity', () => {
    const mockDataWithZeros = [
      { date: '7/1', count: 0, points: 0 },
      { date: '7/2', count: 1, points: 5 },
    ];

    const { getByText } = render(<WeeklyTrend weeklyTrend={mockDataWithZeros} />);

    // Should display both dates and counts
    expect(getByText('7/1')).toBeTruthy();
    expect(getByText('7/2')).toBeTruthy();
    expect(getByText('0回')).toBeTruthy();
    expect(getByText('1回')).toBeTruthy();
  });
});
