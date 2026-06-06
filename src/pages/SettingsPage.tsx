import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { Check, Palette, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import type { Theme } from '@/types';

const THEMES: { id: Theme; label: string; desc: string; swatches: string[] }[] = [
  { id: 'crimson-noir', label: 'Crimson Noir', desc: 'Premium black with crimson red accents (default)', swatches: ['#040404', '#131313', '#ff0033'] },
  { id: 'dark',         label: 'Dark Mode',    desc: 'Slate dark with blue accents',                   swatches: ['#0f172a', '#1e293b', '#3b82f6'] },
  { id: 'light',        label: 'Light Mode',   desc: 'Clean white interface with red accents',          swatches: ['#ffffff', '#f5f5f5', '#ff0033'] },
];

type Tab = 'profile' | 'appearance';

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (profile) setDisplayName(profile.displayName ?? '');
  }, [user, profile, loading, navigate]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, { displayName });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleTheme(t: Theme) {
    setTheme(t);
    if (user) await updateUserProfile(user.uid, { theme: t });
  }

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="min-h-screen bg-app">
      <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <button onClick={() => navigate('/chat')} className="ml-auto text-sm btn-ghost">← Chat</button>
      </div>

      <div className="max-w-xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit mb-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          {(['profile', 'appearance'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all', tab === t ? 'text-white' : 'btn-ghost')}
              style={tab === t ? { background: 'var(--accent)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="card p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white" style={{ background: 'var(--accent)' }}>
                {(profile?.displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{profile?.displayName ?? 'User'}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1 font-medium capitalize" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                  {profile?.role?.replace('_', ' ') ?? 'User'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Display Name</label>
              <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email ?? ''} readOnly />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed here.</p>
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn-accent flex items-center gap-2 px-6 py-2.5">
              {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* APPEARANCE */}
        {tab === 'appearance' && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Theme</h3>
            </div>

            <div className="space-y-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTheme(t.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{
                    border: `1px solid ${theme === t.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: theme === t.id ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg-input)',
                  }}
                >
                  <div className="flex gap-1.5 shrink-0">
                    {t.swatches.map(c => <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                  </div>
                  {theme === t.id && <Check size={16} style={{ color: 'var(--accent)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
