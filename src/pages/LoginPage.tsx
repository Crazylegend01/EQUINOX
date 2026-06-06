import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, authErrorMessage } from '@/lib/firebase/auth';
import type { AuthError } from 'firebase/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/chat');
    } catch (err) {
      setError(authErrorMessage(err as AuthError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-white font-black text-xl">E</span>
            </div>
            <span className="text-2xl font-black tracking-widest" style={{ color: 'var(--text-primary)' }}>EQUINOX</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your workspace</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(255,0,51,0.08)', color: 'var(--accent)', border: '1px solid rgba(255,0,51,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-accent w-full py-3 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
