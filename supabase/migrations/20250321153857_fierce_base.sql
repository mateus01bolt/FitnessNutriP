/*
  # Create Nutritional Plan Tables

  1. New Tables
    - `nutritional_plans`: Stores main plan information
    - `meal_plans`: Contains meal schedules and details
    - `plan_objectives`: Tracks user goals and progress

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create nutritional_plans table
CREATE TABLE IF NOT EXISTS nutritional_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  daily_calories decimal NOT NULL,
  protein_percentage decimal NOT NULL,
  carbs_percentage decimal NOT NULL,
  fat_percentage decimal NOT NULL,
  objective text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES nutritional_plans(id) ON DELETE CASCADE NOT NULL,
  meal_time time NOT NULL,
  meal_name text NOT NULL,
  food_items jsonb NOT NULL,
  calories decimal NOT NULL,
  protein decimal NOT NULL,
  carbs decimal NOT NULL,
  fat decimal NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plan_objectives table
CREATE TABLE IF NOT EXISTS plan_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES nutritional_plans(id) ON DELETE CASCADE NOT NULL,
  initial_weight decimal NOT NULL,
  target_weight decimal,
  weekly_goal decimal,
  activity_level text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE nutritional_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_objectives ENABLE ROW LEVEL SECURITY;

-- Create policies for nutritional_plans
CREATE POLICY "Users can read own nutritional plans"
  ON nutritional_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own nutritional plans"
  ON nutritional_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for meal_plans
CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

-- Create policies for plan_objectives
CREATE POLICY "Users can read own plan objectives"
  ON plan_objectives FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own plan objectives"
  ON plan_objectives FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE TRIGGER update_nutritional_plans_updated_at
  BEFORE UPDATE ON nutritional_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_objectives_updated_at
  BEFORE UPDATE ON plan_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_nutritional_plans_user_id ON nutritional_plans(user_id);
CREATE INDEX idx_meal_plans_plan_id ON meal_plans(plan_id);
CREATE INDEX idx_plan_objectives_plan_id ON plan_objectives(plan_id);