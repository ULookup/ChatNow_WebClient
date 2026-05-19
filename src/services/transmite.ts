import { rpcCall } from './client';
import {
  SendMessageReq,
  SendMessageRsp,
} from '@/proto/transmite/transmite_service';

/**
 * Transmite REST service wrapping the SendMessage RPC endpoint.
 *
 * protobuf-ts uses declaration merging: each exported name is both an
 * interface (for typing) and a const MessageType (for toBinary/fromBinary).
 */
export const TransmiteService = {
  send: (req: SendMessageReq) =>
    rpcCall<SendMessageRsp>({
      path: '/service/transmite/send',
      auth: 'JWT_REQUIRED',
      requestBody: SendMessageReq.toBinary(req),
      responseType: SendMessageRsp,
    }),
};
