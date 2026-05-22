import { MediaService } from '@/services/media';
import { resolveDownloadUrl } from '@/services/mediaDownload';

export async function transcribeAudioFile(fileId: string): Promise<string> {
  const downloadUrl = await resolveDownloadUrl(fileId);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error('Audio download failed');
  }

  const speechContent = new Uint8Array(await response.arrayBuffer());
  const rsp = await MediaService.speechRecognition({
    requestId: crypto.randomUUID(),
    speechContent,
  });

  if (!rsp.header?.success) {
    throw new Error(rsp.header?.errorMessage || 'Speech recognition failed');
  }

  return rsp.recognitionResult;
}
