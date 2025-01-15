-- Create the photo-progress bucket
insert into storage.buckets
  (id, name, public)
values
  ('photo-progress', 'photo-progress', false);

insert into storage.buckets
(id, name, public)
values
('exercise-animations', 'exercise-animations', false);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view exercise animations" ON storage.objects;

-- Create policies for photo-progress bucket
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

-- Create policies for exercise-animations bucket
CREATE POLICY "Anyone can view exercise animations" ON storage.objects
FOR SELECT USING (
    bucket_id = 'exercise-animations'
);
