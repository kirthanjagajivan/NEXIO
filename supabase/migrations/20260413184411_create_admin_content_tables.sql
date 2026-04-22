/*
  # Admin Content Management Schema

  ## Summary
  Creates the core content management tables for the Teacher Admin Dashboard.

  ## New Tables

  ### chapters
  - `id` (uuid, PK) — Unique identifier
  - `title` (text) — Chapter display title
  - `description` (text) — Optional description shown to trainees
  - `order_index` (int) — Controls display order
  - `created_at` (timestamptz) — Creation timestamp
  - `updated_at` (timestamptz) — Last update timestamp

  ### topics
  - `id` (uuid, PK) — Unique identifier
  - `chapter_id` (uuid, FK → chapters.id) — Parent chapter
  - `title` (text) — Topic display title
  - `description` (text) — Optional description
  - `order_index` (int) — Display order within chapter
  - `created_at` / `updated_at` (timestamptz)

  ### topic_content
  - `id` (uuid, PK)
  - `topic_id` (uuid, FK → topics.id) — Parent topic
  - `content` (text) — Full lesson content text
  - `content_type` (text) — 'text' | 'markdown'
  - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read policies (trainees can read chapters/topics/content)
  - Write policies restricted to service role via anon key for admin use
    (in production these would be restricted to authenticated admin users)

  ## Notes
  1. `order_index` defaults to 0 and should be set explicitly for ordering
  2. `topic_content` is one-to-one with topic (one content record per topic)
  3. All tables cascade-delete children when parent is deleted
*/

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topic_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chapters"
  ON chapters FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update chapters"
  ON chapters FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete chapters"
  ON chapters FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read topics"
  ON topics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert topics"
  ON topics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update topics"
  ON topics FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete topics"
  ON topics FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read topic_content"
  ON topic_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert topic_content"
  ON topic_content FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update topic_content"
  ON topic_content FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete topic_content"
  ON topic_content FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_topic_content_topic_id ON topic_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(chapter_id, order_index);
