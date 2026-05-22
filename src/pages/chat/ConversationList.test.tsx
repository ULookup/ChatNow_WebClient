import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType } from '@/proto/message/message_types';

describe('ConversationList', () => {
  afterEach(async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      conversations: [],
      conversationSearch: {
        query: '',
        conversations: [],
        loading: false,
        failed: false,
      },
      activeConversationId: null,
    });
    cleanup();
  });

  it('shows backend conversation search results when store search succeeds', async () => {
    const [{ useChatStore }, { ConversationList }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ConversationList'),
    ]);
    const backendConversation = createConversation('backend-result', '后端命中');
    useChatStore.setState({
      conversations: [createConversation('local-only', '本地会话')],
      searchConversations: vi.fn().mockImplementation(async () => {
        useChatStore.setState({
          conversationSearch: {
            query: '后端',
            conversations: [backendConversation],
            loading: false,
            failed: false,
          },
        });
      }),
    });

    render(<ConversationList />);
    fireEvent.change(screen.getByPlaceholderText('搜索会话、好友或消息'), {
      target: { value: '后端' },
    });

    await waitFor(() => expect(screen.getByText('后端命中')).toBeTruthy());
    expect(screen.queryByText('本地会话')).toBeNull();
  });

  it('falls back to local filtering when backend search fails', async () => {
    const [{ useChatStore }, { ConversationList }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ConversationList'),
    ]);
    useChatStore.setState({
      conversations: [
        createConversation('conv-product', '产品体验小组'),
        createConversation('conv-finance', '财务讨论'),
      ],
      conversationSearch: {
        query: '产品',
        conversations: [],
        loading: false,
        failed: true,
      },
      searchConversations: vi.fn().mockResolvedValue(undefined),
    });

    render(<ConversationList />);
    fireEvent.change(screen.getByPlaceholderText('搜索会话、好友或消息'), {
      target: { value: '产品' },
    });

    expect(await screen.findByText('产品体验小组')).toBeTruthy();
    expect(screen.queryByText('财务讨论')).toBeNull();
  });
});

function createConversation(conversationId: string, name: string): Conversation {
  return {
    conversationId,
    type: ConversationType.GROUP,
    name,
    avatarUrl: '',
    createdAtMs: 1n,
    memberCount: 3,
    topMemberIds: [],
    status: ConversationStatus.CONVERSATION_NORMAL,
    lastMessage: {
      messageId: 1n,
      senderId: 'u-1',
      messageType: MessageType.TEXT,
      contentPreview: '接口驱动搜索',
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
