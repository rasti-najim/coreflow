-- Policies for user_goals
CREATE POLICY "Users can insert own goals" 
ON "public"."user_goals" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" 
ON "public"."user_goals" 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can insert own preferences" 
ON "public"."user_preferences" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" 
ON "public"."user_preferences" 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);