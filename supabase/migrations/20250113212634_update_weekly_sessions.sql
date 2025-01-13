-- First save existing data
CREATE TABLE temp_preferences AS 
SELECT * FROM user_preferences;

-- Drop the existing enum type and table constraints
ALTER TABLE user_preferences DROP COLUMN weekly_sessions;
DROP TYPE IF EXISTS weekly_sessions_enum CASCADE;

-- Create new enum type with updated values
CREATE TYPE weekly_sessions_enum AS ENUM ('3', '5', 'everyday');

-- Add the column back with the new type (initially nullable)
ALTER TABLE user_preferences 
ADD COLUMN weekly_sessions weekly_sessions_enum;

-- Restore the data with converted values
UPDATE user_preferences up
SET weekly_sessions = 
  CASE 
    WHEN (SELECT weekly_sessions::text FROM temp_preferences tp WHERE tp.id = up.id) = '1-2' 
    THEN '3'::weekly_sessions_enum
    ELSE (SELECT weekly_sessions::text FROM temp_preferences tp WHERE tp.id = up.id)::weekly_sessions_enum
  END;

-- Now make it NOT NULL after populating data
ALTER TABLE user_preferences 
ALTER COLUMN weekly_sessions SET NOT NULL;

-- Clean up
DROP TABLE temp_preferences;