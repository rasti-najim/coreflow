-- Add policy for inserting user data
CREATE POLICY "Users can insert own data" 
ON "public"."users" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update the existing select policy to use 'id' instead of 'auth_user_id'
DROP POLICY "Users can view own data" ON "public"."users";
CREATE POLICY "Users can view own data" 
ON "public"."users" 
FOR SELECT 
TO public
USING (auth.uid() = id);