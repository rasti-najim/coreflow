-- First, create the new enum type for focus and status
CREATE TYPE session_focus_enum AS ENUM ('full body', 'upper body', 'lower body', 'core');
CREATE TYPE session_status_enum AS ENUM ('scheduled', 'completed', 'skipped');

-- Drop existing indexes before modifying the table
DROP INDEX IF EXISTS idx_sessions_warmup;
DROP INDEX IF EXISTS idx_sessions_target;
DROP INDEX IF EXISTS idx_sessions_cooldown;

-- Add new columns first (allowing nulls initially)
ALTER TABLE sessions
    ADD COLUMN user_id UUID NOT NULL REFERENCES users(id),
    ADD COLUMN focus session_focus_enum,
    ADD COLUMN scheduled_date DATE,
    ADD COLUMN status session_status_enum;

-- Set default values for existing records
UPDATE sessions
SET focus = 'full body'::session_focus_enum,
    status = CASE 
        WHEN is_custom THEN 'completed'::session_status_enum
        ELSE 'scheduled'::session_status_enum
    END;

-- Make columns NOT NULL after populating data
ALTER TABLE sessions
    ALTER COLUMN focus SET NOT NULL,
    ALTER COLUMN status SET NOT NULL;

-- Recreate indexes for better query performance
CREATE INDEX idx_sessions_warmup ON sessions(warmup_exercise);
CREATE INDEX idx_sessions_target ON sessions(target_exercise);
CREATE INDEX idx_sessions_cooldown ON sessions(cooldown_exercise);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_status ON sessions(status);
