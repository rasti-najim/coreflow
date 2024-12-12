-- Drop existing enum if it exists
DROP TYPE IF EXISTS session_duration_enum CASCADE;

-- Create new enum type with all duration options
CREATE TYPE session_duration_enum AS ENUM ('5', '10', '15', '20', '30');

-- Alter the user_preferences table to use the new enum type
ALTER TABLE user_preferences 
ALTER COLUMN session_duration TYPE session_duration_enum 
USING session_duration::session_duration_enum;

-- Update existing values in the user_preferences table
UPDATE user_preferences
SET session_duration = '10'
WHERE session_duration = '10-20';

