/*
  # Create profiles and performance tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `role` (text: 'trainee' | 'teacher' | 'trainer')
      - `native_language` (text, default 'de')
      - `german_proficiency` (text, default 'beginner')
      - `app_language` (text, default 'de')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `performance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `topic_id` (uuid, references topics)
      - `lesson_name` (text)
      - `score` (integer)
      - `total` (integer)
      - `passed` (boolean)
      - `attempts` (integer, default 1)
      - `last_attempt_at` (timestamptz)
      - `score_history` (jsonb, default '[]')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Enable RLS on `performance` table
    - Profiles: users can read own data, users can update own data
    - Performance: users can read own data, users can insert own data, users can update own data
    - Teachers/trainers can read all profiles and performance data

  3. Important Notes
    1. The `profiles` table uses auth.users.id as its primary key via a foreign key
    2. The `performance` table tracks quiz attempts per user per topic
    3. A trigger function is included to auto-create a profile on user signup
    4. RLS policies ensure users can only access their own data unless they are a teacher/trainer
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'trainee' CHECK (role IN ('trainee', 'teacher', 'trainer')),
  native_language text NOT NULL DEFAULT 'de',
  german_proficiency text NOT NULL DEFAULT 'beginner' CHECK (german_proficiency IN ('beginner', 'intermediate', 'advanced', 'native')),
  app_language text NOT NULL DEFAULT 'de',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  );

-- Create performance table
CREATE TABLE IF NOT EXISTS performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  lesson_name text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 1,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  score_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own performance"
  ON performance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance"
  ON performance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance"
  ON performance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can read all performance"
  ON performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  );

-- Create unique index on performance (user_id, topic_id) for upsert
CREATE UNIQUE INDEX IF NOT EXISTS performance_user_topic_unique
  ON performance (user_id, topic_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, native_language, german_proficiency, app_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainee'),
    COALESCE(NEW.raw_user_meta_data->>'native_language', 'de'),
    COALESCE(NEW.raw_user_meta_data->>'german_proficiency', 'beginner'),
    COALESCE(NEW.raw_user_meta_data->>'app_language', 'de')
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies for chapters, topics, topic_content to allow authenticated reads
-- (These tables already exist with RLS enabled, we need to add read policies for authenticated users)

CREATE POLICY "Authenticated users can read chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read topic_content"
  ON topic_content FOR SELECT
  TO authenticated
  USING (true);

-- Allow teachers/trainers to manage chapters, topics, content
CREATE POLICY "Teachers can manage chapters"
  ON chapters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  );

CREATE POLICY "Teachers can manage topics"
  ON topics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  );

CREATE POLICY "Teachers can manage topic_content"
  ON topic_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'trainer')
    )
  );