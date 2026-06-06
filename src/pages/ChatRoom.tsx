import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useChat';
import ChatMessage  from '@/components/chat/ChatMessage';
import MessageInput from '@/components/chat/MessageInput';
import Spinner      from '@/components/ui/Spinner';
import { addMessage, updateChatSession } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { streamChat } from '@/lib/ai/groq';
import { chatTitle } from '@/lib/utils';
import type { Attachment, AIModel, Message } from '@/types';

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const location   = useLocation();
  const { user }   = useAuth();
  const { messages, loading } = useMessages(chatId);

  const [streaming, setStreaming]       = useState(false);
  const [streamText, setStreamText]     = useState('');
  const [model, setModel]               = useState<AIModel>('llama3-70b-8192');
  const [uploadProg, setUploadProg]     = useState<Record<string, number>>({});

  const bottomRef      = useRef<HTMLDivElement>(null);
  const promptSentRef  = useRef(false);
  const firstLoad      = useRef(true);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  // Auto-send initial prompt (from ChatHome suggestion or new chat)
  useEffect(() => {
    if (loading || promptSentRef.current) return;
    const prompt = location.state?.initialPrompt as string | undefined;
    if (prompt && messages.length === 0) {
      promptSentRef.current = true;
      void send(prompt, []);
    }
    // Reset on route change
    if (firstLoad.current) firstLoad.current = false;
  }, [loading, messages.length]);

  // Reset when chatId changes
  useEffect(() => {
    promptSentRef.current = false;
    setStreamText('');
  }, [chatId]);

  async function send(content: string, files: File[]) {
    if (!user || !chatId) return;
    if (!content.trim() && files.length === 0) return;

    // Upload attachments
    const attachments: Attachment[] = [];
    for (const file of files) {
      const key = file.name;
      try {
        const att = await uploadFile(file, user.uid, chatId, pct =>
          setUploadProg(p => ({ ...p, [key]: pct }))
        );
        attachments.push(att);
      } catch { /* silent */ } finally {
        setUploadProg(p => { const n = { ...p }; delete n[key]; return n; });
      }
    }

    const userMsg: Omit<Message, 'id'> = {
      role: 'user', content, createdAt: Date.now(),
      attachments: attachments.length ? attachments : undefined,
    };
    await addMessage(chatId, userMsg);

    if (messages.length === 0) {
      await updateChatSession(chatId, { title: chatTitle(content) });
    }

    setStreaming(true);
    setStreamText('');

    const history = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    streamChat(
      history, model, attachments,
      (text) => setStreamText(text),
      async (full) => {
        setStreaming(false);
        setStreamText('');
        await addMessage(chatId, { role: 'assistant', content: full, createdAt: Date.now() });
      },
      async (_err) => {
        setStreaming(false);
        setStreamText('');
        await addMessage(chatId, {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please check your Groq API key and try again.',
          createdAt: Date.now(),
        });
      }
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <Spinner centered />}

        {!loading && messages.length === 0 && !streaming && (
          <div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>
            Send a message to begin
          </div>
        )}

        {messages.map(m => <ChatMessage key={m.id} message={m} />)}

        {/* Streaming bubble */}
        {streaming && streamText && (
          <ChatMessage
            message={{ id: '__stream', role: 'assistant', content: streamText, createdAt: Date.now() }}
            isStreaming
          />
        )}

        {/* Thinking indicator */}
        {streaming && !streamText && (
          <div className="flex items-start gap-4 py-3 px-2 max-w-3xl mx-auto w-full">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: 'var(--accent)' }}>E</div>
            <div className="flex gap-1.5 items-center h-8">
              <div className="dot w-2 h-2" style={{ background: 'var(--text-muted)' }} />
              <div className="dot w-2 h-2" style={{ background: 'var(--text-muted)' }} />
              <div className="dot w-2 h-2" style={{ background: 'var(--text-muted)' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      <MessageInput
        onSend={send}
        disabled={streaming}
        model={model}
        onModelChange={setModel}
        uploadProgress={uploadProg}
      />
    </div>
  );
}
