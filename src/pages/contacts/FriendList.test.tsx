import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PresenceState } from '@/proto/presence/presence_service';
import { useContactStore } from '@/stores/contactStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useUIStore } from '@/stores/uiStore';
import { FriendList } from './FriendList';

describe('FriendList', () => {
  afterEach(() => {
    useContactStore.setState({
      friends: [],
      blockedUsers: [],
      friendSearch: {
        query: '',
        friends: [],
        loading: false,
        failed: false,
      },
    });
    usePresenceStore.setState({ presences: {} });
    useUIStore.setState({
      rightPanelOpen: false,
      rightPanelType: null,
      selectedUserProfile: null,
    });
    cleanup();
  });

  it('shows friend presence beside the avatar', () => {
    useContactStore.setState({
      friends: [{
        userId: 'friend-1',
        nickname: 'Ada',
        avatarUrl: '',
        bio: '',
        phone: '',
      }],
    });
    usePresenceStore.setState({
      presences: {
        'friend-1': {
          userId: 'friend-1',
          aggregatedState: PresenceState.ONLINE,
          lastActiveAtMs: 0n,
          devices: [],
        },
      },
    });

    render(<FriendList />);

    expect(screen.getByLabelText('Ada 当前状态：在线')).toBeTruthy();
  });

  it('opens the selected friend profile in the right panel', () => {
    useContactStore.setState({
      friends: [{
        userId: 'friend-1',
        nickname: 'Ada',
        avatarUrl: 'https://example.com/ada.png',
        bio: 'Product thinker',
        phone: '13800000000',
      }],
    });

    render(<FriendList />);
    fireEvent.click(screen.getByRole('button', { name: '查看 Ada 资料' }));

    expect(useUIStore.getState().rightPanelOpen).toBe(true);
    expect(useUIStore.getState().rightPanelType).toBe('user_profile');
    expect(useUIStore.getState().selectedUserProfile).toEqual({
      userId: 'friend-1',
      nickname: 'Ada',
      avatarUrl: 'https://example.com/ada.png',
      bio: 'Product thinker',
    });
  });

  it('filters friends by nickname and phone keyword', () => {
    useContactStore.setState({
      friends: [
        {
          userId: 'friend-1',
          nickname: 'Ada',
          avatarUrl: '',
          bio: '',
          phone: '13800000000',
        },
        {
          userId: 'friend-2',
          nickname: 'Grace',
          avatarUrl: '',
          bio: '',
          phone: '13900000000',
        },
      ],
    });

    render(<FriendList />);
    fireEvent.change(screen.getByPlaceholderText('搜索好友'), { target: { value: '139' } });

    expect(screen.queryByText('Ada')).toBeNull();
    expect(screen.getByText('Grace')).toBeTruthy();
  });

  it('shows backend friend search results when store search succeeds', async () => {
    const backendFriend = {
      userId: 'friend-3',
      nickname: 'Backend Ada',
      avatarUrl: '',
      bio: '',
      phone: '13700000000',
    };
    const searchFriends = vi.fn().mockImplementation(async () => {
      useContactStore.setState({
        friendSearch: {
          query: 'Backend',
          friends: [backendFriend],
          loading: false,
          failed: false,
        },
      });
    });
    const originalSearchFriends = useContactStore.getState().searchFriends;
    useContactStore.setState({
      friends: [{
        userId: 'friend-1',
        nickname: 'Local Ada',
        avatarUrl: '',
        bio: '',
        phone: '13800000000',
      }],
      searchFriends,
    });

    render(<FriendList />);
    fireEvent.change(screen.getByPlaceholderText('搜索好友'), { target: { value: 'Backend' } });

    expect(await screen.findByText('Backend Ada')).toBeTruthy();
    expect(screen.queryByText('Local Ada')).toBeNull();
    useContactStore.setState({ searchFriends: originalSearchFriends });
  });

  it('falls back to local friend filtering when backend search fails', async () => {
    const searchFriends = vi.fn().mockResolvedValue(undefined);
    const originalSearchFriends = useContactStore.getState().searchFriends;
    useContactStore.setState({
      friends: [
        {
          userId: 'friend-1',
          nickname: 'Ada',
          avatarUrl: '',
          bio: '',
          phone: '13800000000',
        },
        {
          userId: 'friend-2',
          nickname: 'Grace',
          avatarUrl: '',
          bio: '',
          phone: '13900000000',
        },
      ],
      friendSearch: {
        query: 'Ada',
        friends: [],
        loading: false,
        failed: true,
      },
      searchFriends,
    });

    render(<FriendList />);
    fireEvent.change(screen.getByPlaceholderText('搜索好友'), { target: { value: 'Ada' } });

    expect(await screen.findByText('Ada')).toBeTruthy();
    expect(screen.queryByText('Grace')).toBeNull();
    useContactStore.setState({ searchFriends: originalSearchFriends });
  });

  it('removes and blocks friends from row actions', async () => {
    const removeFriend = vi.fn().mockResolvedValue(undefined);
    const blockUser = vi.fn().mockResolvedValue(undefined);
    const originalRemoveFriend = useContactStore.getState().removeFriend;
    const originalBlockUser = useContactStore.getState().blockUser;
    useContactStore.setState({
      friends: [{
        userId: 'friend-1',
        nickname: 'Ada',
        avatarUrl: '',
        bio: '',
        phone: '13800000000',
      }],
      removeFriend,
      blockUser,
    });

    render(<FriendList />);
    fireEvent.click(screen.getByRole('button', { name: '移除 Ada' }));
    fireEvent.click(screen.getByRole('button', { name: '拉黑 Ada' }));

    expect(removeFriend).toHaveBeenCalledWith('friend-1');
    expect(blockUser).toHaveBeenCalledWith('friend-1');
    useContactStore.setState({
      removeFriend: originalRemoveFriend,
      blockUser: originalBlockUser,
    });
  });
});
