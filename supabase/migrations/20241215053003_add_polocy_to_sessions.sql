-- First drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view sessions" ON "public"."sessions";
DROP POLICY IF EXISTS "Authenticated users can create custom sessions" ON "public"."sessions";


CREATE POLICY "Users can view their own sessions"
ON "public"."sessions"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create sessions"
ON "public"."sessions"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);