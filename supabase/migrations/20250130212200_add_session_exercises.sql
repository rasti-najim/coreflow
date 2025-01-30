-- Create new session_exercises table
CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    duration INTEGER NOT NULL DEFAULT 45, -- duration in seconds
    sequence INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, sequence) -- Ensure unique sequence numbers per session
);

-- Enable RLS
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing session exercises
CREATE POLICY "Anyone can view session exercises"
ON session_exercises FOR SELECT
TO public
USING (true);

-- Create policy for creating session exercises
CREATE POLICY "Authenticated users can create session exercises"
ON session_exercises FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM sessions s 
    WHERE s.id = session_exercises.session_id 
    AND s.is_custom = true
));

-- Migrate existing data
INSERT INTO session_exercises (session_id, exercise_id, sequence)
SELECT 
    id as session_id,
    warmup_exercise as exercise_id,
    1 as sequence
FROM sessions 
WHERE warmup_exercise IS NOT NULL;

INSERT INTO session_exercises (session_id, exercise_id, sequence)
SELECT 
    s.id as session_id,
    t.exercise_id,
    ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY t.exercise_id) + 1 as sequence
FROM sessions s
CROSS JOIN UNNEST(s.target_exercises) AS t(exercise_id)
WHERE s.target_exercises IS NOT NULL;

INSERT INTO session_exercises (session_id, exercise_id, sequence)
SELECT 
    id as session_id,
    cooldown_exercise as exercise_id,
    (
        SELECT COUNT(*) + 1
        FROM sessions s2
        LEFT JOIN UNNEST(s2.target_exercises) AS t(exercise_id) ON true
        WHERE s2.id = sessions.id
    ) + 1 as sequence
FROM sessions 
WHERE cooldown_exercise IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_session_exercises_exercise ON session_exercises(exercise_id);
CREATE INDEX idx_session_exercises_sequence ON session_exercises(sequence);

-- After verifying data migration, drop old columns
ALTER TABLE sessions 
    DROP COLUMN warmup_exercise,
    DROP COLUMN target_exercises,
    DROP COLUMN cooldown_exercise;

-- Drop old indexes that are no longer needed
DROP INDEX IF EXISTS idx_sessions_warmup;
DROP INDEX IF EXISTS idx_sessions_target;
DROP INDEX IF EXISTS idx_sessions_cooldown;
