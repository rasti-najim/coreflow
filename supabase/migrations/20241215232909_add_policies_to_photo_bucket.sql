CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can delete photos" ON storage.objects
FOR DELETE USING (
    auth.uid() = user_id
);