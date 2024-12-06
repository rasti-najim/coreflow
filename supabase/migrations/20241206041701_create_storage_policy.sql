-- Create a new public access policy
CREATE POLICY "Public Access to animations"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise_animations');