-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create session exercises" ON session_exercises;

-- Create new policy that allows creation of exercises for both custom and non-custom sessions
CREATE POLICY "Authenticated users can create session exercises"
ON session_exercises FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM sessions s 
    WHERE s.id = session_exercises.session_id 
    AND s.user_id = auth.uid()
));