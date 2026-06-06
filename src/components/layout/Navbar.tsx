import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/firebase/auth';
import { LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  const roleLabel = { super_admin: 'Super Admin', sub_admin: 'Sub Admin', user: 'Member' }[profile?.role ?? 'user'];
  const initial = (profile?.displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <header className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold tracking-widest text-xs" style={{ color: 'var(--accent)' }}>EQUINOX</span>
        <span>·</span>
        <span>{roleLabel}</span>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-input"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: 'var(--accent)' }}>
            {initial}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{profile?.displayName ?? 'User'}</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{profile?.displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <div className="p-1.5">
              <button onClick={() => { setOpen(false); navigate('/settings'); }} className="sidebar-link w-full text-xs">
                <Settings size={14} /> Settings
              </button>
              <button onClick={handleLogout} className="sidebar-link w-full text-xs" style={{ color: '#f87171' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
