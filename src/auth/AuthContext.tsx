import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { Language } from '../i18n/translations';
import { initLanguageFromProfile } from '../i18n/LanguageContext';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'trainee' | 'teacher' | 'trainer';
type GermanProficiency = 'beginner' | 'intermediate' | 'advanced' | 'native';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  native_language: Language;
  german_proficiency: GermanProficiency;
  app_language: Language;
}

interface ProfileData {
  email: string;
  full_name: string;
  role: UserRole;
  native_language: Language;
  german_proficiency: GermanProficiency;
  app_language: Language;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data?.app_language) {
      initLanguageFromProfile(data.app_language);
    }
    return data as Profile | null;
  }

  async function ensureProfile(userId: string, data: ProfileData): Promise<Profile | null> {
    let p = await fetchProfile(userId);
    if (p) return p;

    const { data: inserted, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        native_language: data.native_language,
        german_proficiency: data.german_proficiency,
        app_language: data.app_language,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Failed to create user profile:', error.message);
      return null;
    }

    if (inserted?.app_language) {
      initLanguageFromProfile(inserted.app_language);
    }
    return inserted as Profile | null;
  }

  function metaToProfileData(user: User): ProfileData {
    const meta = user.user_metadata ?? {};
    return {
      email: user.email ?? '',
      full_name: meta.full_name ?? '',
      role: meta.role ?? 'trainee',
      native_language: meta.native_language ?? 'de',
      german_proficiency: meta.german_proficiency ?? 'beginner',
      app_language: meta.app_language ?? 'de',
    };
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          (async () => {
            let p = await fetchProfile(newSession.user.id);
            if (!p) {
              p = await ensureProfile(newSession.user.id, metaToProfileData(newSession.user));
            }
            setProfile(p);
          })();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        (async () => {
          let p = await fetchProfile(existingSession.user.id);
          if (!p) {
            p = await ensureProfile(existingSession.user.id, metaToProfileData(existingSession.user));
          }
          setProfile(p);
          setLoading(false);
        })();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(data: SignUpData): Promise<{ error: string | null }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
          native_language: data.native_language,
          german_proficiency: data.german_proficiency,
          app_language: data.app_language,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) return { error: 'email_in_use' };
      if (error.message.includes('password')) return { error: 'weak_password' };
      return { error: error.message };
    }

    if (authData.user) {
      const profileData: ProfileData = {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        native_language: data.native_language,
        german_proficiency: data.german_proficiency,
        app_language: data.app_language,
      };
      const p = await ensureProfile(authData.user.id, profileData);
      if (p) {
        setProfile(p);
        setUser(authData.user);
        setSession(authData.session);
      }
    }

    return { error: null };
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'invalid_credentials' };
      return { error: error.message };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
