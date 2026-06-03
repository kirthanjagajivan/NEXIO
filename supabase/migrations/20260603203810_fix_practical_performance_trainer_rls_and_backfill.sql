/*
  # Fix practical_performance RLS for trainers + backfill existing reviews

  ## Problem
  Trainers cannot write to practical_performance because the only INSERT/UPDATE policies
  require auth.uid() = user_id (trainee's own record). When a trainer submits a review
  in SubmissionReviewTab, the sync to practical_performance silently fails under RLS,
  leaving the table empty and all analytics showing 0.

  ## Changes

  ### 1. New RLS policies on practical_performance
  - Trainers can INSERT practical_performance records for their assigned trainees
  - Trainers can UPDATE practical_performance records for their assigned trainees

  ### 2. practical_performance unique constraint (user_id, task_id)
  Required so the ON CONFLICT upsert in the backfill and in future trainer reviews works.

  ### 3. Backfill
  Inserts practical_performance rows for every reviewed task_submission that already has
  a score and a terminal status (approved / rejected / needs_revision).
*/

-- ── 1. Add unique constraint so upserts work ─────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'practical_performance_user_task_unique'
  ) THEN
    ALTER TABLE practical_performance
      ADD CONSTRAINT practical_performance_user_task_unique
      UNIQUE (user_id, task_id);
  END IF;
END $$;

-- ── 2. Trainer INSERT policy ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Trainers can insert practical performance for assigned trainees" ON practical_performance;

CREATE POLICY "Trainers can insert practical performance for assigned trainees"
  ON practical_performance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainee_assignments ta
      WHERE ta.trainee_id = practical_performance.user_id
        AND ta.trainer_id = auth.uid()
    )
  );

-- ── 3. Trainer UPDATE policy ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Trainers can update practical performance for assigned trainees" ON practical_performance;

CREATE POLICY "Trainers can update practical performance for assigned trainees"
  ON practical_performance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainee_assignments ta
      WHERE ta.trainee_id = practical_performance.user_id
        AND ta.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainee_assignments ta
      WHERE ta.trainee_id = practical_performance.user_id
        AND ta.trainer_id = auth.uid()
    )
  );

-- ── 4. Backfill from existing reviewed task_submissions ───────────────────────

INSERT INTO practical_performance (
  user_id,
  task_id,
  task_title,
  score,
  total,
  passed,
  feedback,
  attempts,
  last_attempt_at,
  score_history
)
SELECT
  ts.trainee_id                                        AS user_id,
  ts.task_id,
  COALESCE(pt.title, 'Unknown Task')                   AS task_title,
  ts.score                                             AS score,
  100                                                  AS total,
  (ts.status = 'approved')                             AS passed,
  ts.feedback,
  1                                                    AS attempts,
  COALESCE(ts.reviewed_at, ts.updated_at)              AS last_attempt_at,
  jsonb_build_array(ts.score)                          AS score_history
FROM task_submissions ts
LEFT JOIN practical_tasks pt ON pt.id = ts.task_id
WHERE ts.score IS NOT NULL
  AND ts.status IN ('approved', 'rejected', 'needs_revision')
ON CONFLICT (user_id, task_id)
DO UPDATE SET
  score           = EXCLUDED.score,
  passed          = EXCLUDED.passed,
  feedback        = EXCLUDED.feedback,
  last_attempt_at = EXCLUDED.last_attempt_at,
  score_history   = EXCLUDED.score_history;
