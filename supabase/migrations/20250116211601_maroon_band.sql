-- Add meal_times and chocolate_preference columns to registrations table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'meal_times'
  ) THEN
    ALTER TABLE registrations ADD COLUMN meal_times text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'chocolate_preference'
  ) THEN
    ALTER TABLE registrations ADD COLUMN chocolate_preference text;
  END IF;
END $$;