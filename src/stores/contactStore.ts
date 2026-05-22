import { create } from 'zustand';
import type { UserInfo } from '@/proto/common/types';
import type { FriendEvent } from '@/proto/relationship/relationship_service';
import { RelationshipService } from '@/services/relationship';
import { IdentityService } from '@/services/identity';

export interface ContactState {
  friends: UserInfo[];
  pendingRequests: FriendEvent[];
  blockedUsers: UserInfo[];
  friendSearch: {
    query: string;
    friends: UserInfo[];
    loading: boolean;
    failed: boolean;
  };
  userSearch: {
    query: string;
    users: UserInfo[];
    loading: boolean;
    failed: boolean;
  };
  loading: boolean;

  loadFriends: () => Promise<void>;
  loadPending: () => Promise<void>;
  loadBlocked: () => Promise<void>;
  searchFriends: (keyword: string) => Promise<void>;
  searchUsers: (keyword: string) => Promise<void>;
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
  friendSearch: {
    query: '',
    friends: [],
    loading: false,
    failed: false,
  },
  userSearch: {
    query: '',
    users: [],
    loading: false,
    failed: false,
  },
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

  searchFriends: async (keyword) => {
    const query = keyword.trim();
    if (!query) {
      set({
        friendSearch: {
          query: '',
          friends: [],
          loading: false,
          failed: false,
        },
      });
      return;
    }

    set({
      friendSearch: {
        query,
        friends: [],
        loading: true,
        failed: false,
      },
    });

    try {
      const rsp = await RelationshipService.searchFriends({
        requestId: crypto.randomUUID(),
        searchKey: query,
      });
      if (!rsp.header?.success) {
        throw new Error(rsp.header?.errorMessage || 'Search friends failed');
      }
      set({
        friendSearch: {
          query,
          friends: rsp.userInfo,
          loading: false,
          failed: false,
        },
      });
    } catch {
      set({
        friendSearch: {
          query,
          friends: [],
          loading: false,
          failed: true,
        },
      });
    }
  },

  searchUsers: async (keyword) => {
    const query = keyword.trim();
    if (!query) {
      set({
        userSearch: {
          query: '',
          users: [],
          loading: false,
          failed: false,
        },
      });
      return;
    }

    set({
      userSearch: {
        query,
        users: [],
        loading: true,
        failed: false,
      },
    });

    try {
      const rsp = await IdentityService.searchUsers({
        requestId: crypto.randomUUID(),
        searchKey: query,
      });
      if (!rsp.header?.success) {
        throw new Error(rsp.header?.errorMessage || 'Search users failed');
      }
      set({
        userSearch: {
          query,
          users: rsp.userInfo,
          loading: false,
          failed: false,
        },
      });
    } catch {
      set({
        userSearch: {
          query,
          users: [],
          loading: false,
          failed: true,
        },
      });
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
    set((s) => ({
      friends: s.friends.filter((f) => f.userId !== peerId),
      friendSearch: {
        ...s.friendSearch,
        friends: s.friendSearch.friends.filter((f) => f.userId !== peerId),
      },
    }));
  },

  blockUser: async (peerId) => {
    await RelationshipService.blockUser({
      requestId: crypto.randomUUID(),
      peerId,
    });
    set((s) => {
      const blockedFriend = s.friends.find((friend) => friend.userId === peerId);
      const alreadyBlocked = s.blockedUsers.some((user) => user.userId === peerId);
      return {
        friends: s.friends.filter((friend) => friend.userId !== peerId),
        friendSearch: {
          ...s.friendSearch,
          friends: s.friendSearch.friends.filter((friend) => friend.userId !== peerId),
        },
        blockedUsers: blockedFriend && !alreadyBlocked
          ? [...s.blockedUsers, blockedFriend]
          : s.blockedUsers,
      };
    });
  },

  unblockUser: async (peerId) => {
    await RelationshipService.unblockUser({
      requestId: crypto.randomUUID(),
      peerId,
    });
    set((s) => ({
      blockedUsers: s.blockedUsers.filter((user) => user.userId !== peerId),
    }));
  },
}));
