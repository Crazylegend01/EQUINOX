import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  getAllUsers, getPlatformStats, updateUserRole, toggleUserActive,
  updateUserProfile,
} from '@/lib/firebase/firestore';
import { registerUser } from '@/lib/firebase/auth';
import type { AppUser, PlatformStats, SubAdminPermissions } from '@/types';
import { Shield, Users, MessageSquare, Activity, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const EMPTY_PERMS: SubAdminPermissions = {
  manageUsers: false, viewAnalytics: false, manageContent: false, viewLogs: false,
};

type Tab = 'overview' | 'users' | 'create';

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]     = useState<AppUser[]>([]);
  const [stats, setStats]     = useState<PlatformStats | null>(null);
  const [tab, setTab]         = useState<Tab>('overview');
  const [busy, setBusy]       = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [newPerms, setNewPerms] = useState<SubAdminPermissions>({ ...EMPTY_PERMS });
  const [creating, setCreating] = useState(false);
  const [togglingUid, setTogglingUid] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'super_admin')) navigate('/chat');
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (profile?.role !== 'super_admin') return;
    Promise.all([getAllUsers(), getPlatformStats()]).then(([u, s]) => {
      setUsers(u); setStats(s); setBusy(false);
    });
  }, [profile]);

  async function handleToggle(uid: string, current: boolean) {
    setTogglingUid(uid);
    await toggleUserActive(uid, !current);
    setUsers(p => p.map(u => u.uid === uid ? { ...u, isActive: !current } : u));
    setTogglingUid(null);
  }

  async function handleSetRole(uid: string, role: AppUser['role'], perms?: SubAdminPermissions) {
    await updateUserRole(uid, role, perms);
    setUsers(p => p.map(u => u.uid === uid ? { ...u, role, permissions: perms } : u));
  }

  async function handleCreateSubAdmin() {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) return;
    setCreating(true);
    try {
      const u = await registerUser(newAdmin.email, newAdmin.password, newAdmin.name);
      await updateUserRole(u.uid, 'sub_admin', newPerms);
      const updated = await getAllUsers();
      setUsers(updated);
      setNewAdmin({ name: '', email: '', password: '' });
      setNewPerms({ ...EMPTY_PERMS });
      setTab('users');
    } finally { setCreating(false); }
  }

  if (loading || busy) return <Spinner fullscreen />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: Activity },
    { label: 'Total Chats', value: stats?.totalChats ?? 0, icon: MessageSquare },
    { label: 'Messages', value: stats?.totalMessages ?? 0, icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-app">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <Shield size={20} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Super Admin Control Panel</p>
        </div>
        <button onClick={() => navigate('/chat')} className="ml-auto text-sm btn-ghost">← Chat</button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit mb-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          {(['overview', 'users', 'create'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all', tab === t ? 'text-white' : 'btn-ghost')}
              style={tab === t ? { background: 'var(--accent)' } : {}}
            >
              {t === 'create' ? 'Create Sub-Admin' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <Icon size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Role Distribution</h3>
              {(['super_admin', 'sub_admin', 'user'] as const).map(role => {
                const count = users.filter(u => u.role === role).length;
                const pct   = users.length ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={role} className="flex items-center gap-3 mb-3">
                    <span className="text-xs w-28 capitalize" style={{ color: 'var(--text-secondary)' }}>{role.replace('_', ' ')}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="text-xs w-6 text-right" style={{ color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <UserRow
                key={u.uid}
                user={u}
                isSelf={u.uid === user?.uid}
                onToggle={handleToggle}
                onSetRole={handleSetRole}
                toggling={togglingUid === u.uid}
              />
            ))}
            {users.length === 0 && <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No users found.</p>}
          </div>
        )}

        {/* CREATE */}
        {tab === 'create' && (
          <div className="max-w-md">
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Create Sub-Admin Account</h2>

              {[['Full Name', 'text', 'Alex Smith', 'name'], ['Email', 'email', 'admin@example.com', 'email'], ['Password', 'password', '••••••••', 'password']].map(([label, type, placeholder, key]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input
                    type={type}
                    className="input text-sm"
                    placeholder={placeholder}
                    value={newAdmin[key as keyof typeof newAdmin]}
                    onChange={e => setNewAdmin(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Permissions</label>
                <div className="space-y-1">
                  {(Object.keys(EMPTY_PERMS) as (keyof SubAdminPermissions)[]).map(perm => (
                    <div
                      key={perm}
                      onClick={() => setNewPerms(p => ({ ...p, [perm]: !p[perm] }))}
                      className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-input"
                    >
                      <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                        {perm.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {newPerms[perm]
                        ? <ToggleRight size={22} style={{ color: 'var(--accent)' }} />
                        : <ToggleLeft  size={22} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateSubAdmin}
                disabled={creating || !newAdmin.email || !newAdmin.password || !newAdmin.name}
                className="btn-accent w-full py-3"
              >
                {creating ? 'Creating…' : 'Create Sub-Admin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, isSelf, onToggle, onSetRole, toggling }: {
  user: AppUser;
  isSelf: boolean;
  onToggle: (uid: string, current: boolean) => void;
  onSetRole: (uid: string, role: AppUser['role'], perms?: SubAdminPermissions) => void;
  toggling: boolean;
}) {
  const [showPerms, setShowPerms] = useState(false);
  const perms = user.permissions ?? { ...EMPTY_PERMS };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: 'var(--accent)' }}>
          {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.displayName ?? '—'}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
            style={{
              background: user.role === 'super_admin' ? 'rgba(255,0,51,0.12)' : user.role === 'sub_admin' ? 'rgba(59,130,246,0.12)' : 'var(--bg-input)',
              color:      user.role === 'super_admin' ? 'var(--accent)'       : user.role === 'sub_admin' ? '#60a5fa'                 : 'var(--text-muted)',
            }}
          >
            {user.role.replace('_', ' ')}
          </span>

          {!isSelf && user.role !== 'super_admin' && (
            <>
              <button
                onClick={() => onToggle(user.uid, user.isActive)}
                disabled={toggling}
                title={user.isActive ? 'Deactivate' : 'Activate'}
                style={{ color: user.isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>

              {user.role === 'user' ? (
                <button onClick={() => onSetRole(user.uid, 'sub_admin', { ...EMPTY_PERMS })} className="text-xs btn-ghost px-2 py-1">→ Sub-Admin</button>
              ) : (
                <>
                  <button onClick={() => setShowPerms(s => !s)} className="flex items-center gap-1 text-xs btn-ghost px-2 py-1">
                    Perms <ChevronDown size={11} />
                  </button>
                  <button onClick={() => onSetRole(user.uid, 'user', undefined)} className="text-xs px-2 py-1 rounded-xl transition-colors hover:bg-input" style={{ color: '#f87171' }}>Demote</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showPerms && user.role === 'sub_admin' && (
        <div className="mt-3 pt-3 grid grid-cols-2 gap-1" style={{ borderTop: '1px solid var(--border)' }}>
          {(Object.keys(EMPTY_PERMS) as (keyof SubAdminPermissions)[]).map(perm => (
            <div
              key={perm}
              onClick={() => {
                const updated = { ...perms, [perm]: !perms[perm] };
                onSetRole(user.uid, 'sub_admin', updated);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors hover:bg-input"
            >
              <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{perm.replace(/([A-Z])/g, ' $1').trim()}</span>
              {perms[perm]
                ? <ToggleRight size={17} style={{ color: 'var(--accent)' }} />
                : <ToggleLeft  size={17} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
