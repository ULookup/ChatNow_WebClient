import { useEffect, useState } from 'react';
import type { FileInfo } from '@/proto/media/media_service';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import { getChatFileInfo } from '@/services/mediaMetadata';
import styles from './FileBubble.module.css';

interface Props {
  fileId?: string;
  fileName?: string;
  fileSize?: bigint;
}

export function FileBubble({ fileId, fileName, fileSize }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [hydratedInfo, setHydratedInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState('');
  const displayName = fileName || hydratedInfo?.fileName || '文件';
  const displaySize = fileSize && fileSize > 0n ? fileSize : hydratedInfo?.fileSize;
  const sizeStr = formatFileSize(displaySize);

  useEffect(() => {
    if (!fileId || (fileName && fileSize && fileSize > 0n)) return;
    let cancelled = false;
    getChatFileInfo(fileId)
      .then((info) => {
        if (!cancelled) setHydratedInfo(info);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fileId, fileName, fileSize]);

  const handleDownload = async () => {
    if (!fileId || downloading) return;
    setDownloading(true);
    setError('');
    try {
      const url = await resolveDownloadUrl(fileId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('下载链接获取失败');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.fileBubble}>
      <span className={styles.fileIcon}>📄</span>
      <div className={styles.fileMeta}>
        <div className={styles.fileName}>{displayName}</div>
        {sizeStr && <div className={styles.fileSize}>{sizeStr}</div>}
      </div>
      <button
        type="button"
        className={styles.downloadBtn}
        aria-label={`下载 ${displayName}`}
        disabled={!fileId || downloading}
        onClick={handleDownload}
      >
        ↓
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

function formatFileSize(fileSize?: bigint): string {
  if (fileSize == null || fileSize <= 0n) return '';
  const n = Number(fileSize);
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)}MB`;
  return `${(n / 1024).toFixed(0)}KB`;
}
