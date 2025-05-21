/*
  # Fix unique constraints for registrations and selections tables

  1. Changes
    - Remove duplicate records keeping only the most recent entry
    - Add unique constraints on user_id columns
  
  2. Security
    - No changes to RLS policies
*/

-- Remove duplicates from registrations keeping only the most recent record
WITH duplicates AS (
  SELECT user_id, MAX(created_at) as max_created_at
  FROM registrations
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
DELETE FROM registrations r
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE r.user_id = d.user_id
  AND r.created_at < d.max_created_at
);

-- Remove duplicates from meal_selections keeping only the most recent record
WITH duplicates AS (
  SELECT user_id, MAX(created_at) as max_created_at
  FROM meal_selections
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
DELETE FROM meal_selections m
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE m.user_id = d.user_id
  AND m.created_at < d.max_created_at
);

-- Remove duplicates from training_selections keeping only the most recent record
WITH duplicates AS (
  SELECT user_id, MAX(created_at) as max_created_at
  FROM training_selections
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
DELETE FROM training_selections t
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE t.user_id = d.user_id
  AND t.created_at < d.max_created_at
);

-- Add unique constraints safely using DO blocks
DO $$ 
BEGIN
  -- Add unique constraint to registrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'registrations_user_id_key'
  ) THEN
    ALTER TABLE registrations
    ADD CONSTRAINT registrations_user_id_key UNIQUE (user_id);
  END IF;

  -- Add unique constraint to meal_selections
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'meal_selections_user_id_key'
  ) THEN
    ALTER TABLE meal_selections
    ADD CONSTRAINT meal_selections_user_id_key UNIQUE (user_id);
  END IF;

  -- Add unique constraint to training_selections
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'training_selections_user_id_key'
  ) THEN
    ALTER TABLE training_selections
    ADD CONSTRAINT training_selections_user_id_key UNIQUE (user_id);
  END IF;
END $$;