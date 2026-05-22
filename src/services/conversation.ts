import { rpcCall } from './client';
import {
  ListConversationsReq,
  ListConversationsRsp,
  GetConversationReq,
  GetConversationRsp,
  CreateConversationReq,
  CreateConversationRsp,
  SetVisibleReq,
  SetVisibleRsp,
  QuitConversationReq,
  QuitConversationRsp,
  SetMuteReq,
  SetMuteRsp,
  SetPinReq,
  SetPinRsp,
  MarkReadReq,
  MarkReadRsp,
  SaveDraftReq,
  SaveDraftRsp,
  SearchConversationsReq,
  SearchConversationsRsp,
  ListMembersReq,
  ListMembersRsp,
  UpdateConversationReq,
  UpdateConversationRsp,
  DismissConversationReq,
  DismissConversationRsp,
  AddMembersReq,
  AddMembersRsp,
  RemoveMembersReq,
  RemoveMembersRsp,
  ChangeMemberRoleReq,
  ChangeMemberRoleRsp,
  TransferOwnerReq,
  TransferOwnerRsp,
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

  search: (req: SearchConversationsReq) =>
    rpcCall<SearchConversationsRsp>({
      path: '/service/conversation/search',
      auth: 'JWT_REQUIRED',
      requestBody: SearchConversationsReq.toBinary(req),
      responseType: SearchConversationsRsp,
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

  setVisible: (req: SetVisibleReq) =>
    rpcCall<SetVisibleRsp>({
      path: '/service/conversation/set_visible',
      auth: 'JWT_REQUIRED',
      requestBody: SetVisibleReq.toBinary(req),
      responseType: SetVisibleRsp,
    }),

  quit: (req: QuitConversationReq) =>
    rpcCall<QuitConversationRsp>({
      path: '/service/conversation/quit',
      auth: 'JWT_REQUIRED',
      requestBody: QuitConversationReq.toBinary(req),
      responseType: QuitConversationRsp,
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

  listMembers: (req: ListMembersReq) =>
    rpcCall<ListMembersRsp>({
      path: '/service/conversation/list_members',
      auth: 'JWT_REQUIRED',
      requestBody: ListMembersReq.toBinary(req),
      responseType: ListMembersRsp,
    }),

  update: (req: UpdateConversationReq) =>
    rpcCall<UpdateConversationRsp>({
      path: '/service/conversation/update',
      auth: 'JWT_REQUIRED',
      requestBody: UpdateConversationReq.toBinary(req),
      responseType: UpdateConversationRsp,
    }),

  dismiss: (req: DismissConversationReq) =>
    rpcCall<DismissConversationRsp>({
      path: '/service/conversation/dismiss',
      auth: 'JWT_REQUIRED',
      requestBody: DismissConversationReq.toBinary(req),
      responseType: DismissConversationRsp,
    }),

  addMembers: (req: AddMembersReq) =>
    rpcCall<AddMembersRsp>({
      path: '/service/conversation/add_members',
      auth: 'JWT_REQUIRED',
      requestBody: AddMembersReq.toBinary(req),
      responseType: AddMembersRsp,
    }),

  removeMembers: (req: RemoveMembersReq) =>
    rpcCall<RemoveMembersRsp>({
      path: '/service/conversation/remove_members',
      auth: 'JWT_REQUIRED',
      requestBody: RemoveMembersReq.toBinary(req),
      responseType: RemoveMembersRsp,
    }),

  changeRole: (req: ChangeMemberRoleReq) =>
    rpcCall<ChangeMemberRoleRsp>({
      path: '/service/conversation/change_role',
      auth: 'JWT_REQUIRED',
      requestBody: ChangeMemberRoleReq.toBinary(req),
      responseType: ChangeMemberRoleRsp,
    }),

  transferOwner: (req: TransferOwnerReq) =>
    rpcCall<TransferOwnerRsp>({
      path: '/service/conversation/transfer_owner',
      auth: 'JWT_REQUIRED',
      requestBody: TransferOwnerReq.toBinary(req),
      responseType: TransferOwnerRsp,
    }),
};
