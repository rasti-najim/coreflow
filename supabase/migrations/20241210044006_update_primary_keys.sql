-- Create migration to rename all primary key columns to 'id'
ALTER TABLE users 
RENAME COLUMN user_id TO id;

ALTER TABLE user_preferences 
RENAME COLUMN preference_id TO id;

ALTER TABLE user_goals 
RENAME COLUMN goal_id TO id;

ALTER TABLE progress 
RENAME COLUMN progress_id TO id;

ALTER TABLE exercises 
RENAME COLUMN exercise_id TO id;

-- Update foreign key constraints to ensure they still work
ALTER TABLE user_preferences
DROP CONSTRAINT user_preferences_user_id_fkey,
ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_goals
DROP CONSTRAINT user_goals_user_id_fkey,
ADD CONSTRAINT user_goals_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE progress
DROP CONSTRAINT progress_user_id_fkey,
ADD CONSTRAINT progress_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;