'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useChatSessions } from '@/hooks/useChat';
import { createChatSession, deleteChatSession } from '@/lib/firebase/firestore';
import { groupSessionsByDate } from '@/lib/utils';
import {
  Plus, MessageSquare, ChevronLeft, ChevronRight,
  Trash2, Settings, Shield, LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { user, profile } = useAuth();
  const { sessions } = useChatSessions(user?.uid);
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function newChat() {
    if (!user) return;
    const id = await createChatSession(user.uid);
    router.push(`/chat/${id}`);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(id);
    await deleteChatSession(id);
    if (pathname === `/chat/${id}`) router.push('/chat');
    setDeleting(null);
  }

  const grouped = groupSessionsByDate(sessions);

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 shrink-0',
        collapsed ? 'w-14' : 'w-64'
      )}
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && (
          <Link href="/chat" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-bold tracking-widest text-sm text-app-primary">EQUINOX</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-colors hover:bg-app-input text-app-muted"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat */}
      <div className="p-2">
        <button
          onClick={newChat}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          <Plus size={16} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {Object.entries(grouped).map(([label, group]) => (
            <div key={label} className="mb-3">
              <p className="text-xs font-semibold text-app-muted uppercase tracking-wider px-2 py-1.5">{label}</p>
              {group.map((session) => {
                const isActive = pathname === `/chat/${session.id}`;
                return (
                  <Link
                    key={session.id}
                    href={`/chat/${session.id}`}
                    className={cn('sidebar-item group relative', isActive && 'active')}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="flex-1 truncate text-xs">{session.title}</span>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-opacity"
                      disabled={deleting === session.id}
                    >
                      <Trash2 size={12} />
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-app-muted text-center py-8">No conversations yet</p>
          )}
        </div>
      )}

      {collapsed && <div className="flex-1" />}

      {/* Bottom nav */}
      <div className="p-2 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
        {profile?.role === 'super_admin' && (
          <Link href="/admin" className={cn('sidebar-item', pathname === '/admin' && 'active')}>
            <Shield size={16} />
            {!collapsed && <span className="text-xs">Admin Panel</span>}
          </Link>
        )}
        <Link href="/settings" className={cn('sidebar-item', pathname === '/settings' && 'active')}>
          <Settings size={16} />
          {!collapsed && <span className="text-xs">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
