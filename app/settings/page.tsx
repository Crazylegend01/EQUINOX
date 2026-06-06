'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { Theme } from '@/types';
import { Check, Palette, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEMES: { id: Theme; label: string; desc: string; colors: string[] }[] = [
  { id: 'crimson-noir', label: 'Crimson Noir', desc: 'Premium black with crimson accents', colors: ['#000000', '#111111', '#ff0033'] },
  { id: 'dark', label: 'Dark Mode', desc: 'Slate with blue accents', colors: ['#0f172a', '#1e293b', '#3b82f6'] },
  { id: 'light', label: 'Light Mode', desc: 'Clean white with red accents', colors: ['#ffffff', '#f5f5f5', '#ff0033'] },
];

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'profile' | 'appearance'>('profile');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (profile) setDisplayName(profile.displayName ?? '');
  }, [user, profile, loading, router]);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, { displayName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleThemeChange(t: Theme) {
    setTheme(t);
    if (user) await updateUserProfile(user.uid, { theme: t });
  }

  if (loading) return (
    <div className="min-h-screen bg-app-primary flex items-center justify-center">
      <div className="flex gap-2">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent)' }} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-primary">
      <div className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <h1 className="text-lg font-bold text-app-primary">Settings</h1>
        <button onClick={() => router.push('/chat')} className="ml-auto text-sm text-app-muted hover:text-app-primary transition-colors">
          ← Back to Chat
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          {(['profile', 'appearance'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all', tab === t ? 'text-white' : 'text-app-muted hover:text-app-primary')}
              style={tab === t ? { background: 'var(--accent)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile */}
        {tab === 'profile' && (
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {(profile?.displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-app-primary">{profile?.displayName ?? 'User'}</p>
                <p className="text-sm text-app-muted">{user?.email}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                >
                  {profile?.role?.replace('_', ' ') ?? 'User'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Display Name</label>
              <input
                type="text"
                className="input-base"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Email</label>
              <input type="email" className="input-base opacity-60 cursor-not-allowed" value={user?.email ?? ''} readOnly />
              <p className="text-xs text-app-muted mt-1">Email cannot be changed here.</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Appearance */}
        {tab === 'appearance' && (
          <div className="panel p-6">
            <h3 className="text-sm font-semibold text-app-primary mb-4 flex items-center gap-2">
              <Palette size={16} style={{ color: 'var(--accent)' }} />
              Theme
            </h3>
            <div className="space-y-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border',
                  )}
                  style={{
                    borderColor: theme === t.id ? 'var(--accent)' : 'var(--border)',
                    background: theme === t.id ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg-input)',
                  }}
                >
                  {/* Color preview */}
                  <div className="flex gap-1.5 shrink-0">
                    {t.colors.map((c) => (
                      <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-app-primary">{t.label}</p>
                    <p className="text-xs text-app-muted">{t.desc}</p>
                  </div>
                  {theme === t.id && (
                    <Check size={16} style={{ color: 'var(--accent)' }} className="shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
