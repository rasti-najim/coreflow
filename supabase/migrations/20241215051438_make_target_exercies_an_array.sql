-- First, drop the existing foreign key constraint and column
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_target_exercise_fkey;
ALTER TABLE sessions DROP COLUMN IF EXISTS target_exercise;

-- Add new column for target_exercises as a UUID array
ALTER TABLE sessions ADD COLUMN target_exercises UUID[];

-- Add foreign key constraint to ensure all UUIDs in the array reference valid exercises
ALTER TABLE sessions ADD CONSTRAINT fk_target_exercises 
    FOREIGN KEY (target_exercises) REFERENCES exercises(id);

-- Create an index for better performance on array operations
CREATE INDEX idx_sessions_target_exercises ON sessions USING GIN (target_exercises);