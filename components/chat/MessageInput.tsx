'use client';
import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Paperclip, X, Image as ImageIcon, FileText, ChevronDown } from 'lucide-react';
import { AIModel } from '@/types';
import { AVAILABLE_MODELS } from '@/lib/ai/groq';
import { formatFileSize, cn } from '@/lib/utils';

interface Props {
  onSend: (content: string, files: File[]) => void;
  disabled?: boolean;
  model: AIModel;
  onModelChange: (m: AIModel) => void;
  uploadProgress: Record<string, number>;
}

export default function MessageInput({ onSend, disabled, model, onModelChange, uploadProgress }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showModels, setShowModels] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/png': [], 'image/jpeg': [], 'image/webp': [],
      'application/pdf': [],
      'text/plain': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    maxFiles: 5,
  });

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSend() {
    if (disabled || (!text.trim() && files.length === 0)) return;
    onSend(text.trim(), files);
    setText('');
    setFiles([]);
    textRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === model);

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Upload progress */}
      {Object.entries(uploadProgress).map(([name, progress]) => (
        <div key={name} className="mb-2 flex items-center gap-2 text-xs text-app-muted">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
          </div>
          <span className="truncate max-w-[120px]">{name}</span>
          <span>{progress}%</span>
        </div>
      ))}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-w-3xl mx-auto">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs relative"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {file.type.startsWith('image/') ? <ImageIcon size={12} style={{ color: 'var(--accent)' }} /> : <FileText size={12} style={{ color: 'var(--accent)' }} />}
              <span className="truncate max-w-[120px]">{file.name}</span>
              <span className="text-app-muted">{formatFileSize(file.size)}</span>
              <button onClick={() => removeFile(i)} className="ml-1 hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input area */}
      <div
        className="max-w-3xl mx-auto rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isDragActive ? '0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)' : undefined,
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Drop files here</p>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attach */}
          <button
            type="button"
            onClick={open}
            disabled={disabled}
            className="p-2 rounded-xl transition-colors hover:bg-app-secondary text-app-muted hover:text-app-primary disabled:opacity-40 shrink-0"
            title="Attach file (max 5)"
          >
            <Paperclip size={18} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textRef}
            value={text}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'EQUINOX is thinking…' : 'Message EQUINOX… (Shift+Enter for new line)'}
            rows={1}
            className="flex-1 resize-none bg-transparent text-app-primary text-sm outline-none placeholder:text-app-muted leading-relaxed py-1 disabled:opacity-50"
            style={{ maxHeight: '200px' }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && files.length === 0)}
            className="p-2 rounded-xl transition-all shrink-0 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Model selector */}
        <div className="flex items-center justify-between px-4 pb-2.5 relative">
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-1.5 text-xs text-app-muted hover:text-app-primary transition-colors"
          >
            <span>{currentModel?.name ?? model}</span>
            <ChevronDown size={11} />
          </button>
          <span className="text-xs text-app-muted">Enter to send · Shift+Enter for newline</span>

          {showModels && (
            <div
              className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden shadow-panel z-20"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              {AVAILABLE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onModelChange(m.id as AIModel); setShowModels(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs hover:bg-app-input transition-colors',
                    m.id === model ? 'text-app-primary font-medium' : 'text-app-secondary'
                  )}
                >
                  <div className="font-medium">{m.name}</div>
                  <div className="text-app-muted">{m.contextWindow.toLocaleString()} tokens</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
