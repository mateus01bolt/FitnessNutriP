/*
  # Add has_paid_plan column to profiles table

  1. Changes
    - Add has_paid_plan boolean column to profiles table with default false
    - Add index for faster queries
*/

-- Add has_paid_plan column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_paid_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_paid_plan boolean DEFAULT false;
    CREATE INDEX idx_profiles_has_paid_plan ON profiles(has_paid_plan);
  END IF;
END $$;