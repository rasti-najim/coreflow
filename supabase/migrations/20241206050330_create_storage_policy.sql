-- Create policy to allow authenticated users to view animations
CREATE POLICY "Authenticated users can view animations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exercise_animations'
  AND auth.role() = 'authenticated'
)