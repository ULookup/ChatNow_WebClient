import { useState } from 'react';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import styles from './VideoBubble.module.css';

interface Props {
  fileId?: string;
  durationSec?: number;
  thumbnailUrl?: string;
}

export function VideoBubble({ fileId, durationSec, thumbnailUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasDuration = durationSec != null;
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
      setError('视频打开失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.videoBubble}
      aria-label="播放视频消息"
      disabled={!fileId || loading}
      onClick={handleOpen}
    >
      {thumbnailUrl && <img className={styles.thumbnail} src={thumbnailUrl} alt="" />}
      <span className={styles.scrim} />
      <span className={styles.play}>▶</span>
      {hasDuration && (
        <span className={styles.duration}>
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </button>
  );
}
