/*
  # Add language support to topic_content

  ## Summary
  Extends topic_content to store one row per topic per language, enabling
  admins to upload content in multiple languages without AI translation.

  ## Changes

  ### topic_content table
  - Add `language` column (text, default 'en') — stores the language code for this content row
  - Drop the old unique constraint (if any) and add a new unique constraint on (topic_id, language)
    so each topic can have at most one content record per language

  ## Notes
  1. Existing rows will default to language = 'en'
  2. The unique constraint (topic_id, language) replaces the implicit one-per-topic assumption
  3. Existing RLS policies remain unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'topic_content' AND column_name = 'language'
  ) THEN
    ALTER TABLE topic_content ADD COLUMN language text NOT NULL DEFAULT 'en';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'topic_content_topic_id_language_key'
  ) THEN
    ALTER TABLE topic_content ADD CONSTRAINT topic_content_topic_id_language_key UNIQUE (topic_id, language);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_topic_content_language ON topic_content(language);
