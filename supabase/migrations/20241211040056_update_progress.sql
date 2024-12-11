-- Create new enum type for progress entry types
CREATE TYPE entry_type_enum AS ENUM ('session', 'picture', 'mood');

-- Drop existing columns and add new ones
ALTER TABLE progress
    DROP COLUMN notes,
    DROP COLUMN recorded_at,
    ADD COLUMN session_id UUID REFERENCES sessions(id),
    ADD COLUMN entry_type entry_type_enum NOT NULL,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update the existing constraint for tracking data
ALTER TABLE progress
    DROP CONSTRAINT valid_tracking_data,
    ADD CONSTRAINT valid_tracking_data CHECK (
        (entry_type = 'mood' AND mood_description IS NOT NULL AND picture_url IS NULL) OR
        (entry_type = 'picture' AND picture_url IS NOT NULL AND mood_description IS NULL) OR
        (entry_type = 'session' AND mood_description IS NULL AND picture_url IS NULL)
    );

-- Create index for the new foreign key
CREATE INDEX idx_progress_session_id ON progress(session_id);