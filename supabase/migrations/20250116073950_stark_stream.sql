/*
  # Add Training Selections Support
  
  1. New Tables
    - `training_selections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `exercise_items` (text array)
      - `warmup_items` (text array)
      - `cooldown_items` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `training_selections` table
    - Add policies for authenticated users to manage their selections
*/

-- Create training_selections table
CREATE TABLE IF NOT EXISTS training_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_items text[] DEFAULT '{}',
  warmup_items text[] DEFAULT '{}',
  cooldown_items text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to user_id
ALTER TABLE training_selections
ADD CONSTRAINT training_selections_user_id_key UNIQUE (user_id);

-- Enable RLS
ALTER TABLE training_selections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own training selections"
  ON training_selections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own training selections"
  ON training_selections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own training selections"
  ON training_selections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_training_selections_updated_at
  BEFORE UPDATE ON training_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_training_selections_user_id ON training_selections(user_id);