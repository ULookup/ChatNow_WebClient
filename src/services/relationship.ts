import { rpcCall } from './client';
import {
  ListFriendsReq,
  ListFriendsRsp,
  SendFriendReq,
  SendFriendRsp,
  HandleFriendReq,
  HandleFriendRsp,
  RemoveFriendReq,
  RemoveFriendRsp,
  SearchFriendsReq,
  SearchFriendsRsp,
  BlockUserReq,
  BlockUserRsp,
  UnblockUserReq,
  UnblockUserRsp,
  ListBlockedReq,
  ListBlockedRsp,
  ListPendingReq,
  ListPendingRsp,
} from '@/proto/relationship/relationship_service';

/**
 * Relationship REST service wrapping all relationship RPC endpoints.
 * Each method serializes the request with protobuf and deserializes the response.
 */
export const RelationshipService = {
  listFriends: (req: ListFriendsReq) =>
    rpcCall<ListFriendsRsp>({
      path: '/service/relationship/list_friends',
      auth: 'JWT_REQUIRED',
      requestBody: ListFriendsReq.toBinary(req),
      responseType: ListFriendsRsp,
    }),

  sendFriendRequest: (req: SendFriendReq) =>
    rpcCall<SendFriendRsp>({
      path: '/service/relationship/send_friend_request',
      auth: 'JWT_REQUIRED',
      requestBody: SendFriendReq.toBinary(req),
      responseType: SendFriendRsp,
    }),

  handleFriendRequest: (req: HandleFriendReq) =>
    rpcCall<HandleFriendRsp>({
      path: '/service/relationship/handle_friend_request',
      auth: 'JWT_REQUIRED',
      requestBody: HandleFriendReq.toBinary(req),
      responseType: HandleFriendRsp,
    }),

  removeFriend: (req: RemoveFriendReq) =>
    rpcCall<RemoveFriendRsp>({
      path: '/service/relationship/remove_friend',
      auth: 'JWT_REQUIRED',
      requestBody: RemoveFriendReq.toBinary(req),
      responseType: RemoveFriendRsp,
    }),

  searchFriends: (req: SearchFriendsReq) =>
    rpcCall<SearchFriendsRsp>({
      path: '/service/relationship/search_friends',
      auth: 'JWT_REQUIRED',
      requestBody: SearchFriendsReq.toBinary(req),
      responseType: SearchFriendsRsp,
    }),

  blockUser: (req: BlockUserReq) =>
    rpcCall<BlockUserRsp>({
      path: '/service/relationship/block_user',
      auth: 'JWT_REQUIRED',
      requestBody: BlockUserReq.toBinary(req),
      responseType: BlockUserRsp,
    }),

  unblockUser: (req: UnblockUserReq) =>
    rpcCall<UnblockUserRsp>({
      path: '/service/relationship/unblock_user',
      auth: 'JWT_REQUIRED',
      requestBody: UnblockUserReq.toBinary(req),
      responseType: UnblockUserRsp,
    }),

  listBlockedUsers: (req: ListBlockedReq) =>
    rpcCall<ListBlockedRsp>({
      path: '/service/relationship/list_blocked_users',
      auth: 'JWT_REQUIRED',
      requestBody: ListBlockedReq.toBinary(req),
      responseType: ListBlockedRsp,
    }),

  listPendingRequests: (req: ListPendingReq) =>
    rpcCall<ListPendingRsp>({
      path: '/service/relationship/list_pending_requests',
      auth: 'JWT_REQUIRED',
      requestBody: ListPendingReq.toBinary(req),
      responseType: ListPendingRsp,
    }),
};
