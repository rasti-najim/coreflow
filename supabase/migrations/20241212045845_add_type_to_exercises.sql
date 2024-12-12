-- Create new enum type for exercise types
CREATE TYPE exercise_type_enum AS ENUM ('warmup', 'target', 'cooldown');

-- Add type column to exercises table
ALTER TABLE exercises
    ADD COLUMN type exercise_type_enum NOT NULL DEFAULT 'target';

-- Update existing exercises based on their lottie_file_url patterns
UPDATE exercises
SET type = CASE
    WHEN lottie_file_url LIKE '%warmups/%' THEN 'warmup'
    WHEN lottie_file_url LIKE '%cooldowns/%' THEN 'cooldown'
    WHEN lottie_file_url LIKE '%targets/%' THEN 'target'
    ELSE 'target'  -- Default fallback
END;

-- Remove the default constraint now that data is populated
ALTER TABLE exercises
    ALTER COLUMN type DROP DEFAULT;
