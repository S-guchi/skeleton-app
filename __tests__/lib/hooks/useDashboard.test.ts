import { renderHook, waitFor } from '@testing-library/react-native';
import { useDashboard } from '@/lib/hooks/useDashboard';

// Mock dependencies
jest.mock('@/lib/hooks/useHouseholdData', () => ({
  useHouseholdMembers: () => ({
    data: [],
    isLoading: false,
  }),
}));

jest.mock('@/lib/hooks/useChoreOperations', () => ({
  useChoreLogs: () => ({
    data: [],
    isLoading: false,
  }),
}));

jest.mock('@/lib/contexts/LocalizationContext', () => ({
  useI18n: () => ({
    currentLocale: 'ja',
  }),
}));

jest.mock('@/lib/utils/dateUtils', () => ({
  formatTimeAgo: (date: Date | string, locale: string) => 'formatted time',
}));

describe('useDashboard Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate weekly trend with 7 days even when no chores exist', () => {
    const { result } = renderHook(() => useDashboard());

    // Should have 7 days of data
    expect(result.current.weeklyTrend).toHaveLength(7);
    
    // All days should have 0 count and 0 points
    result.current.weeklyTrend.forEach(day => {
      expect(day.count).toBe(0);
      expect(day.points).toBe(0);
      expect(day.date).toMatch(/^\d{1,2}\/\d{1,2}$/); // Format: M/D or MM/DD
    });
  });

  it('should have dates in correct order (past 7 days)', () => {
    const { result } = renderHook(() => useDashboard());

    const weeklyTrend = result.current.weeklyTrend;
    expect(weeklyTrend).toHaveLength(7);

    // Verify the dates are in ascending order (oldest to newest)
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - (6 - i));
      const expectedDateString = `${expectedDate.getMonth() + 1}/${expectedDate.getDate()}`;
      expect(weeklyTrend[i].date).toBe(expectedDateString);
    }
  });
});