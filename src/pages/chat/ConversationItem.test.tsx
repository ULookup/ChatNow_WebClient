import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType } from '@/proto/message/message_types';

describe('ConversationItem actions', () => {
  afterEach(async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
    });
    cleanup();
  });

  it('hides a conversation from the quick action button', async () => {
    const [{ useChatStore }, { ConversationItem }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ConversationItem'),
    ]);
    const setVisible = vi.fn().mockResolvedValue(undefined);
    const originalSetVisible = useChatStore.getState().setVisible;
    useChatStore.setState({
      conversations: [createConversation()],
      setVisible,
    });

    render(<ConversationItem conv={createConversation()} />);
    fireEvent.click(screen.getByRole('button', { name: '隐藏会话' }));

    expect(setVisible).toHaveBeenCalledWith('conversation-1', false);
    useChatStore.setState({ setVisible: originalSetVisible });
  });
});

function createConversation(): Conversation {
  return {
    conversationId: 'conversation-1',
    type: ConversationType.GROUP,
    name: '产品体验小组',
    avatarUrl: '',
    createdAtMs: 1n,
    memberCount: 3,
    topMemberIds: [],
    status: ConversationStatus.CONVERSATION_NORMAL,
    lastMessage: {
      messageId: 1n,
      senderId: 'u-1',
      messageType: MessageType.TEXT,
      contentPreview: '接口驱动操作',
      sentAtMs: 1n,
      status: MessageStatus.NORMAL,
    },
    self: {
      role: MemberRole.MEMBER,
      joinedAtMs: 1n,
      isMuted: false,
      isPinned: false,
      pinTimeMs: 0n,
      isVisible: true,
      lastReadSeq: 1n,
      unreadCount: 0n,
    },
  };
}
