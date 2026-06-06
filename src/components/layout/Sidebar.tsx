import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChatSessions } from '@/hooks/useChat';
import { createChatSession, deleteChatSession } from '@/lib/firebase/firestore';
import { groupByDate, cn } from '@/lib/utils';
import {
  Plus, MessageSquare, ChevronLeft, ChevronRight,
  Trash2, Settings, Shield,
} from 'lucide-react';

export default function Sidebar() {
  const { user, profile } = useAuth();
  const { sessions } = useChatSessions(user?.uid);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  async function newChat() {
    if (!user) return;
    const id = await createChatSession(user.uid);
    navigate(`/chat/${id}`);
  }

  async function removeChat(e: React.MouseEvent, id: string) {
    e.preventDefault(); e.stopPropagation();
    setDeleting(id);
    await deleteChatSession(id);
    navigate('/chat');
    setDeleting(null);
  }

  const grouped = groupByDate(sessions);

  return (
    <aside
      className={cn('flex flex-col h-full transition-all duration-300 shrink-0', collapsed ? 'w-14' : 'w-64')}
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 h-14" style={{ borderBottom: '1px solid var(--border)' }}>
        {!collapsed && (
          <NavLink to="/chat" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="font-black tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>EQUINOX</span>
          </NavLink>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg transition-colors hover:bg-input ml-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat */}
      <div className="p-2">
        <button
          onClick={newChat}
          className={cn('flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-semibold transition-all', collapsed ? 'justify-center' : '')}
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          <Plus size={16} />
          {!collapsed && 'New Chat'}
        </button>
      </div>

      {/* History */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {Object.entries(grouped).map(([label, group]) => (
            <div key={label} className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              {group.map(session => (
                <NavLink
                  key={session.id}
                  to={`/chat/${session.id}`}
                  className={({ isActive }) => cn('sidebar-link group relative', isActive && 'active')}
                >
                  <MessageSquare size={13} className="shrink-0" />
                  <span className="flex-1 truncate">{session.title}</span>
                  <button
                    onClick={e => removeChat(e, session.id)}
                    disabled={deleting === session.id}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-opacity shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </NavLink>
              ))}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          )}
        </div>
      )}
      {collapsed && <div className="flex-1" />}

      {/* Bottom nav */}
      <div className="p-2 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        {profile?.role === 'super_admin' && (
          <NavLink to="/admin" className={({ isActive }) => cn('sidebar-link', isActive && 'active')}>
            <Shield size={15} />
            {!collapsed && 'Admin Panel'}
          </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => cn('sidebar-link', isActive && 'active')}>
          <Settings size={15} />
          {!collapsed && 'Settings'}
        </NavLink>
      </div>
    </aside>
  );
}
