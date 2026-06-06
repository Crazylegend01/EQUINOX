export type Theme = 'crimson-noir' | 'dark' | 'light';

export type UserRole = 'super_admin' | 'sub_admin' | 'user';

export interface SubAdminPermissions {
  manageUsers: boolean;
  viewAnalytics: boolean;
  manageContent: boolean;
  viewLogs: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  permissions?: SubAdminPermissions;
  isActive: boolean;
  createdAt: number;
  lastLoginAt?: number;
  theme?: Theme;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'txt' | 'docx' | 'file';
  url: string;
  storagePath: string;
  size: number;
  mimeType: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalChats: number;
  totalMessages: number;
  storageUsedMB: number;
}

export type AIModel =
  | 'llama3-70b-8192'
  | 'llama3-8b-8192'
  | 'mixtral-8x7b-32768'
  | 'gemma-7b-it';
