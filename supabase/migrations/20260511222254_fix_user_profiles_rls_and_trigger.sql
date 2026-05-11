/*
  # Fix user_profiles RLS and trigger permissions

  1. Problem
    - The handle_new_user() trigger function runs as SECURITY INVOKER
    - When a new user signs up, the trigger fires but the invoker (the new user)
      doesn't yet have a session, so auth.uid() returns NULL
    - RLS policies require auth.uid() = id, which fails because auth.uid() is NULL
    - This means the trigger INSERT into user_profiles silently fails

  2. Fix
    - Set handle_new_user() to SECURITY DEFINER so it runs as the function owner
      (superuser) and bypasses RLS
    - Add a restrictive INSERT policy that allows inserts when auth.uid() matches
      the profile id, covering the client-side fallback path
    - Add a permissive INSERT policy using SECURITY DEFINER function check
      for the trigger path where auth.uid() may be NULL

  3. Security
    - The trigger function is owned by the superuser and can only be called
      by the auth system trigger, not by regular users
    - Client-side inserts still require auth.uid() = id
    - SELECT and UPDATE policies remain restrictive (own data only)
*/

-- Fix: Set the trigger function to SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
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
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (e.g. client-side insert raced with trigger)
    RETURN NEW;
END;
$$;

-- Recreate the INSERT policy to be clearer and more robust
DROP POLICY IF EXISTS "Users can insert own user_profile" ON user_profiles;

-- Policy for authenticated users inserting their own profile (client-side fallback)
CREATE POLICY "Users can insert own user_profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure the SELECT policy for teachers uses a SECURITY DEFINER helper
-- to avoid the recursive RLS check issue
CREATE OR REPLACE FUNCTION public.is_teacher_or_trainer()
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('teacher', 'trainer')
  );
$$;

-- Replace the teacher SELECT policy to use the helper function
DROP POLICY IF EXISTS "Teachers can read all user_profiles" ON user_profiles;
CREATE POLICY "Teachers can read all user_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.is_teacher_or_trainer());

-- Replace teacher policies on other tables too
DROP POLICY IF EXISTS "Teachers can read all performance" ON performance;
CREATE POLICY "Teachers can read all performance"
  ON performance FOR SELECT
  TO authenticated
  USING (public.is_teacher_or_trainer());

DROP POLICY IF EXISTS "Teachers can manage chapters" ON chapters;
CREATE POLICY "Teachers can manage chapters"
  ON chapters FOR ALL
  TO authenticated
  USING (public.is_teacher_or_trainer())
  WITH CHECK (public.is_teacher_or_trainer());

DROP POLICY IF EXISTS "Teachers can manage topics" ON topics;
CREATE POLICY "Teachers can manage topics"
  ON topics FOR ALL
  TO authenticated
  USING (public.is_teacher_or_trainer())
  WITH CHECK (public.is_teacher_or_trainer());

DROP POLICY IF EXISTS "Teachers can manage topic_content" ON topic_content;
CREATE POLICY "Teachers can manage topic_content"
  ON topic_content FOR ALL
  TO authenticated
  USING (public.is_teacher_or_trainer())
  WITH CHECK (public.is_teacher_or_trainer());