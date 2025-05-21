/*
  # Add Meal Selections Table

  1. New Tables
    - `meal_selections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `breakfast_items` (text array)
      - `lunch_items` (text array)
      - `dinner_items` (text array)
      - `snack_items` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `meal_selections` table
    - Add policies for authenticated users to manage their own selections
*/

-- Create meal_selections table
CREATE TABLE IF NOT EXISTS meal_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  breakfast_items text[] DEFAULT '{}',
  lunch_items text[] DEFAULT '{}',
  dinner_items text[] DEFAULT '{}',
  snack_items text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meal_selections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own meal selections"
  ON meal_selections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal selections"
  ON meal_selections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meal selections"
  ON meal_selections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_meal_selections_updated_at
  BEFORE UPDATE ON meal_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_meal_selections_user_id ON meal_selections(user_id);