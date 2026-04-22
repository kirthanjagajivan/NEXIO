import { User } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function ProfileTab() {
  const { t } = useLanguage();

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
              <h2 className="text-2xl font-bold text-gray-900">John Trainee</h2>
              <p className="text-sm text-gray-500">Joined 30 days ago</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.profileEmail}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">john@example.com</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.profileLevel}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">Beginner</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                {t.signOut}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
