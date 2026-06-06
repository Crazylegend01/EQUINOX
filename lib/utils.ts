import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a');
}

export function formatChatDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMM d, yyyy');
}

export function groupSessionsByDate(sessions: { updatedAt: number; [k: string]: unknown }[]) {
  const groups: Record<string, typeof sessions> = {};
  for (const session of sessions) {
    const label = formatChatDate(session.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(session);
  }
  return groups;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function generateChatTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/[#*`>\[\]]/g, '').trim();
  return truncate(clean, 40) || 'New Chat';
}
