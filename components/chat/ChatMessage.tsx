'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Image as ImageIcon, FileText } from 'lucide-react';
import { Message } from '@/types';
import { formatMessageTime, cn } from '@/lib/utils';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn('flex gap-4 py-4 px-2 max-w-3xl mx-auto w-full animate-fade-in', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
        style={isUser
          ? { background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
          : { background: 'var(--accent)', color: '#fff' }
        }
      >
        {isUser ? 'U' : 'E'}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1 min-w-0 flex-1', isUser && 'items-end')}>
        {/* Attachments */}
        {message.attachments?.map((att) => (
          <div
            key={att.id}
            className="mb-2"
          >
            {att.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.url}
                alt={att.name}
                className="max-w-xs max-h-60 rounded-xl object-cover border"
                style={{ borderColor: 'var(--border)' }}
              />
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <FileText size={14} style={{ color: 'var(--accent)' }} />
                <span className="truncate max-w-[200px]">{att.name}</span>
              </div>
            )}
          </div>
        ))}

        {/* Message bubble */}
        {message.content && (
          <div className={cn('group relative max-w-full', isUser ? 'text-right' : 'text-left')}>
            {isUser ? (
              <div
                className="inline-block text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-lg text-left leading-relaxed"
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                {message.content}
              </div>
            ) : (
              <div className="relative">
                <div className={cn('prose-equinox', isStreaming && 'streaming-cursor')}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className ?? '');
                        const isBlock = match || String(children).includes('\n');
                        if (isBlock) {
                          return (
                            <div className="relative group/code">
                              <CopyCodeButton code={String(children)} />
                              <SyntaxHighlighter
                                style={oneDark as Record<string, React.CSSProperties>}
                                language={match?.[1] ?? 'text'}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  borderRadius: '0.75rem',
                                  fontSize: '0.8rem',
                                  background: '#0d0d0d',
                                }}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return <code className={className} {...props}>{children}</code>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Copy button */}
                {!isStreaming && (
                  <button
                    onClick={copyMessage}
                    className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-app-muted mt-1">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 z-10 opacity-0 group-hover/code:opacity-100 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
      style={{ background: 'rgba(255,255,255,0.08)', color: '#aaa' }}
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
