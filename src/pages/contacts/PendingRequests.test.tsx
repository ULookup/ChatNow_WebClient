import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/stores/chatStore';
import { useContactStore } from '@/stores/contactStore';
import { useUIStore } from '@/stores/uiStore';
import { PendingRequests } from './PendingRequests';

function seedPendingRequest() {
  useContactStore.setState({
    pendingRequests: [{
      eventId: 'event-1',
      sender: {
        userId: 'friend-1',
        nickname: 'Ada',
        avatarUrl: '',
        bio: '',
        phone: '13800000000',
      },
    }],
  });
}

describe('PendingRequests', () => {
  afterEach(() => {
    useContactStore.setState({ pendingRequests: [] });
    useChatStore.setState({ activeConversationId: null });
    useUIStore.setState({ activeModule: 'chat' });
    cleanup();
  });

  it('opens the new conversation after accepting a friend request', async () => {
    seedPendingRequest();
    const handleFriendRequest = vi.fn().mockResolvedValue('conversation-1');
    const openConversation = vi.fn().mockResolvedValue(undefined);
    const originalHandleFriendRequest = useContactStore.getState().handleFriendRequest;
    const originalOpenConversation = useChatStore.getState().openConversation;
    useContactStore.setState({ handleFriendRequest });
    useChatStore.setState({ openConversation });
    useUIStore.setState({ activeModule: 'contacts' });

    render(<PendingRequests />);
    fireEvent.click(screen.getByRole('button', { name: '同意 Ada 的好友申请' }));

    await waitFor(() => {
      expect(handleFriendRequest).toHaveBeenCalledWith('event-1', true, 'friend-1');
      expect(openConversation).toHaveBeenCalledWith('conversation-1');
    });
    expect(useUIStore.getState().activeModule).toBe('chat');
    useContactStore.setState({ handleFriendRequest: originalHandleFriendRequest });
    useChatStore.setState({ openConversation: originalOpenConversation });
  });

  it('shows an error when handling a friend request fails', async () => {
    seedPendingRequest();
    const handleFriendRequest = vi.fn().mockRejectedValue(new Error('network'));
    const originalHandleFriendRequest = useContactStore.getState().handleFriendRequest;
    useContactStore.setState({ handleFriendRequest });

    render(<PendingRequests />);
    fireEvent.click(screen.getByRole('button', { name: '拒绝 Ada 的好友申请' }));

    expect(await screen.findByText('处理失败，请重试')).toBeTruthy();
    expect((screen.getByRole('button', { name: '拒绝 Ada 的好友申请' }) as HTMLButtonElement).disabled).toBe(false);
    useContactStore.setState({ handleFriendRequest: originalHandleFriendRequest });
  });
});
