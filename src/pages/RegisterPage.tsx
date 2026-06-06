import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, authErrorMessage } from '@/lib/firebase/auth';
import type { AuthError } from 'firebase/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await registerUser(email, password, name);
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your workspace account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Full Name</label>
              <input className="input" type="text" placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
              <input className="input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(255,0,51,0.08)', color: 'var(--accent)', border: '1px solid rgba(255,0,51,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-accent w-full py-3 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
