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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data?.app_language) {
      initLanguageFromProfile(data.app_language);
    }
    return data as Profile | null;
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          (async () => {
            const p = await fetchProfile(newSession.user.id);
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
        fetchProfile(existingSession.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(data: SignUpData): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signUp({
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
