import { beforeEach, describe, expect, it, vi } from 'vitest';

const getFileInfo = vi.fn();

vi.mock('@/services/media', () => ({
  MediaService: {
    getFileInfo,
  },
}));

describe('getChatFileInfo', () => {
  beforeEach(() => {
    getFileInfo.mockReset();
    vi.stubGlobal('crypto', { randomUUID: () => 'request-id' });
  });

  it('requests file metadata from MediaService.getFileInfo', async () => {
    const fileInfo = {
      fileId: 'file-1',
      fileName: 'backend-brief.pdf',
      fileSize: 12_345n,
      mimeType: 'application/pdf',
      uploadedAtMs: 1_716_000_000_000n,
    };
    getFileInfo.mockResolvedValue({
      header: { success: true },
      fileInfo,
    });

    const { getChatFileInfo } = await import('./mediaMetadata');

    await expect(getChatFileInfo('file-1')).resolves.toEqual(fileInfo);
    expect(getFileInfo).toHaveBeenCalledWith({
      requestId: 'request-id',
      fileId: 'file-1',
    });
  });

  it('throws when the backend returns no file metadata', async () => {
    const { getChatFileInfo } = await import('./mediaMetadata');
    getFileInfo.mockResolvedValue({ header: { success: true }, fileInfo: undefined });

    await expect(getChatFileInfo('file-1')).rejects.toThrow('File metadata is missing');
  });
});
