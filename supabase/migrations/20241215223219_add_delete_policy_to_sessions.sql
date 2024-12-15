CREATE POLICY "Users can delete their own sessions" ON sessions
FOR DELETE USING (auth.uid() = user_id);
