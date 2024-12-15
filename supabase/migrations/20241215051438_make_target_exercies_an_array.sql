-- First, drop the existing foreign key constraint and column
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_target_exercise_fkey;
ALTER TABLE sessions DROP COLUMN IF EXISTS target_exercise;

-- Add new column for target_exercises as a UUID array
ALTER TABLE sessions ADD COLUMN target_exercises UUID[];

-- Create an index for better performance on array operations
CREATE INDEX idx_sessions_target_exercises ON sessions USING GIN (target_exercises);

-- Add a check constraint to ensure all UUIDs in the array exist in exercises table
ALTER TABLE sessions ADD CONSTRAINT check_target_exercises 
    CHECK (target_exercises @> ARRAY[]::uuid[] AND 
           NOT EXISTS (
               SELECT unnest(target_exercises) AS exercise_id 
               EXCEPT 
               SELECT id FROM exercises
           ));