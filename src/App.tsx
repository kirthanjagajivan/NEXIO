import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthPage } from './auth/AuthPage';
import { TraineeDashboard } from './components/TraineeDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TrainerDashboard } from './components/admin/TrainerDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  if (profile.role === 'trainee') {
    return <TraineeDashboard onSignOut={signOut} />;
  }

  if (profile.role === 'trainer') {
    return <TrainerDashboard onSignOut={signOut} />;
  }

  return <AdminDashboard onSignOut={signOut} />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
