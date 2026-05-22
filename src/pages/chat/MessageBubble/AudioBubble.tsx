import { useState } from 'react';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import styles from './AudioBubble.module.css';

interface Props {
  fileId?: string;
  durationSec?: number;
}

export function AudioBubble({ fileId, durationSec }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mins = Math.floor((durationSec ?? 0) / 60);
  const secs = (durationSec ?? 0) % 60;

  const handleOpen = async () => {
    if (!fileId || loading) return;
    setLoading(true);
    setError('');
    try {
      const url = await resolveDownloadUrl(fileId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('语音打开失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.audioBubble}
      aria-label="播放语音消息"
      disabled={!fileId || loading}
      onClick={handleOpen}
    >
      <span className={styles.play}>▶</span>
      <span className={styles.wave} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className={styles.duration}>{mins}:{String(secs).padStart(2, '0')}</span>
      {error && <span className={styles.error}>{error}</span>}
    </button>
  );
}
