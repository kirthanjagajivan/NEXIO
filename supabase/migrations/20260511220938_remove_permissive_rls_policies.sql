/*
  # Remove overly permissive RLS policies

  1. Changes
    - Drop "Anyone can..." policies on chapters, topics, and topic_content
    - These used USING (true) which defeats the purpose of RLS
    - Authenticated users can still read via the "Authenticated users can read..." policies
    - Teachers/trainers can still manage via the "Teachers can manage..." policies

  2. Security
    - After this migration, only authenticated users can read chapters/topics/content
    - Only teachers/trainers can write to chapters/topics/content
*/

DROP POLICY IF EXISTS "Anyone can delete chapters" ON chapters;
DROP POLICY IF EXISTS "Anyone can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
DROP POLICY IF EXISTS "Anyone can update chapters" ON chapters;

DROP POLICY IF EXISTS "Anyone can delete topics" ON topics;
DROP POLICY IF EXISTS "Anyone can insert topics" ON topics;
DROP POLICY IF EXISTS "Anyone can read topics" ON topics;
DROP POLICY IF EXISTS "Anyone can update topics" ON topics;

DROP POLICY IF EXISTS "Anyone can delete topic_content" ON topic_content;
DROP POLICY IF EXISTS "Anyone can insert topic_content" ON topic_content;
DROP POLICY IF EXISTS "Anyone can read topic_content" ON topic_content;
DROP POLICY IF EXISTS "Anyone can update topic_content" ON topic_content;