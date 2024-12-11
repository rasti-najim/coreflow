-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warmup_exercise UUID REFERENCES exercises(id),
    target_exercise UUID REFERENCES exercises(id),
    cooldown_exercise UUID REFERENCES exercises(id),
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for foreign keys
CREATE INDEX idx_sessions_warmup ON sessions(warmup_exercise);
CREATE INDEX idx_sessions_target ON sessions(target_exercise);
CREATE INDEX idx_sessions_cooldown ON sessions(cooldown_exercise);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing sessions
CREATE POLICY "Anyone can view sessions"
ON sessions FOR SELECT
TO public
USING (true);

-- Create policy for creating custom sessions
CREATE POLICY "Authenticated users can create custom sessions"
ON sessions FOR INSERT
TO authenticated
WITH CHECK (is_custom = true);
