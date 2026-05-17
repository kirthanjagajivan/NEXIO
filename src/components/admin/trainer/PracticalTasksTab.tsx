import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export function PracticalTasksTab() {
  const { t } = useLanguage();
  const [tasks] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.practical_tasks}</h1>
          <p className="text-gray-500 mt-1">{t.manage_practical_tasks}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm">
          <Plus size={16} />
          {t.create_task}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BookOpen size={16} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 text-sm">{t.practical_tasks}</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{t.no_tasks}</p>
            <p className="text-gray-400 text-sm mt-1">{t.create_first_task}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task: any) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">{task.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
