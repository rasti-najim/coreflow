-- First drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own goals" ON "public"."user_goals";
DROP POLICY IF EXISTS "Users can insert own goals" ON "public"."user_goals";
DROP POLICY IF EXISTS "Users can delete own goals" ON "public"."user_goals";

-- Create SELECT policy
CREATE POLICY "Users can view own goals"
ON "public"."user_goals"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert own goals"
ON "public"."user_goals"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy
CREATE POLICY "Users can delete own goals"
ON "public"."user_goals"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
