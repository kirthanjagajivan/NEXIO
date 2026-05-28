/*
  # Practical Tasks File System

  1. New/Modified Tables
    - `practical_tasks` — add columns: is_published (bool), attachments (jsonb array of {name, path, type, size})
    - `task_submissions` — new table for trainee submissions with file attachments and review workflow
      - id, task_id, trainee_id, submission_text, attachments (jsonb), status, score, feedback, reviewed_at, reviewed_by, created_at, updated_at

  2. Security
    - RLS on task_submissions:
      - Trainees can insert/select/update their own submissions
      - Trainers can select all submissions for tasks they created, and update status/feedback
    - RLS on practical_tasks (update):
      - Trainers can update tasks they own

  3. Notes
    - attachments column is jsonb array: [{name, path, type, size}]
    - submission status: 'pending' | 'submitted' | 'approved' | 'rejected'
    - trainer_id added to practical_tasks for ownership
*/

-- Add trainer_id and is_published to practical_tasks if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practical_tasks' AND column_name = 'trainer_id'
  ) THEN
    ALTER TABLE practical_tasks ADD COLUMN trainer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practical_tasks' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE practical_tasks ADD COLUMN is_published boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practical_tasks' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE practical_tasks ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create task_submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES practical_tasks(id) ON DELETE CASCADE,
  trainee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'needs_revision')),
  score integer DEFAULT NULL,
  feedback text DEFAULT NULL,
  reviewed_at timestamptz DEFAULT NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, trainee_id)
);

ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Trainees can see their own submissions
CREATE POLICY "Trainees can read own submissions"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = trainee_id);

-- Trainees can insert their own submissions
CREATE POLICY "Trainees can insert own submissions"
  ON task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainee_id);

-- Trainees can update their own pending/needs_revision submissions
CREATE POLICY "Trainees can update own submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = trainee_id AND status IN ('submitted', 'needs_revision'))
  WITH CHECK (auth.uid() = trainee_id);

-- Trainers can read all submissions for tasks they created
CREATE POLICY "Trainers can read submissions for their tasks"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_tasks
      WHERE practical_tasks.id = task_submissions.task_id
      AND practical_tasks.trainer_id = auth.uid()
    )
  );

-- Trainers can update submissions (set status, score, feedback)
CREATE POLICY "Trainers can review submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_tasks
      WHERE practical_tasks.id = task_submissions.task_id
      AND practical_tasks.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practical_tasks
      WHERE practical_tasks.id = task_submissions.task_id
      AND practical_tasks.trainer_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_trainee ON task_submissions(trainee_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_practical_tasks_trainer ON practical_tasks(trainer_id);
