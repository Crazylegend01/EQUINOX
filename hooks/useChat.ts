'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message } from '@/types';
import { subscribeChatSessions, subscribeMessages } from '@/lib/firebase/firestore';

export function useChatSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeChatSessions(userId, (s) => {
      setSessions(s);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { sessions, loading };
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeMessages(chatId, (m) => {
      setMessages(m);
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  return { messages, loading };
}
