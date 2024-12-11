CREATE POLICY "Users can view own goals" 
ON "public"."user_goals" 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
