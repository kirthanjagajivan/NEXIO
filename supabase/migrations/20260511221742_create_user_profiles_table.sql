/*
  # Create user_profiles table and update trigger

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `role` (text: 'trainee' | 'teacher' | 'trainer')
      - `native_language` (text, default 'de')
      - `german_proficiency` (text, default 'beginner')
      - `app_language` (text, default 'de')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Users can read own profile
    - Users can insert own profile (for client-side signup fallback)
    - Users can update own profile
    - Teachers/trainers can read all user_profiles

  3. Changes
    - Update handle_new_user() trigger to insert into user_profiles instead of profiles
    - This ensures the trigger creates the profile row on auth.users insert

  4. Important Notes
    1. The trigger runs as superuser and bypasses RLS, so it can always insert
    2. The client-side INSERT policy allows users to insert their own row as a fallback
    3. The `profiles` table is left intact (not dropped) to avoid data loss
*/

CREATE TABLE IF NOT EXISTS user_profiles (
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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own user_profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own user_profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can read all user_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  );

-- Update the trigger function to insert into user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role, native_language, german_proficiency, app_language)
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

-- Also update performance RLS to reference user_profiles instead of profiles
DROP POLICY IF EXISTS "Teachers can read all performance" ON performance;
CREATE POLICY "Teachers can read all performance"
  ON performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  );

-- Update chapters/topics/topic_content teacher policies to reference user_profiles
DROP POLICY IF EXISTS "Teachers can manage chapters" ON chapters;
CREATE POLICY "Teachers can manage chapters"
  ON chapters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  );

DROP POLICY IF EXISTS "Teachers can manage topics" ON topics;
CREATE POLICY "Teachers can manage topics"
  ON topics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  );

DROP POLICY IF EXISTS "Teachers can manage topic_content" ON topic_content;
CREATE POLICY "Teachers can manage topic_content"
  ON topic_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'trainer')
    )
  );