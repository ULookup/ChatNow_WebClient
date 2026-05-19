import { create } from 'zustand';
import type { UserInfo } from '@/proto/common/types';
import type { FriendEvent } from '@/proto/relationship/relationship_service';
import { RelationshipService } from '@/services/relationship';

export interface ContactState {
  friends: UserInfo[];
  pendingRequests: FriendEvent[];
  blockedUsers: UserInfo[];
  loading: boolean;

  loadFriends: () => Promise<void>;
  loadPending: () => Promise<void>;
  loadBlocked: () => Promise<void>;
  sendFriendRequest: (respondentId: string) => Promise<void>;
  handleFriendRequest: (eventId: string, agree: boolean, applyUserId: string) => Promise<string | undefined>;
  removeFriend: (peerId: string) => Promise<void>;
  blockUser: (peerId: string) => Promise<void>;
  unblockUser: (peerId: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set) => ({
  friends: [],
  pendingRequests: [],
  blockedUsers: [],
  loading: false,

  loadFriends: async () => {
    set({ loading: true });
    try {
      const rsp = await RelationshipService.listFriends({
        requestId: crypto.randomUUID(),
        page: { limit: 200, cursor: '' },
      });
      if (rsp.header?.success) {
        set({ friends: rsp.friendList });
      }
    } finally {
      set({ loading: false });
    }
  },

  loadPending: async () => {
    const rsp = await RelationshipService.listPendingRequests({
      requestId: crypto.randomUUID(),
    });
    if (rsp.header?.success) {
      set({ pendingRequests: rsp.event });
    }
  },

  loadBlocked: async () => {
    const rsp = await RelationshipService.listBlockedUsers({
      requestId: crypto.randomUUID(),
      page: { limit: 100, cursor: '' },
    });
    if (rsp.header?.success) {
      set({ blockedUsers: rsp.blockedList });
    }
  },

  sendFriendRequest: async (respondentId) => {
    await RelationshipService.sendFriendRequest({
      requestId: crypto.randomUUID(),
      respondentId,
    });
  },

  handleFriendRequest: async (eventId, agree, applyUserId) => {
    const rsp = await RelationshipService.handleFriendRequest({
      requestId: crypto.randomUUID(),
      notifyEventId: eventId,
      agree,
      applyUserId,
    });
    if (rsp.header?.success) {
      // Remove the handled event from the pending list
      set((s) => ({
        pendingRequests: s.pendingRequests.filter((e) => e.eventId !== eventId),
      }));
      return rsp.newConversationId;
    }
    return undefined;
  },

  removeFriend: async (peerId) => {
    await RelationshipService.removeFriend({
      requestId: crypto.randomUUID(),
      peerId,
    });
    set((s) => ({ friends: s.friends.filter((f) => f.userId !== peerId) }));
  },

  blockUser: async (peerId) => {
    await RelationshipService.blockUser({
      requestId: crypto.randomUUID(),
      peerId,
    });
  },

  unblockUser: async (peerId) => {
    await RelationshipService.unblockUser({
      requestId: crypto.randomUUID(),
      peerId,
    });
  },
}));
