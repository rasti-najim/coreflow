CREATE POLICY "Users can view their own data" ON "users"
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON "users"
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own account" ON "users"
FOR DELETE
USING (auth.uid() = id);