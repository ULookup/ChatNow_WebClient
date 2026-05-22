import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPurpose } from '@/proto/media/media_service';

const applyUpload = vi.fn();
const completeUpload = vi.fn();

vi.mock('@/services/media', () => ({
  MediaService: {
    applyUpload,
    completeUpload,
  },
}));

describe('uploadChatFile', () => {
  beforeEach(() => {
    applyUpload.mockReset();
    completeUpload.mockReset();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal('crypto', {
      randomUUID: () => 'request-id',
      subtle: {
        digest: vi.fn().mockResolvedValue(new Uint8Array([0xab, 0xcd]).buffer),
      },
    });
  });

  it('applies upload, PUTs to the presigned URL, completes, and returns file info', async () => {
    const { uploadChatFile } = await import('./mediaUpload');
    const file = new File(['hello'], 'brief.txt', { type: 'text/plain' });
    applyUpload.mockResolvedValue({
      header: { success: true },
      fileId: 'file-1',
      alreadyExists: false,
      uploadUrl: 'https://upload.example/brief.txt',
      headers: { 'x-amz-meta-chatnow': '1' },
      expiresInSec: 300,
    });
    completeUpload.mockResolvedValue({
      header: { success: true },
      fileInfo: {
        fileId: 'file-1',
        fileName: 'brief.txt',
        fileSize: 5n,
        mimeType: 'text/plain',
        uploadedAtMs: 1_716_000_000_000n,
      },
    });

    const info = await uploadChatFile(file);

    expect(applyUpload).toHaveBeenCalledWith(expect.objectContaining({
      fileName: 'brief.txt',
      fileSize: 5n,
      mimeType: 'text/plain',
      contentHash: 'sha256:abcd',
      purpose: MediaPurpose.CHAT,
    }));
    expect(fetch).toHaveBeenCalledWith('https://upload.example/brief.txt', expect.objectContaining({
      method: 'PUT',
      body: file,
      headers: { 'x-amz-meta-chatnow': '1' },
    }));
    expect(completeUpload).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'file-1' }));
    expect(info.fileId).toBe('file-1');
  });

  it('skips PUT when the backend reports an existing file', async () => {
    const { uploadChatFile } = await import('./mediaUpload');
    const file = new File(['hello'], 'brief.txt', { type: 'text/plain' });
    applyUpload.mockResolvedValue({
      header: { success: true },
      fileId: 'file-existing',
      alreadyExists: true,
      uploadUrl: '',
      headers: {},
      expiresInSec: 300,
    });

    const info = await uploadChatFile(file);

    expect(fetch).not.toHaveBeenCalled();
    expect(completeUpload).not.toHaveBeenCalled();
    expect(info).toMatchObject({
      fileId: 'file-existing',
      fileName: 'brief.txt',
      fileSize: 5n,
      mimeType: 'text/plain',
    });
  });
});
