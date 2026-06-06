'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import MessageInput from '@/components/chat/MessageInput';
import { addMessage, updateChatSession } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { Message, Attachment, AIModel } from '@/types';
import { generateChatTitle } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { messages, loading } = useMessages(chatId);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [model, setModel] = useState<AIModel>('llama3-70b-8192');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  // Handle ?prompt= from home page suggestions
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt && !initialPromptSent.current && !loading && messages.length === 0) {
      initialPromptSent.current = true;
      sendMessage(prompt, []);
    }
  }, [loading, messages.length]);

  async function sendMessage(content: string, files: File[]) {
    if (!user || !chatId || (!content.trim() && files.length === 0)) return;

    // Upload files first
    const attachments: Attachment[] = [];
    for (const file of files) {
      const key = file.name;
      try {
        const att = await uploadFile(file, user.uid, chatId, (p) =>
          setUploadProgress((prev) => ({ ...prev, [key]: p }))
        );
        attachments.push(att);
      } catch {
        console.error('Upload failed for', file.name);
      } finally {
        setUploadProgress((prev) => { const n = { ...prev }; delete n[key]; return n; });
      }
    }

    const userMsg: Omit<Message, 'id'> = {
      role: 'user',
      content,
      createdAt: Date.now(),
      attachments: attachments.length ? attachments : undefined,
    };

    await addMessage(chatId, userMsg);

    // Auto-title on first message
    if (messages.length === 0) {
      await updateChatSession(chatId, { title: generateChatTitle(content) });
    }

    // Stream AI response
    setStreaming(true);
    setStreamContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content },
          ],
          model,
          attachments,
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              full += delta;
              setStreamContent(full);
            } catch {}
          }
        }
      }

      await addMessage(chatId, {
        role: 'assistant',
        content: full,
        createdAt: Date.now(),
      });
    } catch (err) {
      await addMessage(chatId, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        createdAt: Date.now(),
      });
    } finally {
      setStreaming(false);
      setStreamContent('');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--accent)' }} />
              ))}
            </div>
          </div>
        )}

        {!loading && messages.length === 0 && !streaming && (
          <div className="text-center py-20 text-app-muted text-sm">
            Send a message to start the conversation
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {streaming && streamContent && (
          <ChatMessage
            message={{ id: 'streaming', role: 'assistant', content: streamContent, createdAt: Date.now() }}
            isStreaming
          />
        )}

        {streaming && !streamContent && (
          <div className="flex items-start gap-4 py-4 px-2 max-w-3xl mx-auto w-full">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>E</div>
            <div className="flex gap-1.5 items-center h-8">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full loading-dot" style={{ background: 'var(--text-muted)' }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        disabled={streaming}
        model={model}
        onModelChange={setModel}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}
