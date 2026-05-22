import { MediaPurpose, type FileInfo } from '@/proto/media/media_service';
import { MediaService } from '@/services/media';

export async function uploadChatFile(file: File): Promise<FileInfo> {
  const mimeType = file.type || 'application/octet-stream';
  const contentHash = await sha256File(file);
  const applyRsp = await MediaService.applyUpload({
    requestId: crypto.randomUUID(),
    fileName: file.name,
    fileSize: BigInt(file.size),
    mimeType,
    contentHash,
    purpose: MediaPurpose.CHAT,
  });

  if (!applyRsp.header?.success) {
    throw new Error(applyRsp.header?.errorMessage || 'Apply upload failed');
  }

  if (applyRsp.alreadyExists) {
    return {
      fileId: applyRsp.fileId,
      fileName: file.name,
      fileSize: BigInt(file.size),
      mimeType,
      uploadedAtMs: BigInt(Date.now()),
    };
  }

  if (!applyRsp.uploadUrl) {
    throw new Error('Upload URL is missing');
  }

  const uploadRsp = await fetch(applyRsp.uploadUrl, {
    method: 'PUT',
    headers: applyRsp.headers,
    body: file,
  });
  if (!uploadRsp.ok) {
    throw new Error('Upload file failed');
  }

  const completeRsp = await MediaService.completeUpload({
    requestId: crypto.randomUUID(),
    fileId: applyRsp.fileId,
  });
  if (!completeRsp.header?.success || !completeRsp.fileInfo) {
    throw new Error(completeRsp.header?.errorMessage || 'Complete upload failed');
  }

  return completeRsp.fileInfo;
}

async function sha256File(file: File): Promise<string> {
  const buffer = typeof file.arrayBuffer === 'function'
    ? await file.arrayBuffer()
    : await new Response(file).arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
