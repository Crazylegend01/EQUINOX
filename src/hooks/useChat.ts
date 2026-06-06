import { useState, useEffect } from 'react';
import { subscribeChatSessions, subscribeMessages } from '@/lib/firebase/firestore';
import type { ChatSession, Message } from '@/types';

export function useChatSessions(userId?: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeChatSessions(userId, s => { setSessions(s); setLoading(false); });
    return unsub;
  }, [userId]);

  return { sessions, loading };
}

export function useMessages(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeMessages(chatId, m => { setMessages(m); setLoading(false); });
    return unsub;
  }, [chatId]);

  return { messages, loading };
}
