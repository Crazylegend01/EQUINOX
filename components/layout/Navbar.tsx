'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/firebase/auth';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await logoutUser();
    router.push('/login');
  }

  const roleLabel = profile?.role === 'super_admin'
    ? 'Super Admin' : profile?.role === 'sub_admin'
    ? 'Sub Admin' : 'Member';

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-app-muted">EQUINOX</span>
        <span className="text-app-muted">·</span>
        <span className="text-sm text-app-secondary">{roleLabel}</span>
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-app-input"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {(profile?.displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-app-primary leading-tight">
              {profile?.displayName ?? 'User'}
            </p>
            <p className="text-xs text-app-muted leading-tight">{user?.email}</p>
          </div>
          <ChevronDown size={14} className="text-app-muted" />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-panel z-50 overflow-hidden animate-fade-in"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold text-app-primary truncate">{profile?.displayName}</p>
              <p className="text-xs text-app-muted truncate">{user?.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => { setOpen(false); router.push('/settings'); }}
                className="sidebar-item w-full text-xs"
              >
                <Settings size={14} /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="sidebar-item w-full text-xs text-red-400 hover:text-red-400"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
