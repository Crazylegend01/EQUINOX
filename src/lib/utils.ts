import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import type { ChatSession } from '@/types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatTime = (ts: number) => format(new Date(ts), 'h:mm a');

export function dateLabel(ts: number): string {
  const d = new Date(ts);
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d))  return format(d, 'EEEE');
  return format(d, 'MMM d, yyyy');
}

export function groupByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const label = dateLabel(s.updatedAt);
    (groups[label] ??= []).push(s);
  }
  return groups;
}

export const formatBytes = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + '…' : s;

export const chatTitle = (msg: string) => truncate(msg.replace(/[#*`>\[\]]/g, '').trim(), 42) || 'New Chat';
