-- First drop the policies that reference auth_user_id
DROP POLICY "Users can view own data" ON users;
DROP POLICY "Users can view own preferences" ON user_preferences;
DROP POLICY "Users can view own goals" ON user_goals;
DROP POLICY "Users can view own progress" ON progress;

-- Drop the foreign key constraints that reference users
ALTER TABLE user_preferences
DROP CONSTRAINT user_preferences_user_id_fkey;

ALTER TABLE user_goals
DROP CONSTRAINT user_goals_user_id_fkey;

ALTER TABLE progress
DROP CONSTRAINT progress_user_id_fkey;

-- Now we can drop the primary key and auth_user_id
ALTER TABLE users
DROP CONSTRAINT users_pkey,
DROP COLUMN auth_user_id;

-- Modify the id column to be a non-null primary key referencing auth.users
ALTER TABLE users
ALTER COLUMN id SET NOT NULL,
ADD CONSTRAINT users_pkey PRIMARY KEY (id),
ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Recreate the foreign key constraints to reference the new primary key
ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE user_goals
ADD CONSTRAINT user_goals_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE progress
ADD CONSTRAINT progress_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- The new policies are already created in 20241210050929_create_users_policy.sql
