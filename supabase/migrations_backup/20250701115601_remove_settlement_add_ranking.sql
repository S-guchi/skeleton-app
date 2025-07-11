-- Remove settlement related tables and add ranking functionality

-- Drop settlement_items table first (has foreign key constraints)
DROP TABLE IF EXISTS settlement_items CASCADE;

-- Drop settlements table
DROP TABLE IF EXISTS settlements CASCADE;

-- Drop settlement_groups table
DROP TABLE IF EXISTS settlement_groups CASCADE;

-- Remove settlementGroupId column from household_members
ALTER TABLE household_members DROP COLUMN IF EXISTS "settlementGroupId";

-- Create monthly rankings view
CREATE OR REPLACE VIEW monthly_rankings AS
SELECT 
  cl.household_id,
  cl.performed_by as user_id,
  u.name as user_name,
  DATE_TRUNC('month', cl.performed_at) as month,
  COUNT(*) as chore_count,
  SUM(COALESCE(cl.reward_amount, 0)) as total_points
FROM chore_logs cl
JOIN users u ON cl.performed_by = u.id
GROUP BY cl.household_id, cl.performed_by, u.name, DATE_TRUNC('month', cl.performed_at);

-- Create weekly rankings view
CREATE OR REPLACE VIEW weekly_rankings AS
SELECT 
  cl.household_id,
  cl.performed_by as user_id,
  u.name as user_name,
  DATE_TRUNC('week', cl.performed_at) as week,
  COUNT(*) as chore_count,
  SUM(COALESCE(cl.reward_amount, 0)) as total_points
FROM chore_logs cl
JOIN users u ON cl.performed_by = u.id
GROUP BY cl.household_id, cl.performed_by, u.name, DATE_TRUNC('week', cl.performed_at);

-- Create all time rankings view
CREATE OR REPLACE VIEW all_time_rankings AS
SELECT 
  cl.household_id,
  cl.performed_by as user_id,
  u.name as user_name,
  COUNT(*) as chore_count,
  SUM(COALESCE(cl.reward_amount, 0)) as total_points
FROM chore_logs cl
JOIN users u ON cl.performed_by = u.id
GROUP BY cl.household_id, cl.performed_by, u.name;

-- Create function to get household rankings with RLS
CREATE OR REPLACE FUNCTION get_household_rankings(
  p_household_id UUID,
  p_period TEXT DEFAULT 'month',
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  chore_count BIGINT,
  total_points NUMERIC,
  rank INTEGER
) AS $$
BEGIN
  -- Check if user is a household member
  IF NOT EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_id = p_household_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_period = 'all' THEN
    RETURN QUERY
    SELECT 
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
    GROUP BY cl.performed_by, u.name;
  ELSIF p_period = 'custom' AND p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
      AND cl.performed_at >= p_start_date
      AND cl.performed_at < p_end_date + INTERVAL '1 day'
    GROUP BY cl.performed_by, u.name;
  ELSE
    -- Default to current month
    RETURN QUERY
    SELECT 
      cl.performed_by,
      u.name,
      COUNT(*)::BIGINT,
      SUM(COALESCE(cl.reward_amount, 0))::NUMERIC,
      RANK() OVER (ORDER BY SUM(COALESCE(cl.reward_amount, 0)) DESC)::INTEGER
    FROM chore_logs cl
    JOIN users u ON cl.performed_by = u.id
    WHERE cl.household_id = p_household_id
      AND DATE_TRUNC('month', cl.performed_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY cl.performed_by, u.name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;