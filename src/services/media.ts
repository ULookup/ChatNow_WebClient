import { rpcCall } from './client';
import {
  ApplyUploadReq,
  ApplyUploadRsp,
  CompleteUploadReq,
  CompleteUploadRsp,
  InitMultipartReq,
  InitMultipartRsp,
  ApplyPartReq,
  ApplyPartRsp,
  CompleteMultipartReq,
  CompleteMultipartRsp,
  AbortMultipartReq,
  AbortMultipartRsp,
  ApplyDownloadReq,
  ApplyDownloadRsp,
  GetFileInfoReq,
  GetFileInfoRsp,
  SpeechRecognitionReq,
  SpeechRecognitionRsp,
} from '@/proto/media/media_service';

/**
 * Media REST service wrapping all Media RPC endpoints.
 * Each method serializes the request with protobuf and deserializes the response.
 *
 * protobuf-ts uses declaration merging: each exported name is both an
 * interface (for typing) and a const MessageType (for toBinary/fromBinary).
 * In type positions they resolve to the interface; in value positions to the const.
 */
export const MediaService = {
  /** Single-segment upload (<=100MB): request a presigned PUT URL */
  applyUpload: (req: ApplyUploadReq) =>
    rpcCall<ApplyUploadRsp>({
      path: '/service/media/apply_upload',
      auth: 'JWT_REQUIRED',
      requestBody: ApplyUploadReq.toBinary(req),
      responseType: ApplyUploadRsp,
    }),

  /** Complete a single-segment upload after the client PUTs to the presigned URL */
  completeUpload: (req: CompleteUploadReq) =>
    rpcCall<CompleteUploadRsp>({
      path: '/service/media/complete_upload',
      auth: 'JWT_REQUIRED',
      requestBody: CompleteUploadReq.toBinary(req),
      responseType: CompleteUploadRsp,
    }),

  /** Initiate a multipart upload for large files (>100MB) */
  initMultipartUpload: (req: InitMultipartReq) =>
    rpcCall<InitMultipartRsp>({
      path: '/service/media/init_multipart_upload',
      auth: 'JWT_REQUIRED',
      requestBody: InitMultipartReq.toBinary(req),
      responseType: InitMultipartRsp,
    }),

  /** Request a presigned PUT URL for a single part of a multipart upload */
  applyPartUpload: (req: ApplyPartReq) =>
    rpcCall<ApplyPartRsp>({
      path: '/service/media/apply_part_upload',
      auth: 'JWT_REQUIRED',
      requestBody: ApplyPartReq.toBinary(req),
      responseType: ApplyPartRsp,
    }),

  /** Complete a multipart upload after all parts have been uploaded */
  completeMultipartUpload: (req: CompleteMultipartReq) =>
    rpcCall<CompleteMultipartRsp>({
      path: '/service/media/complete_multipart_upload',
      auth: 'JWT_REQUIRED',
      requestBody: CompleteMultipartReq.toBinary(req),
      responseType: CompleteMultipartRsp,
    }),

  /** Abort an in-progress multipart upload */
  abortMultipartUpload: (req: AbortMultipartReq) =>
    rpcCall<AbortMultipartRsp>({
      path: '/service/media/abort_multipart_upload',
      auth: 'JWT_REQUIRED',
      requestBody: AbortMultipartReq.toBinary(req),
      responseType: AbortMultipartRsp,
    }),

  /** Request a presigned GET URL for downloading a file */
  applyDownload: (req: ApplyDownloadReq) =>
    rpcCall<ApplyDownloadRsp>({
      path: '/service/media/apply_download',
      auth: 'JWT_REQUIRED',
      requestBody: ApplyDownloadReq.toBinary(req),
      responseType: ApplyDownloadRsp,
    }),

  /** Get file metadata without downloading */
  getFileInfo: (req: GetFileInfoReq) =>
    rpcCall<GetFileInfoRsp>({
      path: '/service/media/get_file_info',
      auth: 'JWT_REQUIRED',
      requestBody: GetFileInfoReq.toBinary(req),
      responseType: GetFileInfoRsp,
    }),

  /** Short audio speech recognition (in-memory, not stored in S3) */
  speechRecognition: (req: SpeechRecognitionReq) =>
    rpcCall<SpeechRecognitionRsp>({
      path: '/service/media/speech_recognition',
      auth: 'JWT_REQUIRED',
      requestBody: SpeechRecognitionReq.toBinary(req),
      responseType: SpeechRecognitionRsp,
    }),
};
