import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useContactStore } from '@/stores/contactStore';
import { BlockedUsers } from './BlockedUsers';

describe('BlockedUsers', () => {
  afterEach(() => {
    useContactStore.setState({ blockedUsers: [] });
    cleanup();
  });

  it('unblocks a blocked user from the list', () => {
    const unblockUser = vi.fn().mockResolvedValue(undefined);
    const originalUnblockUser = useContactStore.getState().unblockUser;
    useContactStore.setState({
      blockedUsers: [{
        userId: 'friend-1',
        nickname: 'Ada',
        avatarUrl: '',
        bio: '',
        phone: '13800000000',
      }],
      unblockUser,
    });

    render(<BlockedUsers />);
    fireEvent.click(screen.getByRole('button', { name: '解除拉黑 Ada' }));

    expect(unblockUser).toHaveBeenCalledWith('friend-1');
    useContactStore.setState({ unblockUser: originalUnblockUser });
  });
});
