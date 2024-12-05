-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for consistent values
CREATE TYPE experience_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE weekly_sessions_enum AS ENUM ('1-2', '3', '5');
CREATE TYPE session_duration_enum AS ENUM ('5-10', '10-20', '30-45', '60-75');
CREATE TYPE tracking_method_enum AS ENUM ('pictures', 'mood', 'neither');

-- Create Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    experience_level experience_level_enum NOT NULL,
    -- Add Supabase auth user reference
    auth_user_id UUID UNIQUE REFERENCES auth.users(id)
);

-- Create UserPreferences table
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    weekly_sessions weekly_sessions_enum NOT NULL,
    session_duration session_duration_enum NOT NULL,
    tracking_method tracking_method_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)  -- Ensures one preference per user
);

-- Create UserGoals table
CREATE TABLE user_goals (
    goal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Progress table
CREATE TABLE progress (
    progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mood_description TEXT,
    picture_url TEXT,
    notes TEXT,
    -- Add constraint to ensure either mood_description or picture_url is filled based on tracking method
    CONSTRAINT valid_tracking_data CHECK (
        (mood_description IS NOT NULL AND picture_url IS NULL) OR
        (mood_description IS NULL AND picture_url IS NOT NULL) OR
        (mood_description IS NULL AND picture_url IS NULL)
    )
);

-- Create indexes for foreign keys and frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_recorded_at ON progress(recorded_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to UserPreferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_preferences.user_id));

CREATE POLICY "Users can view own goals" ON user_goals
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_goals.user_id));

CREATE POLICY "Users can view own progress" ON progress
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = progress.user_id));