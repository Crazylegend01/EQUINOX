import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createChatSession } from '@/lib/firebase/firestore';
import { Code2, Sparkles, Zap, BookOpen } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Code2,     label: 'Write code',     prompt: 'Write a Python script that reads a CSV file, filters rows where sales > 1000, and saves to a new file.' },
  { icon: Sparkles,  label: 'Brainstorm',     prompt: 'Brainstorm 10 innovative AI startup ideas for 2025 with market potential.' },
  { icon: Zap,       label: 'Explain simply', prompt: 'Explain how large language models work in simple terms with analogies.' },
  { icon: BookOpen,  label: 'Summarize',      prompt: 'What are the key principles of clean code? Give me a concise summary with examples.' },
];

export default function ChatHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function start(prompt?: string) {
    if (!user) return;
    const id = await createChatSession(user.uid);
    navigate(`/chat/${id}`, { state: { initialPrompt: prompt } });
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="text-center mb-12">
        <div
          className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-6"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          <span className="text-4xl font-black" style={{ color: 'var(--accent)' }}>E</span>
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome to <span style={{ color: 'var(--accent)' }}>EQUINOX</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your premium AI workspace — ask anything, upload files, get results.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-lg w-full mb-8">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => start(prompt)}
            className="card p-4 text-left transition-all duration-200 hover:scale-[1.02]"
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 40%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
          >
            <Icon size={18} className="mb-2" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => start()} className="btn-accent px-10 py-3">
        New Chat
      </button>
    </div>
  );
}
