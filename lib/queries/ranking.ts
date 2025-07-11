import { supabase } from '@/lib/supabase';

export interface RankingItem {
  userId: string;
  userName: string;
  choreCount: number;
  totalPoints: number;
  rank: number;
}

export type RankingPeriod = 'today' | 'week' | 'month' | 'lastMonth' | 'all';

export const rankingQueries = {
  // フォールバック: chore_logsから直接集計
  getFallbackRankings: async (householdId: string, period: RankingPeriod = 'month'): Promise<RankingItem[]> => {
    console.log('🏆 フォールバックランキング開始:', { householdId, period });
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
        // 全期間（制限なし）
        const { data: allLogs, error: allError } = await supabase
          .from('chore_logs')
          .select(`
            performed_by,
            reward_amount,
            users:performed_by (
              id,
              name
            )
          `)
          .eq('household_id', householdId);

        if (allError) {
          console.error('🚨 フォールバック全期間エラー:', allError);
          throw allError;
        }

        const aggregated = allLogs.reduce((acc: any, log: any) => {
          const userId = log.performed_by;
          const userName = log.users?.name || 'Unknown';
          const points = log.reward_amount || 0;

          if (!acc[userId]) {
            acc[userId] = {
              userId,
              userName,
              choreCount: 0,
              totalPoints: 0
            };
          }
          acc[userId].choreCount++;
          acc[userId].totalPoints += points;
          return acc;
        }, {});

        return Object.values(aggregated)
          .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
          .map((item: any, index: number) => ({
            ...item,
            rank: index + 1
          }));
    }

    // 期間指定の場合
    const { data: logs, error } = await supabase
      .from('chore_logs')
      .select(`
        performed_by,
        reward_amount,
        users:performed_by (
          id,
          name
        )
      `)
      .eq('household_id', householdId)
      .gte('performed_at', startDate.toISOString())
      .lt('performed_at', endDate.toISOString());

    if (error) {
      console.error('🚨 フォールバック期間指定エラー:', error);
      throw error;
    }

    const aggregated = logs.reduce((acc: any, log: any) => {
      const userId = log.performed_by;
      const userName = log.users?.name || 'Unknown';
      const points = log.reward_amount || 0;

      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName,
          choreCount: 0,
          totalPoints: 0
        };
      }
      acc[userId].choreCount++;
      acc[userId].totalPoints += points;
      return acc;
    }, {});

    return Object.values(aggregated)
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .map((item: any, index: number) => ({
        ...item,
        rank: index + 1
      }));
  },

  // ランキングデータを取得
  getRankings: async (householdId: string, period: RankingPeriod = 'month'): Promise<RankingItem[]> => {
    console.log('🏆 ランキングクエリ開始:', { householdId, period });
    
    // 一時的にフォールバックのみを使用してテスト
    console.log('🏆 一時的にフォールバック機能のみを使用');
    return rankingQueries.getFallbackRankings(householdId, period);
    
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜始まり
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
        // 全期間の場合は関数内で処理
        console.log('🏆 全期間ランキング取得中...');
        const { data, error } = await supabase.rpc('get_household_rankings', {
          p_household_id: householdId,
          p_period: 'all'
        });

        if (error) {
          console.error('🚨 全期間ランキングエラー:', error);
          throw error;
        }
        
        console.log('🏆 全期間ランキング結果:', data);
        return (data || []).map((item: any) => ({
          userId: item.user_id,
          userName: item.user_name,
          choreCount: item.chore_count,
          totalPoints: item.total_points,
          rank: item.rank
        }));
    }

    // 期間指定の場合
    console.log('🏆 期間指定ランキング取得中...', {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    
    const { data, error } = await supabase.rpc('get_household_rankings', {
      p_household_id: householdId,
      p_period: 'custom',
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0]
    });

    if (error) {
      console.error('🚨 期間指定ランキングエラー:', error);
      throw error;
    }
    
      console.log('🏆 期間指定ランキング結果:', data);
      return (data || []).map((item: any) => ({
        userId: item.user_id,
        userName: item.user_name,
        choreCount: item.chore_count,
        totalPoints: item.total_points,
        rank: item.rank
      }));
    } catch (error) {
      console.warn('🏆 RPC関数でエラー、フォールバックを使用:', error);
      // データベース関数が使えない場合はフォールバックを使用
      return rankingQueries.getFallbackRankings(householdId, period);
    }
  },

  // トップ3のランキングを取得（ダッシュボード用）
  getTopRankings: async (householdId: string): Promise<RankingItem[]> => {
    const rankings = await rankingQueries.getRankings(householdId, 'month');
    return rankings.slice(0, 3);
  }
};