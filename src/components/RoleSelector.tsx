import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { Zap, GraduationCap, ArrowRight } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'trainee' | 'teacher') => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-[#0F172A] flex flex-col ${isRTL ? 'direction-rtl' : ''}`}>
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/8 blur-3xl" />
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

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold tracking-wider uppercase mb-6">
              Welcome to NEXIO
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              {t.selectRole}
            </h1>
            <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
              {t.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              onClick={() => onSelectRole('trainee')}
              className="group relative p-8 bg-[#1E293B] border border-slate-700/60 rounded-2xl hover:border-blue-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 text-start overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="text-blue-400" size={26} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{t.trainee}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{t.traineeDesc}</p>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('teacher')}
              className="group relative p-8 bg-[#1E293B] border border-slate-700/60 rounded-2xl hover:border-emerald-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 text-start overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="text-emerald-400" size={26} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{t.teacher}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{t.teacherDesc}</p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
