CREATE POLICY "Users can delete their own account" ON "users"
AS PERMISSIVE
FOR DELETE
TO "users"
USING (auth.uid() = id);

CREATE POLICY "Users can view their own data" ON "users"
AS PERMISSIVE
FOR SELECT
TO "users"
USING (auth.uid() = id);