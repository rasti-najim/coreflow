-- First drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."user_preferences";

-- Create UPDATE policy
CREATE POLICY "Users can update own preferences"
ON "public"."user_preferences"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);