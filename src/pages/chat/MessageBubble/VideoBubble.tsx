interface Props {
  fileId?: string;
  durationSec?: number;
  thumbnailUrl?: string;
}

export function VideoBubble({ durationSec }: Props) {
  const hasDuration = durationSec != null;
  const mins = Math.floor((durationSec ?? 0) / 60);
  const secs = (durationSec ?? 0) % 60;

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          width: 240,
          height: 160,
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 32 }}>▶️</span>
      </div>
      {hasDuration && (
        <span
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: 10,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '1px 4px',
            borderRadius: 4,
          }}
        >
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      )}
    </div>
  );
}
