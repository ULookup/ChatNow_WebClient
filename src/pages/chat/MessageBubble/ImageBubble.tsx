import { useState, useEffect } from 'react';

interface Props {
  fileId?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export function ImageBubble({ fileId, thumbnailUrl }: Props) {
  const [url, setUrl] = useState<string | undefined>(thumbnailUrl || undefined);

  useEffect(() => {
    if (fileId && !url) {
      // TODO: use MediaService to get download URL in Task 14
      void setUrl;
    }
  }, [fileId, url]);

  if (!url) {
    return (
      <div
        style={{
          width: 200,
          height: 150,
          background: 'rgba(0,0,0,0.05)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        图片加载中...
      </div>
    );
  }

  return (
    <img
      src={url}
      style={{ maxWidth: 300, maxHeight: 250, borderRadius: 8 }}
      alt=""
    />
  );
}
