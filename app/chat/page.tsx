'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createChatSession } from '@/lib/firebase/firestore';
import { Sparkles, Zap, Shield, Code2 } from 'lucide-react';

export default function ChatHomePage() {
  const { user } = useAuth();
  const router = useRouter();

  async function startNewChat(prompt?: string) {
    if (!user) return;
    const id = await createChatSession(user.uid);
    router.push(`/chat/${id}${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''}`);
  }

  const suggestions = [
    { icon: Code2, label: 'Write a Python script', prompt: 'Write a Python script to scrape data from a website and save it to a CSV file.' },
    { icon: Sparkles, label: 'Brainstorm ideas', prompt: 'Brainstorm 10 creative startup ideas in the AI space for 2025.' },
    { icon: Zap, label: 'Explain a concept', prompt: 'Explain quantum computing in simple terms with real-world analogies.' },
    { icon: Shield, label: 'Review code', prompt: 'Review this code for security vulnerabilities and suggest improvements:' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>E</span>
        </div>
        <h1 className="text-3xl font-bold text-app-primary mb-2">
          Welcome to <span style={{ color: 'var(--accent)' }}>EQUINOX</span>
        </h1>
        <p className="text-app-secondary max-w-md">
          Your integrated AI workspace. Ask anything, upload files, and work smarter.
        </p>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full mb-8">
        {suggestions.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => startNewChat(prompt)}
            className="panel p-4 text-left hover:border-app transition-all duration-200 group"
            style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 40%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
          >
            <Icon size={18} className="mb-2" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium text-app-primary">{label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => startNewChat()} className="btn-primary px-8 py-3 text-base">
        Start New Chat
      </button>
    </div>
  );
}
