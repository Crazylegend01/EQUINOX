import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { ChatSession, Message, AppUser, Attachment } from '@/types';

// ─── Chat Sessions ───────────────────────────────────────────────────────────

export async function createChatSession(
  userId: string,
  title = 'New Chat',
  model = 'llama3-70b-8192'
): Promise<string> {
  const ref = await addDoc(collection(db, 'chats'), {
    userId,
    title,
    model,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
    lastMessage: '',
  });
  return ref.id;
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toMillis()
          : data.updatedAt,
    } as ChatSession;
  });
}

export function subscribeChatSessions(
  userId: string,
  callback: (sessions: ChatSession[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const sessions = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : data.createdAt ?? Date.now(),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toMillis()
            : data.updatedAt ?? Date.now(),
      } as ChatSession;
    });
    callback(sessions);
  });
}

export async function updateChatSession(
  chatId: string,
  data: Partial<ChatSession>
): Promise<void> {
  await updateDoc(doc(db, 'chats', chatId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChatSession(chatId: string): Promise<void> {
  // Delete all messages first
  const msgs = await getDocs(collection(db, 'chats', chatId, 'messages'));
  for (const m of msgs.docs) {
    await deleteDoc(m.ref);
  }
  await deleteDoc(doc(db, 'chats', chatId));
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function addMessage(
  chatId: string,
  message: Omit<Message, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...message,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', chatId), {
    messageCount: (await getDoc(doc(db, 'chats', chatId))).data()?.messageCount + 1 || 1,
    lastMessage:
      message.content.slice(0, 100) + (message.content.length > 100 ? '…' : ''),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : data.createdAt ?? Date.now(),
    } as Message;
  });
}

export function subscribeMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : data.createdAt ?? Date.now(),
      } as Message;
    });
    callback(messages);
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : data.createdAt ?? Date.now(),
    } as AppUser;
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<AppUser>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function getPlatformStats() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const chatsSnap = await getDocs(collection(db, 'chats'));

  const users = usersSnap.docs.map((d) => d.data() as AppUser);
  const activeUsers = users.filter((u) => u.isActive).length;

  let totalMessages = 0;
  for (const chat of chatsSnap.docs) {
    totalMessages += (chat.data().messageCount as number) || 0;
  }

  return {
    totalUsers: users.length,
    activeUsers,
    totalChats: chatsSnap.size,
    totalMessages,
    storageUsedMB: 0,
  };
}
