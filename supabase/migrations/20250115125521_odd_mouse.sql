/*
  # Nutritional Plan System Schema

  1. New Tables
    - `nutritional_plans`
      - Stores the main plan information including caloric goals and macronutrient distribution
    - `meal_plans`
      - Contains daily meal schedules and food combinations
    - `food_items`
      - Database of available food items with nutritional information
    - `plan_objectives`
      - Tracks user objectives and progress

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories_per_100g decimal NOT NULL,
  protein_per_100g decimal NOT NULL,
  carbs_per_100g decimal NOT NULL,
  fat_per_100g decimal NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  food_items jsonb NOT NULL, -- Array of food items with portions
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
  weekly_goal decimal, -- Weight change goal per week
  activity_level text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_objectives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read food items"
  ON food_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own nutritional plans"
  ON nutritional_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own nutritional plans"
  ON nutritional_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own nutritional plans"
  ON nutritional_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = meal_plans.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can read own plan objectives"
  ON plan_objectives FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own plan objectives"
  ON plan_objectives FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own plan objectives"
  ON plan_objectives FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutritional_plans
    WHERE nutritional_plans.id = plan_objectives.plan_id
    AND nutritional_plans.user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON food_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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