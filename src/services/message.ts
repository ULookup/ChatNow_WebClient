import { rpcCall } from './client';
import {
  SyncMessagesReq,
  SyncMessagesRsp,
  GetHistoryReq,
  GetHistoryRsp,
  SearchMessagesReq,
  SearchMessagesRsp,
  RecallMessageReq,
  RecallMessageRsp,
  AddReactionReq,
  AddReactionRsp,
  RemoveReactionReq,
  RemoveReactionRsp,
  GetReactionsReq,
  GetReactionsRsp,
  PinMessageReq,
  PinMessageRsp,
  UnpinMessageReq,
  UnpinMessageRsp,
  ListPinnedReq,
  ListPinnedRsp,
  DeleteMessagesReq,
  DeleteMessagesRsp,
  ClearConversationReq,
  ClearConversationRsp,
  UpdateReadAckReq,
  UpdateReadAckRsp,
} from '@/proto/message/message_service';

/**
 * Message REST service wrapping Message RPC endpoints.
 * Each method serializes the request with protobuf and deserializes the response.
 *
 * protobuf-ts uses declaration merging: each exported name is both an
 * interface (for typing) and a const MessageType (for toBinary/fromBinary).
 */
export const MessageService = {
  sync: (req: SyncMessagesReq) =>
    rpcCall<SyncMessagesRsp>({
      path: '/service/message/sync',
      auth: 'JWT_REQUIRED',
      requestBody: SyncMessagesReq.toBinary(req),
      responseType: SyncMessagesRsp,
    }),

  getHistory: (req: GetHistoryReq) =>
    rpcCall<GetHistoryRsp>({
      path: '/service/message/get_history',
      auth: 'JWT_REQUIRED',
      requestBody: GetHistoryReq.toBinary(req),
      responseType: GetHistoryRsp,
    }),

  search: (req: SearchMessagesReq) =>
    rpcCall<SearchMessagesRsp>({
      path: '/service/message/search',
      auth: 'JWT_REQUIRED',
      requestBody: SearchMessagesReq.toBinary(req),
      responseType: SearchMessagesRsp,
    }),

  recall: (req: RecallMessageReq) =>
    rpcCall<RecallMessageRsp>({
      path: '/service/message/recall',
      auth: 'JWT_REQUIRED',
      requestBody: RecallMessageReq.toBinary(req),
      responseType: RecallMessageRsp,
    }),

  addReaction: (req: AddReactionReq) =>
    rpcCall<AddReactionRsp>({
      path: '/service/message/add_reaction',
      auth: 'JWT_REQUIRED',
      requestBody: AddReactionReq.toBinary(req),
      responseType: AddReactionRsp,
    }),

  removeReaction: (req: RemoveReactionReq) =>
    rpcCall<RemoveReactionRsp>({
      path: '/service/message/remove_reaction',
      auth: 'JWT_REQUIRED',
      requestBody: RemoveReactionReq.toBinary(req),
      responseType: RemoveReactionRsp,
    }),

  getReactions: (req: GetReactionsReq) =>
    rpcCall<GetReactionsRsp>({
      path: '/service/message/get_reactions',
      auth: 'JWT_REQUIRED',
      requestBody: GetReactionsReq.toBinary(req),
      responseType: GetReactionsRsp,
    }),

  pin: (req: PinMessageReq) =>
    rpcCall<PinMessageRsp>({
      path: '/service/message/pin',
      auth: 'JWT_REQUIRED',
      requestBody: PinMessageReq.toBinary(req),
      responseType: PinMessageRsp,
    }),

  unpin: (req: UnpinMessageReq) =>
    rpcCall<UnpinMessageRsp>({
      path: '/service/message/unpin',
      auth: 'JWT_REQUIRED',
      requestBody: UnpinMessageReq.toBinary(req),
      responseType: UnpinMessageRsp,
    }),

  listPinned: (req: ListPinnedReq) =>
    rpcCall<ListPinnedRsp>({
      path: '/service/message/list_pinned',
      auth: 'JWT_REQUIRED',
      requestBody: ListPinnedReq.toBinary(req),
      responseType: ListPinnedRsp,
    }),

  delete: (req: DeleteMessagesReq) =>
    rpcCall<DeleteMessagesRsp>({
      path: '/service/message/delete',
      auth: 'JWT_REQUIRED',
      requestBody: DeleteMessagesReq.toBinary(req),
      responseType: DeleteMessagesRsp,
    }),

  clearConversation: (req: ClearConversationReq) =>
    rpcCall<ClearConversationRsp>({
      path: '/service/message/clear',
      auth: 'JWT_REQUIRED',
      requestBody: ClearConversationReq.toBinary(req),
      responseType: ClearConversationRsp,
    }),

  updateReadAck: (req: UpdateReadAckReq) =>
    rpcCall<UpdateReadAckRsp>({
      path: '/service/message/update_read_ack',
      auth: 'JWT_REQUIRED',
      requestBody: UpdateReadAckReq.toBinary(req),
      responseType: UpdateReadAckRsp,
    }),
};
