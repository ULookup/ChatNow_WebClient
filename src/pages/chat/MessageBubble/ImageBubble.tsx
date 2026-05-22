import { useState, useEffect } from 'react';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import styles from './ImageBubble.module.css';

interface Props {
  fileId?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export function ImageBubble({ fileId, thumbnailUrl }: Props) {
  const [url, setUrl] = useState<string | undefined>(thumbnailUrl || undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (fileId && !url && !error) {
      resolveDownloadUrl(fileId)
        .then((downloadUrl) => {
          if (!cancelled) setUrl(downloadUrl);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [error, fileId, url]);

  const handleOpen = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!url) {
    return (
      <div className={`${styles.placeholder} ${error ? styles.error : ''}`}>
        {error ? '图片加载失败' : '图片加载中...'}
      </div>
    );
  }

  return (
    <button type="button" className={styles.imageWrap} aria-label="查看图片消息" onClick={handleOpen}>
      <img
        src={url}
        className={styles.image}
        alt="图片消息"
      />
    </button>
  );
}
