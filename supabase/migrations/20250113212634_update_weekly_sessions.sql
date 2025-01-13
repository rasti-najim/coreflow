-- Drop existing enum type if it exists
DROP TYPE IF EXISTS weekly_sessions_enum CASCADE;

-- Create new enum type with updated values
CREATE TYPE weekly_sessions_enum AS ENUM ('3', '5', 'everyday');

-- Alter the user_preferences table to use the new enum type
ALTER TABLE user_preferences 
  ALTER COLUMN weekly_sessions TYPE weekly_sessions_enum 
  USING (
    CASE 
      WHEN weekly_sessions::text = '1-2' THEN '3'::weekly_sessions_enum
      ELSE weekly_sessions::text::weekly_sessions_enum
    END
  );