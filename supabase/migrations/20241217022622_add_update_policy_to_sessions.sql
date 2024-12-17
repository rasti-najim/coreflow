CREATE POLICY "Sessions can be updated by the user" ON "sessions"
AS PERMISSIVE FOR UPDATE
TO "authenticated"
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON "sessions";

CREATE POLICY "Users can delete their own sessions" ON "sessions"
AS PERMISSIVE FOR DELETE
TO "authenticated"
USING (auth.uid() = user_id);
