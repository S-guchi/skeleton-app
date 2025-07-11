import { useQuery } from '@tanstack/react-query';
import { rankingQueries, RankingPeriod } from '@/lib/queries/ranking';
import { useUser } from '@/lib/contexts/UserContext';

export const useRankings = (period: RankingPeriod = 'month') => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['rankings', user?.householdId, period],
    queryFn: () => {
      if (!user?.householdId) throw new Error('No household ID');
      return rankingQueries.getRankings(user.householdId, period);
    },
    enabled: !!user?.householdId,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
};

export const useTopRankings = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['rankings', user?.householdId, 'top'],
    queryFn: () => {
      if (!user?.householdId) throw new Error('No household ID');
      return rankingQueries.getTopRankings(user.householdId);
    },
    enabled: !!user?.householdId,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
};