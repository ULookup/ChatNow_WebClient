import { rpcCall } from './client';
import {
  ListConversationsReq,
  ListConversationsRsp,
  GetConversationReq,
  GetConversationRsp,
  CreateConversationReq,
  CreateConversationRsp,
  SetMuteReq,
  SetMuteRsp,
  SetPinReq,
  SetPinRsp,
  MarkReadReq,
  MarkReadRsp,
  SaveDraftReq,
  SaveDraftRsp,
} from '@/proto/conversation/conversation_service';

/**
 * Conversation REST service wrapping Conversation RPC endpoints.
 * Each method serializes the request with protobuf and deserializes the response.
 *
 * protobuf-ts uses declaration merging: each exported name is both an
 * interface (for typing) and a const MessageType (for toBinary/fromBinary).
 */
export const ConversationService = {
  list: (req: ListConversationsReq) =>
    rpcCall<ListConversationsRsp>({
      path: '/service/conversation/list',
      auth: 'JWT_REQUIRED',
      requestBody: ListConversationsReq.toBinary(req),
      responseType: ListConversationsRsp,
    }),

  get: (req: GetConversationReq) =>
    rpcCall<GetConversationRsp>({
      path: '/service/conversation/get',
      auth: 'JWT_REQUIRED',
      requestBody: GetConversationReq.toBinary(req),
      responseType: GetConversationRsp,
    }),

  create: (req: CreateConversationReq) =>
    rpcCall<CreateConversationRsp>({
      path: '/service/conversation/create',
      auth: 'JWT_REQUIRED',
      requestBody: CreateConversationReq.toBinary(req),
      responseType: CreateConversationRsp,
    }),

  setMute: (req: SetMuteReq) =>
    rpcCall<SetMuteRsp>({
      path: '/service/conversation/set_mute',
      auth: 'JWT_REQUIRED',
      requestBody: SetMuteReq.toBinary(req),
      responseType: SetMuteRsp,
    }),

  setPin: (req: SetPinReq) =>
    rpcCall<SetPinRsp>({
      path: '/service/conversation/set_pin',
      auth: 'JWT_REQUIRED',
      requestBody: SetPinReq.toBinary(req),
      responseType: SetPinRsp,
    }),

  markRead: (req: MarkReadReq) =>
    rpcCall<MarkReadRsp>({
      path: '/service/conversation/mark_read',
      auth: 'JWT_REQUIRED',
      requestBody: MarkReadReq.toBinary(req),
      responseType: MarkReadRsp,
    }),

  saveDraft: (req: SaveDraftReq) =>
    rpcCall<SaveDraftRsp>({
      path: '/service/conversation/save_draft',
      auth: 'JWT_REQUIRED',
      requestBody: SaveDraftReq.toBinary(req),
      responseType: SaveDraftRsp,
    }),
};
