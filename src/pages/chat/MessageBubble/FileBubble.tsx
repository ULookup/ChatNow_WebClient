interface Props {
  fileId?: string;
  fileName?: string;
  fileSize?: bigint;
}

export function FileBubble({ fileName, fileSize }: Props) {
  let sizeStr = '';
  if (fileSize != null) {
    const n = Number(fileSize);
    if (n > 1024 * 1024) {
      sizeStr = `${(n / 1024 / 1024).toFixed(1)}MB`;
    } else if (n > 0) {
      sizeStr = `${(n / 1024).toFixed(0)}KB`;
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>📄</span>
      <div style={{ fontSize: 11, minWidth: 0 }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName ?? '文件'}
        </div>
        {sizeStr && <div style={{ opacity: 0.6 }}>{sizeStr}</div>}
      </div>
    </div>
  );
}
