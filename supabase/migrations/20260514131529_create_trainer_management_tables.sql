/*
  # Create trainer-specific tables for practical training management

  1. New Tables
    - `practical_tasks`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `instructions` (text, for company training instructions)
      - `difficulty` (text: 'beginner' | 'intermediate' | 'advanced')
      - `estimated_duration_minutes` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `trainee_assignments`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references auth.users)
      - `trainee_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `task_submissions`
      - `id` (uuid, primary key)
      - `trainee_id` (uuid, references auth.users)
      - `task_id` (uuid, references practical_tasks)
      - `submission_text` (text)
      - `file_url` (text, optional)
      - `status` (text: 'pending' | 'submitted' | 'reviewed')
      - `submitted_at` (timestamptz)
      - `reviewed_at` (timestamptz)

    - `trainer_feedback`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references auth.users)
      - `trainee_id` (uuid, references auth.users)
      - `feedback_text` (text)
      - `rating` (integer, 1-5)
      - `topic` (text, optional, e.g., 'communication', 'technical_skills')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Trainers can manage their assigned trainees and tasks
    - Trainees can view assignments and submit tasks
    - Trainers can view feedback they gave and trainee submissions

  3. Indexes
    - Add indexes on trainer_id, trainee_id for efficient queries
*/

-- Create practical_tasks table
CREATE TABLE IF NOT EXISTS practical_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE practical_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their own tasks"
  ON practical_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create tasks"
  ON practical_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own tasks"
  ON practical_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own tasks"
  ON practical_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_practical_tasks_trainer_id ON practical_tasks(trainer_id);

-- Create trainee_assignments table
CREATE TABLE IF NOT EXISTS trainee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, trainee_id)
);

ALTER TABLE trainee_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their assignments"
  ON trainee_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create assignments"
  ON trainee_assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete assignments"
  ON trainee_assignments FOR DELETE
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainees can view their assignments"
  ON trainee_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = trainee_id);

CREATE INDEX idx_trainee_assignments_trainer_id ON trainee_assignments(trainer_id);
CREATE INDEX idx_trainee_assignments_trainee_id ON trainee_assignments(trainee_id);

-- Create task_submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES practical_tasks(id) ON DELETE CASCADE,
  submission_text text NOT NULL DEFAULT '',
  file_url text DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed')),
  submitted_at timestamptz DEFAULT NULL,
  reviewed_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainee_id, task_id)
);

ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainees can view their own submissions"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = trainee_id);

CREATE POLICY "Trainees can create submissions"
  ON task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainee_id);

CREATE POLICY "Trainees can update their own submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = trainee_id)
  WITH CHECK (auth.uid() = trainee_id);

CREATE POLICY "Trainers can view submissions for their tasks"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_tasks
      WHERE practical_tasks.id = task_submissions.task_id
      AND practical_tasks.trainer_id = auth.uid()
    )
  );

CREATE INDEX idx_task_submissions_trainee_id ON task_submissions(trainee_id);
CREATE INDEX idx_task_submissions_task_id ON task_submissions(task_id);

-- Create trainer_feedback table
CREATE TABLE IF NOT EXISTS trainer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_text text NOT NULL DEFAULT '',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  topic text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trainer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their own feedback"
  ON trainer_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create feedback"
  ON trainer_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own feedback"
  ON trainer_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainees can view feedback about them"
  ON trainer_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = trainee_id);

CREATE INDEX idx_trainer_feedback_trainer_id ON trainer_feedback(trainer_id);
CREATE INDEX idx_trainer_feedback_trainee_id ON trainer_feedback(trainee_id);