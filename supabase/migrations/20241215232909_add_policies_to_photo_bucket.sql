CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'photo-progress'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (select auth.role()) = 'authenticated'
);

CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'photo-progress'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (select auth.role()) = 'authenticated'
);

CREATE POLICY "Users can delete photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'photo-progress'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (select auth.role()) = 'authenticated'
);
