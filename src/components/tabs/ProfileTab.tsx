import { User, Mail, Globe, BarChart3, Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';
import { languageFlags } from '../../i18n/translations';
import type { Language } from '../../i18n/translations';

export function ProfileTab() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  if (!profile) return null;

  const proficiencyLabels: Record<string, string> = {
    beginner: t.proficiency_beginner,
    intermediate: t.proficiency_intermediate,
    advanced: t.proficiency_advanced,
    native: t.proficiency_native,
  };

  const roleLabels: Record<string, string> = {
    trainee: t.role_trainee,
    teacher: t.role_teacher,
    trainer: t.role_trainer,
  };

  const joinedDate = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24" />

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || 'User'}</h2>
              <p className="text-sm text-gray-500">{roleLabels[profile.role] || profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.profileEmail}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">{profile.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.profileLevel}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">{proficiencyLabels[profile.german_proficiency] || profile.german_proficiency}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.native_language}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {languageFlags[profile.native_language as Language] || ''} {t.languageNames[profile.native_language as Language] || profile.native_language}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Languages size={14} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.app_language}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {languageFlags[profile.app_language as Language] || ''} {t.languageNames[profile.app_language as Language] || profile.app_language}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-400">Joined {joinedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
