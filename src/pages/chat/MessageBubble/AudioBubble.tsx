import { useState } from 'react';
import { Icon } from '@/components/Icon/Icon';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import { transcribeAudioFile } from '@/services/audioTranscription';
import styles from './AudioBubble.module.css';

interface Props {
  fileId?: string;
  durationSec?: number;
}

export function AudioBubble({ fileId, durationSec }: Props) {
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
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

  const handleTranscribe = async () => {
    if (!fileId || transcribing) return;
    setTranscribing(true);
    setError('');
    try {
      const result = await transcribeAudioFile(fileId);
      setTranscript(result || '未识别到语音内容');
    } catch {
      setError('语音转文字失败');
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className={styles.audioGroup}>
      <div className={styles.audioRow}>
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
        </button>
        <button
          type="button"
          className={styles.transcribeButton}
          aria-label="语音转文字"
          title="语音转文字"
          disabled={!fileId || transcribing}
          onClick={handleTranscribe}
        >
          <Icon name="message-circle" size={16} />
        </button>
      </div>
      {(transcript || error || transcribing) && (
        <div className={`${styles.transcript} ${error ? styles.error : ''}`}>
          {transcribing ? '识别中...' : error || transcript}
        </div>
      )}
    </div>
  );
}
