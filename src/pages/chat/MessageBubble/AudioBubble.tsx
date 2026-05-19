interface Props {
  fileId?: string;
  durationSec?: number;
}

export function AudioBubble({ durationSec }: Props) {
  const mins = Math.floor((durationSec ?? 0) / 60);
  const secs = (durationSec ?? 0) % 60;

  return (
    <span>
      🎤 语音 {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}
