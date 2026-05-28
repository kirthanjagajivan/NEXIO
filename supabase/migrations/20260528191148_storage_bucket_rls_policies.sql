/*
  # Storage RLS Policies for Task Attachments and Submissions

  Creates Row Level Security policies for the Supabase Storage buckets:
  - task-attachments: public read, authenticated write (trainers upload task files)
  - task-submissions: authenticated read (owner + trainer), authenticated write (trainees)
*/

-- task-attachments: anyone authenticated can read (trainer-uploaded content is shared)
CREATE POLICY "Authenticated users can read task attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'task-attachments');

-- task-attachments: authenticated users can upload
CREATE POLICY "Authenticated users can upload task attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'task-attachments');

-- task-attachments: owner can delete their own files
CREATE POLICY "Users can delete own task attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'task-attachments' AND auth.uid() = owner);

-- task-submissions: trainees can upload their own submissions (path includes user id)
CREATE POLICY "Trainees can upload submission files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- task-submissions: owner or trainer can read submissions
CREATE POLICY "Users can read own submission files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-submissions'
    AND (
      auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'trainer'
      )
    )
  );

-- task-submissions: owner can delete their own submission files
CREATE POLICY "Users can delete own submission files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'task-submissions' AND auth.uid() = owner);
