import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Paperclip, X, Image as Img, FileText, ChevronDown } from 'lucide-react';
import { AVAILABLE_MODELS } from '@/lib/ai/groq';
import { formatBytes, cn } from '@/lib/utils';
import type { AIModel } from '@/types';

interface Props {
  onSend: (content: string, files: File[]) => void;
  disabled?: boolean;
  model: AIModel;
  onModelChange: (m: AIModel) => void;
  uploadProgress: Record<string, number>;
}

export default function MessageInput({ onSend, disabled, model, onModelChange, uploadProgress }: Props) {
  const [text, setText]         = useState('');
  const [files, setFiles]       = useState<File[]>([]);
  const [showModels, setShowModels] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((accepted: File[]) => setFiles(p => [...p, ...accepted].slice(0, 5)), []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [], 'text/plain': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    maxFiles: 5,
  });

  function handleSend() {
    if (disabled || (!text.trim() && files.length === 0)) return;
    onSend(text.trim(), files);
    setText('');
    setFiles([]);
    if (textRef.current) { textRef.current.style.height = 'auto'; }
    textRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function resize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }

  const currentModel = AVAILABLE_MODELS.find(m => m.id === model);

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* Upload progress bars */}
      {Object.entries(uploadProgress).map(([name, pct]) => (
        <div key={name} className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
          </div>
          <span className="truncate max-w-[120px]">{name}</span>
          <span>{pct}%</span>
        </div>
      ))}

      {/* Attached file chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-w-3xl mx-auto">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {f.type.startsWith('image/') ? <Img size={12} style={{ color: 'var(--accent)' }} /> : <FileText size={12} style={{ color: 'var(--accent)' }} />}
              <span className="truncate max-w-[110px]">{f.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatBytes(f.size)}</span>
              <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><X size={11} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Input box */}
      <div
        className="max-w-3xl mx-auto rounded-2xl relative transition-all duration-200"
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
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Drop files here</p>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          <button type="button" onClick={open} disabled={disabled} className="p-2 rounded-xl transition-colors hover:bg-app shrink-0 disabled:opacity-40" style={{ color: 'var(--text-muted)' }} title="Attach file">
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textRef}
            value={text}
            onChange={resize}
            onKeyDown={handleKey}
            disabled={disabled}
            placeholder={disabled ? 'EQUINOX is thinking…' : 'Message EQUINOX… (Shift+Enter for new line)'}
            rows={1}
            className="flex-1 resize-none text-sm outline-none leading-relaxed py-1 disabled:opacity-50"
            style={{ background: 'transparent', color: 'var(--text-primary)', maxHeight: '200px' }}
          />

          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && files.length === 0)}
            className="p-2 rounded-xl transition-all shrink-0 disabled:opacity-40 text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Model selector footer */}
        <div className="flex items-center justify-between px-4 pb-3 relative">
          <button
            onClick={() => setShowModels(s => !s)}
            className="flex items-center gap-1 text-xs transition-colors hover:text-primary"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentModel?.name ?? model} <ChevronDown size={11} />
          </button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter to send · Shift+Enter newline</span>

          {showModels && (
            <div
              className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl overflow-hidden z-30"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {AVAILABLE_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onModelChange(m.id); setShowModels(false); }}
                  className={cn('w-full text-left px-4 py-3 text-xs transition-colors hover:bg-input', m.id === model ? 'font-semibold' : '')}
                  style={{ color: m.id === model ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  <div className="font-medium">{m.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{m.contextWindow.toLocaleString()} ctx tokens</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
