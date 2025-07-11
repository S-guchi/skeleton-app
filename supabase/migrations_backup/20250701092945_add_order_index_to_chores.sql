-- Add order_index column to chores table for sorting
-- Created: 2025-07-01

-- Add order_index column to chores table
ALTER TABLE public.chores 
ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_chores_order_index ON public.chores(order_index);

-- Update existing chores with sequential order_index values
-- This ensures existing chores have proper ordering
UPDATE public.chores 
SET order_index = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY household_id ORDER BY created_at) as row_number
  FROM public.chores
) as subquery 
WHERE public.chores.id = subquery.id;

-- Add comment for documentation
COMMENT ON COLUMN public.chores.order_index IS 'Order index for sorting chores within a household';