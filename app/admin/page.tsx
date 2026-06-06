'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, getPlatformStats, updateUserProfile } from '@/lib/firebase/firestore';
import { AppUser, PlatformStats, SubAdminPermissions } from '@/types';
import {
  Users, Activity, MessageSquare, Shield, UserCog,
  ToggleLeft, ToggleRight, Plus, X, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EMPTY_PERMS: SubAdminPermissions = {
  manageUsers: false,
  viewAnalytics: false,
  manageContent: false,
  viewLogs: false,
};

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tab, setTab] = useState<'overview' | 'users' | 'create'>('overview');
  const [loadingData, setLoadingData] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ email: '', displayName: '', password: '' });
  const [newPerms, setNewPerms] = useState<SubAdminPermissions>({ ...EMPTY_PERMS });
  const [creating, setCreating] = useState(false);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'super_admin')) {
      router.push('/chat');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile?.role !== 'super_admin') return;
    async function load() {
      const [u, s] = await Promise.all([getAllUsers(), getPlatformStats()]);
      setUsers(u);
      setStats(s);
      setLoadingData(false);
    }
    load();
  }, [profile]);

  async function toggleUser(uid: string, current: boolean) {
    if (!user) return;
    setTogglingUser(uid);
    await fetch('/api/admin/toggle-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: uid, isActive: !current, requesterId: user.uid }),
    });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !current } : u));
    setTogglingUser(null);
  }

  async function promoteToSubAdmin(uid: string) {
    if (!user) return;
    await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: uid, role: 'sub_admin', permissions: EMPTY_PERMS, requesterId: user.uid }),
    });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: 'sub_admin', permissions: EMPTY_PERMS } : u));
  }

  async function updateSubAdminPerms(uid: string, perms: SubAdminPermissions) {
    if (!user) return;
    await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: uid, role: 'sub_admin', permissions: perms, requesterId: user.uid }),
    });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, permissions: perms } : u));
  }

  async function demoteToUser(uid: string) {
    if (!user) return;
    await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: uid, role: 'user', permissions: null, requesterId: user.uid }),
    });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: 'user', permissions: undefined } : u));
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-app-primary flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent)' }} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: Activity },
    { label: 'Total Chats', value: stats?.totalChats ?? 0, icon: MessageSquare },
    { label: 'Total Messages', value: stats?.totalMessages ?? 0, icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-app-primary">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <Shield size={20} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 className="text-lg font-bold text-app-primary">Admin Dashboard</h1>
          <p className="text-xs text-app-muted">Super Admin Control Panel</p>
        </div>
        <button onClick={() => router.push('/chat')} className="ml-auto text-sm text-app-muted hover:text-app-primary transition-colors">
          ← Back to Chat
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          {(['overview', 'users', 'create'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                tab === t ? 'text-white' : 'text-app-muted hover:text-app-primary'
              )}
              style={tab === t ? { background: 'var(--accent)' } : {}}
            >
              {t === 'create' ? 'Create Sub-Admin' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="panel p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-app-muted uppercase tracking-wider">{label}</span>
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-3xl font-bold text-app-primary">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="panel p-5">
              <h3 className="text-sm font-semibold text-app-primary mb-4">Role Distribution</h3>
              <div className="space-y-3">
                {(['super_admin', 'sub_admin', 'user'] as const).map((role) => {
                  const count = users.filter((u) => u.role === role).length;
                  const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <span className="text-xs text-app-secondary w-28 capitalize">{role.replace('_', ' ')}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                      </div>
                      <span className="text-xs text-app-muted w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map((u) => (
              <UserRow
                key={u.uid}
                user={u}
                currentUid={user?.uid ?? ''}
                onToggle={toggleUser}
                onPromote={promoteToSubAdmin}
                onDemote={demoteToUser}
                onUpdatePerms={updateSubAdminPerms}
                toggling={togglingUser === u.uid}
              />
            ))}
          </div>
        )}

        {/* Create Sub-Admin */}
        {tab === 'create' && (
          <div className="max-w-lg">
            <div className="panel p-6 space-y-4">
              <h2 className="text-base font-semibold text-app-primary mb-2">Create Sub-Admin Account</h2>
              <div>
                <label className="block text-xs font-medium text-app-secondary mb-1.5">Display Name</label>
                <input
                  type="text"
                  className="input-base text-sm"
                  placeholder="Jane Smith"
                  value={newAdmin.displayName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-app-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  className="input-base text-sm"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-app-secondary mb-1.5">Password</label>
                <input
                  type="password"
                  className="input-base text-sm"
                  placeholder="••••••••"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-app-secondary mb-3">Permissions</label>
                <div className="space-y-2">
                  {(Object.keys(EMPTY_PERMS) as (keyof SubAdminPermissions)[]).map((perm) => (
                    <label key={perm} className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-app-input transition-colors">
                      <span className="text-sm text-app-primary capitalize">
                        {perm.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div
                        onClick={() => setNewPerms({ ...newPerms, [perm]: !newPerms[perm] })}
                        className="cursor-pointer"
                      >
                        {newPerms[perm]
                          ? <ToggleRight size={22} style={{ color: 'var(--accent)' }} />
                          : <ToggleLeft size={22} className="text-app-muted" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={creating || !newAdmin.email || !newAdmin.password || !newAdmin.displayName}
                className="btn-primary w-full py-3 disabled:opacity-50"
                onClick={async () => {
                  setCreating(true);
                  try {
                    const { registerUser } = await import('@/lib/firebase/auth');
                    const u = await registerUser(newAdmin.email, newAdmin.password, newAdmin.displayName);
                    await fetch('/api/admin/set-role', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ targetUid: u.uid, role: 'sub_admin', permissions: newPerms, requesterId: user?.uid }),
                    });
                    setNewAdmin({ email: '', displayName: '', password: '' });
                    setNewPerms({ ...EMPTY_PERMS });
                    setTab('users');
                    const updatedUsers = await getAllUsers();
                    setUsers(updatedUsers);
                  } finally {
                    setCreating(false);
                  }
                }}
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

function UserRow({
  user, currentUid, onToggle, onPromote, onDemote, onUpdatePerms, toggling,
}: {
  user: AppUser;
  currentUid: string;
  onToggle: (uid: string, current: boolean) => void;
  onPromote: (uid: string) => void;
  onDemote: (uid: string) => void;
  onUpdatePerms: (uid: string, perms: SubAdminPermissions) => void;
  toggling: boolean;
}) {
  const [showPerms, setShowPerms] = useState(false);
  const isSelf = user.uid === currentUid;
  const perms = user.permissions ?? { ...EMPTY_PERMS };

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-app-primary truncate">{user.displayName ?? '—'}</p>
          <p className="text-xs text-app-muted truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs px-2 py-1 rounded-full capitalize"
            style={{
              background: user.role === 'super_admin'
                ? 'rgba(255,0,51,0.15)'
                : user.role === 'sub_admin'
                ? 'rgba(59,130,246,0.15)'
                : 'var(--bg-input)',
              color: user.role === 'super_admin'
                ? 'var(--accent)'
                : user.role === 'sub_admin'
                ? '#60a5fa'
                : 'var(--text-muted)',
            }}
          >
            {user.role.replace('_', ' ')}
          </span>

          {!isSelf && user.role !== 'super_admin' && (
            <>
              <button
                onClick={() => onToggle(user.uid, user.isActive)}
                disabled={toggling}
                className="text-app-muted hover:text-app-primary transition-colors disabled:opacity-40"
                title={user.isActive ? 'Deactivate' : 'Activate'}
              >
                {user.isActive
                  ? <ToggleRight size={20} style={{ color: 'var(--accent)' }} />
                  : <ToggleLeft size={20} />}
              </button>

              {user.role === 'user' ? (
                <button onClick={() => onPromote(user.uid)} className="text-xs px-2 py-1 rounded-lg hover:bg-app-input text-app-muted transition-colors">
                  → Sub-Admin
                </button>
              ) : (
                <>
                  <button onClick={() => setShowPerms(!showPerms)} className="text-xs px-2 py-1 rounded-lg hover:bg-app-input text-app-muted transition-colors flex items-center gap-1">
                    Perms <ChevronDown size={11} />
                  </button>
                  <button onClick={() => onDemote(user.uid)} className="text-xs px-2 py-1 rounded-lg hover:bg-app-input text-red-400 transition-colors">
                    Demote
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showPerms && user.role === 'sub_admin' && (
        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: 'var(--border)' }}>
          {(Object.keys(EMPTY_PERMS) as (keyof SubAdminPermissions)[]).map((perm) => (
            <label key={perm} className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-app-input cursor-pointer transition-colors">
              <span className="text-xs text-app-secondary capitalize">{perm.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div onClick={() => {
                const updated = { ...perms, [perm]: !perms[perm] };
                onUpdatePerms(user.uid, updated);
              }}>
                {perms[perm]
                  ? <ToggleRight size={18} style={{ color: 'var(--accent)' }} />
                  : <ToggleLeft size={18} className="text-app-muted" />}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
