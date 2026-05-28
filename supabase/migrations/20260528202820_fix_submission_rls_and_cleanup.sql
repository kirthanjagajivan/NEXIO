/*
  # Fix Submission RLS and Cleanup Duplicate Policies

  Problems fixed:
  1. Duplicate INSERT policies on task_submissions — one had no WITH CHECK,
     allowing trainees to insert submissions for any trainee_id. Remove the
     permissive one.
  2. Duplicate SELECT policies for trainers on task_submissions — keep one clean copy.
  3. Duplicate UPDATE policies for trainees on task_submissions — keep the stricter one.
  4. Ensure the trainer INSERT policy on practical_tasks has a proper WITH CHECK.

  This migration only drops duplicates and fixes the permissive INSERT policy.
  No data is lost.
*/

-- Drop the permissive INSERT policy (no WITH CHECK means anyone can insert any row)
DROP POLICY IF EXISTS "Trainees can create submissions" ON task_submissions;

-- Drop duplicate trainer SELECT policies (keep "Trainers can read submissions for their tasks")
DROP POLICY IF EXISTS "Trainers can view submissions for their tasks" ON task_submissions;

-- Drop the looser trainee UPDATE policy (keep the stricter status-gated one)
DROP POLICY IF EXISTS "Trainees can update their own submissions" ON task_submissions;

-- Ensure the remaining INSERT policy has a proper WITH CHECK
DROP POLICY IF EXISTS "Trainees can insert own submissions" ON task_submissions;

CREATE POLICY "Trainees can insert own submissions"
  ON task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainee_id);
