import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, onSnapshot, Timestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { ChatSession, Message, AppUser, Attachment } from '@/types';

// ── Chat Sessions ─────────────────────────────────────────────────

export async function createChatSession(userId: string, title = 'New Chat', model = 'llama3-70b-8192') {
  const ref = await addDoc(collection(db, 'chats'), {
    userId, title, model, messageCount: 0, lastMessage: '',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeChatSessions(userId: string, cb: (s: ChatSession[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(60)
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id, ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      } as ChatSession;
    }));
  });
}

export async function updateChatSession(chatId: string, data: Partial<ChatSession>) {
  await updateDoc(doc(db, 'chats', chatId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteChatSession(chatId: string) {
  const msgs = await getDocs(collection(db, 'chats', chatId, 'messages'));
  await Promise.all(msgs.docs.map(m => deleteDoc(m.ref)));
  await deleteDoc(doc(db, 'chats', chatId));
}

// ── Messages ──────────────────────────────────────────────────────

export async function addMessage(chatId: string, msg: Omit<Message, 'id'>) {
  const ref = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...msg, createdAt: serverTimestamp(),
  });
  const chatSnap = await getDoc(doc(db, 'chats', chatId));
  const count = (chatSnap.data()?.messageCount ?? 0) + 1;
  await updateDoc(doc(db, 'chats', chatId), {
    messageCount: count,
    lastMessage: msg.content.slice(0, 120),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeMessages(chatId: string, cb: (m: Message[]) => void): Unsubscribe {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id, ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      } as Message;
    }));
  });
}

// ── Users (Admin) ─────────────────────────────────────────────────

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      uid: d.id, ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    } as AppUser;
  });
}

export async function updateUserRole(
  targetUid: string,
  role: AppUser['role'],
  permissions?: AppUser['permissions']
) {
  await setDoc(doc(db, 'users', targetUid), { role, permissions: permissions ?? null }, { merge: true });
}

export async function toggleUserActive(targetUid: string, isActive: boolean) {
  await updateDoc(doc(db, 'users', targetUid), { isActive });
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function getPlatformStats() {
  const [usersSnap, chatsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'chats')),
  ]);
  const users = usersSnap.docs.map(d => d.data() as AppUser);
  const totalMessages = chatsSnap.docs.reduce((sum, d) => sum + (d.data().messageCount ?? 0), 0);
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalChats: chatsSnap.size,
    totalMessages,
  };
}
