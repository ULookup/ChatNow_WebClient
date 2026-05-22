import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserInfo } from '@/proto/common/types';

const listFriends = vi.fn().mockResolvedValue({ header: { success: true }, friendList: [] });
const listPendingRequests = vi.fn().mockResolvedValue({ header: { success: true }, event: [] });
const listBlockedUsers = vi.fn().mockResolvedValue({ header: { success: true }, blockedList: [] });
const sendFriendRequest = vi.fn().mockResolvedValue({ header: { success: true } });
const handleFriendRequest = vi.fn().mockResolvedValue({ header: { success: true } });
const removeFriend = vi.fn().mockResolvedValue({ header: { success: true } });
const blockUser = vi.fn().mockResolvedValue({ header: { success: true } });
const unblockUser = vi.fn().mockResolvedValue({ header: { success: true } });
const searchFriends = vi.fn().mockResolvedValue({ header: { success: true }, userInfo: [] });
const searchUsers = vi.fn().mockResolvedValue({ header: { success: true }, userInfo: [] });

vi.mock('@/services/relationship', () => ({
  RelationshipService: {
    listFriends,
    listPendingRequests,
    listBlockedUsers,
    sendFriendRequest,
    handleFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    searchFriends,
  },
}));

vi.mock('@/services/identity', () => ({
  IdentityService: {
    searchUsers,
  },
}));

describe('contactStore relationship actions', () => {
  afterEach(async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    useContactStore.setState({
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
    });
    listFriends.mockClear();
    listPendingRequests.mockClear();
    listBlockedUsers.mockClear();
    sendFriendRequest.mockClear();
    handleFriendRequest.mockClear();
    removeFriend.mockClear();
    blockUser.mockClear();
    unblockUser.mockClear();
    searchFriends.mockClear();
    searchUsers.mockClear();
    searchFriends.mockResolvedValue({ header: { success: true }, userInfo: [] });
    searchUsers.mockResolvedValue({ header: { success: true }, userInfo: [] });
    blockUser.mockResolvedValue({ header: { success: true } });
    unblockUser.mockResolvedValue({ header: { success: true } });
    removeFriend.mockResolvedValue({ header: { success: true } });
  });

  it('searches friends through RelationshipService and stores backend results', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    const result = createUser('friend-2', 'Grace');
    searchFriends.mockResolvedValue({
      header: { success: true },
      userInfo: [result],
    });

    await useContactStore.getState().searchFriends('Grace');

    expect(searchFriends).toHaveBeenCalledWith(expect.objectContaining({
      searchKey: 'Grace',
    }));
    expect(useContactStore.getState().friendSearch).toEqual({
      query: 'Grace',
      friends: [result],
      loading: false,
      failed: false,
    });
  });

  it('marks failed friend search so the UI can fall back locally', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    searchFriends.mockRejectedValue(new Error('offline'));

    await useContactStore.getState().searchFriends('Ada');

    expect(useContactStore.getState().friendSearch).toMatchObject({
      query: 'Ada',
      friends: [],
      loading: false,
      failed: true,
    });
  });

  it('searches global users through IdentityService and stores backend results', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    const result = createUser('user-9', 'Remote User');
    searchUsers.mockResolvedValue({
      header: { success: true },
      userInfo: [result],
    });

    await useContactStore.getState().searchUsers('remote');

    expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({
      searchKey: 'remote',
    }));
    expect(useContactStore.getState().userSearch).toEqual({
      query: 'remote',
      users: [result],
      loading: false,
      failed: false,
    });
  });

  it('marks failed global user search separately from friend search', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    searchUsers.mockRejectedValue(new Error('offline'));

    await useContactStore.getState().searchUsers('remote');

    expect(useContactStore.getState().userSearch).toMatchObject({
      query: 'remote',
      users: [],
      loading: false,
      failed: true,
    });
  });

  it('removes friends through RelationshipService', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    useContactStore.setState({ friends: [createUser('friend-1', 'Ada')] });

    await useContactStore.getState().removeFriend('friend-1');

    expect(removeFriend).toHaveBeenCalledWith(expect.objectContaining({
      peerId: 'friend-1',
    }));
    expect(useContactStore.getState().friends).toEqual([]);
  });

  it('blocks a friend and moves the user to the blocked list', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    const ada = createUser('friend-1', 'Ada');
    useContactStore.setState({ friends: [ada], blockedUsers: [] });

    await useContactStore.getState().blockUser('friend-1');

    expect(blockUser).toHaveBeenCalledWith(expect.objectContaining({
      peerId: 'friend-1',
    }));
    expect(useContactStore.getState().friends).toEqual([]);
    expect(useContactStore.getState().blockedUsers).toEqual([ada]);
  });

  it('unblocks a user and removes them from the blocked list', async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    useContactStore.setState({ blockedUsers: [createUser('friend-1', 'Ada')] });

    await useContactStore.getState().unblockUser('friend-1');

    expect(unblockUser).toHaveBeenCalledWith(expect.objectContaining({
      peerId: 'friend-1',
    }));
    expect(useContactStore.getState().blockedUsers).toEqual([]);
  });
});

function createUser(userId: string, nickname: string): UserInfo {
  return {
    userId,
    nickname,
    avatarUrl: '',
    bio: '',
    phone: userId === 'friend-1' ? '13800000000' : '13900000000',
  };
}
