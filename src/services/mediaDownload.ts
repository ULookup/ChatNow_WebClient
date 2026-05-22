import { MediaService } from '@/services/media';

export async function resolveDownloadUrl(fileId: string): Promise<string> {
  const rsp = await MediaService.applyDownload({
    requestId: crypto.randomUUID(),
    fileId,
  });

  if (!rsp.header?.success) {
    throw new Error(rsp.header?.errorMessage || 'Apply download failed');
  }
  if (!rsp.downloadUrl) {
    throw new Error('Download URL is missing');
  }

  return rsp.downloadUrl;
}
