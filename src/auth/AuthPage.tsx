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

const ROLES: { value: UserRole; labelKey: string; icon: React.ReactNode; active: string; hover: string }[] = [
  { value: 'trainee', labelKey: 'role_trainee', icon: <Zap size={16} />, active: 'border-blue-500 bg-blue-500/20 text-blue-300', hover: 'hover:border-blue-500/60 hover:bg-blue-500/10' },
  { value: 'teacher', labelKey: 'role_teacher', icon: <GraduationCap size={16} />, active: 'border-emerald-500 bg-emerald-500/20 text-emerald-300', hover: 'hover:border-emerald-500/60 hover:bg-emerald-500/10' },
  { value: 'trainer', labelKey: 'role_trainer', icon: <Shield size={16} />, active: 'border-amber-500 bg-amber-500/20 text-amber-300', hover: 'hover:border-amber-500/60 hover:bg-amber-500/10' },
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
    if (!email.trim() || !password.trim()) { setError('required_field'); return; }
    if (mode === 'register' && !fullName.trim()) { setError('required_field'); return; }
    setSubmitting(true);
    if (mode === 'login') {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    } else {
      const { error: err } = await signUp({ email: email.trim(), password, full_name: fullName.trim(), role, native_language: nativeLanguage, german_proficiency: germanProficiency, app_language: appLanguage });
      if (err) setError(err);
    }
    setSubmitting(false);
  }

  const errorText = error ? (t[error as keyof typeof t] as string) || error : null;

  const inputCls = 'w-full px-4 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const selectCls = `${inputCls} bg-[#0F172A] appearance-none cursor-pointer`;

  return (
    <div className={`min-h-screen bg-[#0F172A] flex flex-col ${isRTL ? 'direction-rtl' : ''}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative w-full px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white text-sm font-bold tracking-tight">N</span>
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-wide">NEXIO</span>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5 tracking-widest uppercase">Learning Platform</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      {/* Main */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.welcome_title}</h1>
            <p className="text-slate-400 text-sm">{t.welcome_subtitle}</p>
          </div>

          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-black/40">
            {/* Mode toggle */}
            <div className="flex border-b border-slate-700/60">
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={`flex-1 py-3.5 font-semibold text-sm transition-all border-b-2 ${
                    mode === m
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m === 'login' ? t.login : t.register}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.full_name}</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder={t.full_name} />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.email}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder={t.email} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.password}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-10`} placeholder={t.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.role_label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => (
                        <button key={r.value} type="button" onClick={() => setRole(r.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${
                            role === r.value ? r.active : `border-slate-700 text-slate-500 ${r.hover}`
                          }`}>
                          {r.icon}
                          {t[r.labelKey as keyof typeof t] as string}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.native_language}</label>
                    <select value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value as Language)} className={selectCls}>
                      {APP_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{languageFlags[l.code]} {t.languageNames[l.code]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.german_proficiency}</label>
                    <select value={germanProficiency} onChange={(e) => setGermanProficiency(e.target.value as GermanProficiency)} className={selectCls}>
                      {PROFICIENCY_LEVELS.map((p) => (
                        <option key={p.value} value={p.value}>{t[p.labelKey as keyof typeof t] as string}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.app_language}</label>
                    <select value={appLanguage} onChange={(e) => setAppLanguage(e.target.value as Language)} className={selectCls}>
                      {APP_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{languageFlags[l.code]} {t.languageNames[l.code]}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {errorText && (
                <div className="px-4 py-2.5 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {errorText}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" />{mode === 'login' ? t.logging_in : t.registering}</>
                ) : (
                  mode === 'login' ? t.login_button : t.register_button
                )}
              </button>
            </form>

            <div className="px-6 pb-6 text-center">
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {mode === 'login' ? t.no_account : t.has_account}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
