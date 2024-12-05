-- Create exercises table with focus array
CREATE TABLE exercises (
    exercise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skill_level experience_level_enum NOT NULL,
    focus VARCHAR(255)[] NOT NULL,
    is_two_sided BOOLEAN NOT NULL DEFAULT false,
    lottie_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_exercises_skill_level ON exercises(skill_level);
CREATE INDEX idx_exercises_focus ON exercises USING gin(focus);

-- Add updated_at trigger
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();