-- Create new enum type for progress entry types
CREATE TYPE entry_type_enum AS ENUM ('session', 'picture', 'mood');

-- Add new columns first (allowing nulls initially)
ALTER TABLE progress
    ADD COLUMN session_id UUID REFERENCES sessions(id),
    ADD COLUMN entry_type entry_type_enum,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE;

-- Update existing records
UPDATE progress
SET entry_type = CASE
    WHEN picture_url IS NOT NULL THEN 'picture'::entry_type_enum
    WHEN mood_description IS NOT NULL THEN 'mood'::entry_type_enum
    ELSE 'session'::entry_type_enum
END,
created_at = recorded_at;

-- Now make columns NOT NULL and set defaults separately
ALTER TABLE progress
    ALTER COLUMN entry_type SET NOT NULL;

ALTER TABLE progress
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN created_at SET NOT NULL;

-- Finally drop the old columns
ALTER TABLE progress
    DROP COLUMN notes,
    DROP COLUMN recorded_at;

-- Update the constraint for tracking data
ALTER TABLE progress
    DROP CONSTRAINT valid_tracking_data,
    ADD CONSTRAINT valid_tracking_data CHECK (
        (entry_type = 'mood' AND mood_description IS NOT NULL AND picture_url IS NULL AND session_id IS NULL) OR
        (entry_type = 'picture' AND picture_url IS NOT NULL AND mood_description IS NULL AND session_id IS NULL) OR
        (entry_type = 'session' AND mood_description IS NULL AND picture_url IS NULL AND session_id IS NOT NULL)
    );

-- Create index for the new foreign key
CREATE INDEX idx_progress_session_id ON progress(session_id);