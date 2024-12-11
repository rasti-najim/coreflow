-- First drop any existing delete policy to avoid conflicts
DROP POLICY IF EXISTS "Users can delete own goals" ON "public"."user_goals";

-- Create DELETE policy
CREATE POLICY "Users can delete own goals"
ON "public"."user_goals"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
