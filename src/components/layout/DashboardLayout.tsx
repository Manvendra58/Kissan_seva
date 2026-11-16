import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Loader2 } from 'lucide-react';
import { FarmingAssistant } from '@/components/FarmingAssistant';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const DashboardLayout = ({ children, requireAdmin = false }: DashboardLayoutProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (requireAdmin && !isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen garden-panel leaf-pattern">
      <Sidebar />
      <main className="flex-1 overflow-auto relative pt-16 md:pt-0">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-50/20 to-emerald-50/30" />
        <div className="relative p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      <FarmingAssistant />
    </div>
  );
};
