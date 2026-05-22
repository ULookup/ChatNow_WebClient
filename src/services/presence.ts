import { rpcCall } from './client';
import type { GetPresenceReq, GetPresenceRsp } from '@/proto/presence/presence_service';
import type { BatchGetPresenceReq, BatchGetPresenceRsp } from '@/proto/presence/presence_service';
import type { SubscribeReq, SubscribeRsp } from '@/proto/presence/presence_service';
import type { TypingReq, TypingRsp } from '@/proto/presence/presence_service';
import { GetPresenceReq as GetPresenceReqType, GetPresenceRsp as GetPresenceRspType } from '@/proto/presence/presence_service';
import { BatchGetPresenceReq as BatchGetPresenceReqType, BatchGetPresenceRsp as BatchGetPresenceRspType } from '@/proto/presence/presence_service';
import { SubscribeReq as SubscribeReqType, SubscribeRsp as SubscribeRspType } from '@/proto/presence/presence_service';
import { TypingReq as TypingReqType, TypingRsp as TypingRspType } from '@/proto/presence/presence_service';

export const PresenceService = {
  get: (req: GetPresenceReq) =>
    rpcCall<GetPresenceRsp>({
      path: '/service/presence/get',
      auth: 'JWT_REQUIRED',
      requestBody: GetPresenceReqType.toBinary(req),
      responseType: GetPresenceRspType,
    }),

  batchGet: (req: BatchGetPresenceReq) =>
    rpcCall<BatchGetPresenceRsp>({
      path: '/service/presence/batch_get',
      auth: 'JWT_REQUIRED',
      requestBody: BatchGetPresenceReqType.toBinary(req),
      responseType: BatchGetPresenceRspType,
    }),

  subscribe: (req: SubscribeReq) =>
    rpcCall<SubscribeRsp>({
      path: '/service/presence/subscribe',
      auth: 'JWT_REQUIRED',
      requestBody: SubscribeReqType.toBinary(req),
      responseType: SubscribeRspType,
    }),

  sendTyping: (req: TypingReq) =>
    rpcCall<TypingRsp>({
      path: '/service/presence/send_typing',
      auth: 'JWT_REQUIRED',
      requestBody: TypingReqType.toBinary(req),
      responseType: TypingRspType,
    }),
};
