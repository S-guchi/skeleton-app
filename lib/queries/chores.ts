import { supabase } from '@/lib/supabase';
import type { Chore, ChoreLog, TablesInsert } from '@/lib/types/supabase';

/**
 * 世帯の家事一覧を取得（アクティブなもののみ）
 */
export async function getChoresByHousehold(householdId: string): Promise<Chore[]> {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * アクティブな家事のみを取得
 */
export async function getActiveChores(householdId: string): Promise<Chore[]> {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * 家事を作成
 */
export async function createChore(choreData: {
  householdId: string;
  name: string;
  rewardAmount: number;
  createdBy: string;
}): Promise<Chore> {
  const insertData: TablesInsert<'chores'> = {
    household_id: choreData.householdId,
    name: choreData.name,
    reward_amount: choreData.rewardAmount,
    created_by: choreData.createdBy,
    order_index: 0,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('chores')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 家事を更新
 */
export async function updateChore(
  id: string,
  updates: { name?: string; rewardAmount?: number; isActive?: boolean }
): Promise<Chore> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.rewardAmount !== undefined) updateData.reward_amount = updates.rewardAmount;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('chores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 家事を削除（論理削除）
 */
export async function deleteChore(id: string): Promise<void> {
  const { error } = await supabase
    .from('chores')
    .update({ 
      is_active: false, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * 家事ログを作成
 */
export async function createChoreLog(logData: {
  householdId: string;
  choreId: string;
  userId: string;
  rewardAmount: number;
  completedAt?: Date;
  note?: string;
}): Promise<ChoreLog> {
  const insertData: TablesInsert<'chore_logs'> = {
    household_id: logData.householdId,
    chore_id: logData.choreId,
    performed_by: logData.userId,
    reward_amount: logData.rewardAmount,
    performed_at: logData.completedAt?.toISOString() || new Date().toISOString(),
    note: logData.note,
  };

  const { data, error } = await supabase
    .from('chore_logs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 期間内の家事ログを取得（ユーザー情報付き）
 */
export async function getChoreLogsWithUser(
  householdId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('chore_logs')
    .select(`
      *,
      users:performed_by (id, name, avatar_url),
      chores:chore_id (id, name, household_id, reward_amount)
    `)
    .gte('performed_at', startDate.toISOString())
    .lt('performed_at', endDate.toISOString())
    .eq('chores.household_id', householdId)
    .order('performed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data?.map(row => ({
    ...row,
    performed_at: new Date(row.performed_at),
    user: row.users ? {
      id: row.users.id,
      name: row.users.name,
      avatarUrl: row.users.avatar_url,
    } : null,
    chore: row.chores ? {
      id: row.chores.id,
      name: row.chores.name,
      reward_amount: row.chores.reward_amount,
    } : null,
  })) || [];
}

/**
 * 世帯の家事ログ総数を取得
 */
export async function getChoreLogsTotalCount(householdId: string): Promise<number> {
  const { count, error } = await supabase
    .from('chore_logs')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }

  return count || 0;
}