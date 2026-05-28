/*
  # Add missing columns to task_submissions

  The table was created with a minimal schema but the app requires several
  additional columns:

  New columns:
  - attachments  (jsonb, default [])  — array of {name, path, url, size, type}
  - score        (integer, nullable)  — numeric score assigned by trainer on review
  - feedback     (text, nullable)     — written feedback from trainer
  - reviewed_by  (uuid, nullable)     — references the trainer who reviewed

  The existing `file_url` (single text) column is superseded by `attachments`
  (jsonb array) but is kept to avoid breaking anything that may reference it.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'score'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'feedback'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN feedback text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
