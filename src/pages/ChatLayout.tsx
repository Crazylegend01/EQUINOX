import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Navbar  from '@/components/layout/Navbar';
import Spinner from '@/components/ui/Spinner';

export default function ChatLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <Spinner fullscreen />;
  if (!user)   return null;

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
