import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { Language, languageFlags } from '../i18n/translations';
import { Zap, GraduationCap, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register';
type UserRole = 'trainee' | 'teacher' | 'trainer';
type GermanProficiency = 'beginner' | 'intermediate' | 'advanced' | 'native';

const APP_LANGUAGES: { code: Language; labelKey: string }[] = [
  { code: 'en', labelKey: 'en' },
  { code: 'de', labelKey: 'de' },
  { code: 'tr', labelKey: 'tr' },
  { code: 'ar', labelKey: 'ar' },
  { code: 'ru', labelKey: 'ru' },
];

const PROFICIENCY_LEVELS: { value: GermanProficiency; labelKey: string }[] = [
  { value: 'beginner', labelKey: 'proficiency_beginner' },
  { value: 'intermediate', labelKey: 'proficiency_intermediate' },
  { value: 'advanced', labelKey: 'proficiency_advanced' },
  { value: 'native', labelKey: 'proficiency_native' },
];

const ROLES: { value: UserRole; labelKey: string; icon: React.ReactNode; color: string }[] = [
  { value: 'trainee', labelKey: 'role_trainee', icon: <Zap size={18} />, color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'teacher', labelKey: 'role_teacher', icon: <GraduationCap size={18} />, color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'trainer', labelKey: 'role_trainer', icon: <Shield size={18} />, color: 'border-amber-500 bg-amber-50 text-amber-700' },
];

export function AuthPage() {
  const { t, isRTL } = useLanguage();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('trainee');
  const [nativeLanguage, setNativeLanguage] = useState<Language>('de');
  const [germanProficiency, setGermanProficiency] = useState<GermanProficiency>('beginner');
  const [appLanguage, setAppLanguage] = useState<Language>('de');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('required_field');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('required_field');
      return;
    }

    setSubmitting(true);

    if (mode === 'login') {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    } else {
      const { error: err } = await signUp({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
        native_language: nativeLanguage,
        german_proficiency: germanProficiency,
        app_language: appLanguage,
      });
      if (err) setError(err);
    }

    setSubmitting(false);
  }

  const errorText = error ? (t[error as keyof typeof t] as string) || error : null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col ${isRTL ? 'direction-rtl' : ''}`}>
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">App</span>
        </div>
        <LanguageSelector />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {t.welcome_title}
            </h1>
            <p className="text-gray-500">
              {t.welcome_subtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-3.5 font-medium text-sm transition-all border-b-2 ${
                  mode === 'login'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.login}
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-3.5 font-medium text-sm transition-all border-b-2 ${
                  mode === 'register'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.register}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.full_name}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t.full_name}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                    placeholder={t.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.role_label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-xs font-semibold ${
                            role === r.value ? r.color : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {r.icon}
                          {t[r.labelKey as keyof typeof t] as string}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.native_language}</label>
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value as Language)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {APP_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {languageFlags[l.code]} {t.languageNames[l.code]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.german_proficiency}</label>
                    <select
                      value={germanProficiency}
                      onChange={(e) => setGermanProficiency(e.target.value as GermanProficiency)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {PROFICIENCY_LEVELS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {t[p.labelKey as keyof typeof t] as string}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.app_language}</label>
                    <select
                      value={appLanguage}
                      onChange={(e) => setAppLanguage(e.target.value as Language)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {APP_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {languageFlags[l.code]} {t.languageNames[l.code]}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {errorText && (
                <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorText}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === 'login' ? t.logging_in : t.registering}
                  </>
                ) : (
                  mode === 'login' ? t.login_button : t.register_button
                )}
              </button>
            </form>

            <div className="px-6 pb-6 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? t.no_account : t.has_account}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
