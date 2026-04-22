import { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { RoleSelector } from './components/RoleSelector';
import { TraineeDashboard } from './components/TraineeDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppContent() {
  const [role, setRole] = useState<'trainee' | 'teacher' | null>(null);

  if (!role) {
    return <RoleSelector onSelectRole={setRole} />;
  }

  if (role === 'trainee') {
    return <TraineeDashboard onSignOut={() => setRole(null)} />;
  }

  return <AdminDashboard onSignOut={() => setRole(null)} />;
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
