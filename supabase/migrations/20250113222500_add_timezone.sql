ALTER TABLE user_preferences 
DROP COLUMN reminder_offset;

ALTER TABLE user_preferences 
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';