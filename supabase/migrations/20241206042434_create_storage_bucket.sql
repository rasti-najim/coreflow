-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'exercise_animations',
  'Exercise Animations',
  true  -- Making it public
)
ON CONFLICT (id) DO NOTHING;

-- Make sure we have the right policies
DROP POLICY IF EXISTS "Public Access to animations" ON storage.objects;

CREATE POLICY "Public Access to animations"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise_animations');