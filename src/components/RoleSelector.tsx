import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { Zap, GraduationCap } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'trainee' | 'teacher') => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t, isRTL } = useLanguage();

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
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t.selectRole}
            </h1>
            <p className="text-lg text-gray-500">
              {t.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => onSelectRole('trainee')}
              className="group relative p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all hover:shadow-lg overflow-hidden text-start"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t.trainee}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t.traineeDesc}
                </p>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('teacher')}
              className="group relative p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 transition-all hover:shadow-lg overflow-hidden text-start"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <GraduationCap className="text-emerald-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t.teacher}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t.teacherDesc}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
