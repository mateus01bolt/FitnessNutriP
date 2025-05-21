/*
  # Add unique constraint to meal_selections

  1. Changes
    - Add unique constraint on user_id column in meal_selections table
    This ensures each user can only have one meal selections record
    and enables upsert operations to work correctly.

  2. Security
    - No changes to RLS policies
*/

-- Add unique constraint to user_id
ALTER TABLE meal_selections
ADD CONSTRAINT meal_selections_user_id_key UNIQUE (user_id);