import { beforeEach, describe, expect, it, vi } from 'vitest';

const applyDownload = vi.fn();

vi.mock('@/services/media', () => ({
  MediaService: {
    applyDownload,
  },
}));

describe('resolveDownloadUrl', () => {
  beforeEach(() => {
    applyDownload.mockReset();
    vi.stubGlobal('crypto', { randomUUID: () => 'request-id' });
  });

  it('requests a presigned download URL for a file', async () => {
    const { resolveDownloadUrl } = await import('./mediaDownload');
    applyDownload.mockResolvedValue({
      header: { success: true },
      downloadUrl: 'https://download.example/file-1',
      expiresInSec: 300,
    });

    await expect(resolveDownloadUrl('file-1')).resolves.toBe('https://download.example/file-1');
    expect(applyDownload).toHaveBeenCalledWith({
      requestId: 'request-id',
      fileId: 'file-1',
    });
  });

  it('throws when the backend does not return a URL', async () => {
    const { resolveDownloadUrl } = await import('./mediaDownload');
    applyDownload.mockResolvedValue({
      header: { success: true },
      downloadUrl: '',
      expiresInSec: 300,
    });

    await expect(resolveDownloadUrl('file-1')).rejects.toThrow('Download URL is missing');
  });
});
