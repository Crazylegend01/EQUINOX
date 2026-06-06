interface Props { fullscreen?: boolean; centered?: boolean; }

export default function Spinner({ fullscreen, centered }: Props) {
  const dots = (
    <div className="flex gap-2">
      <div className="dot w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
      <div className="dot w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
      <div className="dot w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
    </div>
  );

  if (fullscreen) return (
    <div className="min-h-screen bg-app flex items-center justify-center">{dots}</div>
  );
  if (centered) return (
    <div className="flex justify-center py-12">{dots}</div>
  );
  return dots;
}
