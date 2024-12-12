CREATE POLICY "Users can view own preferences"
ON "public"."user_preferences"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
