'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, getAuthErrorMessage } from '@/lib/firebase/auth';
import { AuthError } from 'firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await registerUser(email, password, name);
      router.push('/chat');
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold tracking-wider text-app-primary">EQUINOX</span>
          </div>
          <p className="text-app-secondary text-sm">Create your workspace account</p>
        </div>

        <div className="panel p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Full Name</label>
              <input type="text" className="input-base" placeholder="Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Email</label>
              <input type="email" className="input-base" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Password</label>
              <input type="password" className="input-base" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-2">Confirm Password</label>
              <input type="password" className="input-base" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(255,0,51,0.1)', color: 'var(--accent)', border: '1px solid rgba(255,0,51,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="accent hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
