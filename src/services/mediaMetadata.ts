import type { FileInfo } from '@/proto/media/media_service';
import { MediaService } from '@/services/media';

export async function getChatFileInfo(fileId: string): Promise<FileInfo> {
  const rsp = await MediaService.getFileInfo({
    requestId: crypto.randomUUID(),
    fileId,
  });

  if (!rsp.header?.success) {
    throw new Error(rsp.header?.errorMessage || 'Get file metadata failed');
  }
  if (!rsp.fileInfo) {
    throw new Error('File metadata is missing');
  }

  return rsp.fileInfo;
}
