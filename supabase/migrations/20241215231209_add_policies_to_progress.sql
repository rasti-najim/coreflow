CREATE POLICY "Users can view their own progress" ON "progress"
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON "progress"
FOR INSERT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON "progress"
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON "progress"
FOR DELETE
USING (auth.uid() = user_id);