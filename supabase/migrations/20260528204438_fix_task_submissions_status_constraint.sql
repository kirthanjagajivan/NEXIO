/*
  # Fix task_submissions status constraint

  The existing CHECK constraint only allows ('pending', 'submitted', 'reviewed')
  but the application uses ('pending', 'submitted', 'approved', 'rejected',
  'needs_revision'). This mismatch causes every trainer review to violate the
  constraint and silently fail (or error).

  Changes:
  1. Drop the old status check constraint.
  2. Add a new constraint with the full set of allowed values:
       pending         — created but not yet submitted by trainee
       submitted       — trainee has submitted, awaiting trainer review
       approved        — trainer approved the submission
       rejected        — trainer rejected the submission
       needs_revision  — trainer requested changes
  3. Tighten the trainee UPDATE RLS policy so it no longer blocks a
     resubmission when status is already 'submitted' (allows 'submitted' too).
*/

-- 1. Replace the status check constraint
ALTER TABLE task_submissions
  DROP CONSTRAINT IF EXISTS task_submissions_status_check;

ALTER TABLE task_submissions
  ADD CONSTRAINT task_submissions_status_check
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'submitted'::text,
    'approved'::text,
    'rejected'::text,
    'needs_revision'::text
  ]));

-- 2. Fix trainee UPDATE policy: allow resubmission from any trainee-editable status
DROP POLICY IF EXISTS "Trainees can update own submissions" ON task_submissions;

CREATE POLICY "Trainees can update own submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = trainee_id
    AND status = ANY (ARRAY['pending'::text, 'submitted'::text, 'needs_revision'::text])
  )
  WITH CHECK (
    auth.uid() = trainee_id
    AND status = ANY (ARRAY['pending'::text, 'submitted'::text, 'needs_revision'::text])
  );
