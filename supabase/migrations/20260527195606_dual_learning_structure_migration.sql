/*
  # Dual Learning Structure - Separate Academic and Practical Performance

  1. New Tables
    - `practical_performance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `task_id` (uuid, references practical_tasks)
      - `task_title` (text)
      - `score` (integer)
      - `total` (integer)
      - `passed` (boolean)
      - `attempts` (integer, default 1)
      - `submission_text` (text)
      - `feedback` (text, from trainer)
      - `last_attempt_at` (timestamptz)
      - `score_history` (jsonb)
      - `created_at` (timestamptz)

  2. Modified Tables
    - `performance` table now specifically for academic/teacher learning
    - Added `source` column: 'teacher' | 'trainer' for filtering

  3. Security
    - RLS policies for practical_performance
    - Teachers can only read academic performance data
    - Trainers can only read practical performance data from their trainees

  4. Notes
    - `performance` table remains for teacher/academic learning
    - `practical_performance` tracks trainer/practical tasks
    - Clear separation of academic vs practical progress
*/

-- Add source column to existing performance table for filtering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'performance' AND column_name = 'source'
  ) THEN
    ALTER TABLE performance ADD COLUMN source text NOT NULL DEFAULT 'teacher' CHECK (source IN ('teacher', 'trainer'));
  END IF;
END $$;

-- Update existing performance records to be teacher-sourced
UPDATE performance SET source = 'teacher' WHERE source IS NULL;

-- Create practical_performance table for trainer tasks
CREATE TABLE IF NOT EXISTS practical_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES practical_tasks(id) ON DELETE CASCADE,
  task_title text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 100,
  passed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 1,
  submission_text text NOT NULL DEFAULT '',
  feedback text DEFAULT NULL,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  score_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE practical_performance ENABLE ROW LEVEL SECURITY;

-- Trainees can read their own practical performance
CREATE POLICY "Trainees can read own practical performance"
  ON practical_performance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trainees can insert their own practical performance
CREATE POLICY "Trainees can insert own practical performance"
  ON practical_performance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trainees can update their own practical performance
CREATE POLICY "Trainees can update own practical performance"
  ON practical_performance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trainers can read practical performance for their assigned trainees
CREATE POLICY "Trainers can read assigned trainees' practical performance"
  ON practical_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainee_assignments
      WHERE trainee_assignments.trainee_id = practical_performance.user_id
      AND trainee_assignments.trainer_id = auth.uid()
    )
  );

-- Create indexes for performance filtering
CREATE INDEX IF NOT EXISTS idx_performance_source ON performance(source);
CREATE INDEX IF NOT EXISTS idx_performance_user_source ON performance(user_id, source);
CREATE INDEX IF NOT EXISTS idx_practical_performance_user ON practical_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_practical_performance_task ON practical_performance(task_id);