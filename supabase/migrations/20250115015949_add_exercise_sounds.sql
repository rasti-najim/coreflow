-- Create the exercise_sounds bucket
insert into storage.buckets
  (id, name, public)
values
  ('exercise_sounds', 'exercise_sounds', false);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view exercise sounds" ON storage.objects;

-- Create policies for exercise_sounds bucket
CREATE POLICY "Anyone can view exercise sounds" ON storage.objects
FOR SELECT USING (
    bucket_id = 'exercise_sounds'
);