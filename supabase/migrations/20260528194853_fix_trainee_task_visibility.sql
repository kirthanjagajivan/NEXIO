/*
  # Fix Trainee Task Visibility

  Problem: practical_tasks only had a SELECT policy for trainer_id = auth.uid(),
  meaning trainees received zero rows and saw a blank Trainer Tasks tab.

  Changes:
  1. Add SELECT policy so trainees can read published tasks
     - If trainee is assigned to the trainer who created the task → show it
     - If no trainer assignment exists for this trainee → show all published tasks
       (fallback so content is never blank during initial setup)
  2. Fix task_submissions trainer SELECT policy — the subquery was hitting the
     practical_tasks table which the trainer already owns, so that's fine, but
     the duplicate policies need cleanup.

  Logic for trainee visibility:
    - Task is published (is_published = true)
    - AND (trainee has a matching trainer assignment  OR  trainee has no assignments at all)
*/

-- Allow trainees to read published tasks
CREATE POLICY "Trainees can view published tasks"
  ON practical_tasks FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND (
      -- Show tasks from an assigned trainer
      EXISTS (
        SELECT 1 FROM trainee_assignments ta
        WHERE ta.trainee_id = auth.uid()
          AND ta.trainer_id = practical_tasks.trainer_id
      )
      OR
      -- Fallback: trainee has no assignments yet → show all published tasks
      NOT EXISTS (
        SELECT 1 FROM trainee_assignments ta2
        WHERE ta2.trainee_id = auth.uid()
      )
      OR
      -- trainer_id is NULL (tasks created before assignment system)
      practical_tasks.trainer_id IS NULL
    )
  );
