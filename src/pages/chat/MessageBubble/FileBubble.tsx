import { useState } from 'react';
import { resolveDownloadUrl } from '@/services/mediaDownload';
import styles from './FileBubble.module.css';

interface Props {
  fileId?: string;
  fileName?: string;
  fileSize?: bigint;
}

export function FileBubble({ fileId, fileName, fileSize }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  let sizeStr = '';
  if (fileSize != null) {
    const n = Number(fileSize);
    if (n > 1024 * 1024) {
      sizeStr = `${(n / 1024 / 1024).toFixed(1)}MB`;
    } else if (n > 0) {
      sizeStr = `${(n / 1024).toFixed(0)}KB`;
    }
  }

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
        <div className={styles.fileName}>{fileName ?? '文件'}</div>
        {sizeStr && <div className={styles.fileSize}>{sizeStr}</div>}
      </div>
      <button
        type="button"
        className={styles.downloadBtn}
        aria-label={`下载 ${fileName ?? '文件'}`}
        disabled={!fileId || downloading}
        onClick={handleDownload}
      >
        ↓
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
