import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

describe('ChatWindow', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
  });

  afterEach(async () => {
    const [{ useChatStore }, { useUIStore }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
    ]);
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
      messagesByConv: {},
      messageSearchesByConv: {},
      conversationSearch: {
        query: '',
        conversations: [],
        loading: false,
        failed: false,
      },
      typingUsersByConv: {},
      lastReadSeq: {},
      unreadCounts: {},
    });
    useUIStore.setState({
      messageSearchRequest: null,
      composerFocusRequest: 0,
      replyTarget: null,
      selectedUserProfile: null,
    });
    cleanup();
    vi.unstubAllGlobals();
  });

  it('opens in-chat search when the profile panel requests a message search', async () => {
    const [{ useChatStore }, { useUIStore }, { ChatWindow }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
      import('./ChatWindow'),
    ]);
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [{
        conversationId: 'conversation-1',
        type: ConversationType.GROUP,
        name: '产品体验小组',
        avatarUrl: '',
        createdAtMs: 1_716_000_000_000n,
        memberCount: 8,
        topMemberIds: [],
        status: ConversationStatus.CONVERSATION_NORMAL,
        self: {
          role: MemberRole.MEMBER,
          joinedAtMs: 1_716_000_000_000n,
          lastReadSeq: 0n,
          unreadCount: 0n,
          isMuted: false,
          isPinned: false,
          pinTimeMs: 0n,
          isVisible: true,
        },
      }],
      messagesByConv: { 'conversation-1': [] },
    });

    render(
      <MemoryRouter initialEntries={['/chat?preview=1']}>
        <ChatWindow />
      </MemoryRouter>,
    );
    act(() => useUIStore.getState().requestMessageSearch('Designer'));

    expect(screen.getByPlaceholderText('搜索当前会话消息')).toHaveProperty('value', 'Designer');
    expect(screen.getByText('0 条结果')).toBeTruthy();
  });

  it('lets users step through in-chat search results', async () => {
    const [{ useChatStore }, { ChatWindow }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ChatWindow'),
    ]);
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      messagesByConv: {
        'conversation-1': [
          createTextMessage(1n, 'Designer 第一条命中'),
          createTextMessage(2n, '这条不匹配'),
          createTextMessage(3n, 'Designer 第二条命中'),
        ],
      },
    });

    render(
      <MemoryRouter initialEntries={['/chat?preview=1']}>
        <ChatWindow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '搜索消息' }));
    fireEvent.change(screen.getByPlaceholderText('搜索当前会话消息'), {
      target: { value: 'Designer' },
    });

    expect(screen.getByText('1 / 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '下一条搜索结果' }));
    expect(screen.getByText('2 / 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '上一条搜索结果' }));
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  it('formats typing users for the message timeline', async () => {
    const { getTypingLabel } = await import('./MessageList/MessageList');

    expect(getTypingLabel('conversation-1', ['u-2'])).toBe('Designer 正在输入');
    expect(getTypingLabel('conversation-1', ['u-2', 'u-3'])).toBe('Designer、PM 等正在输入');
    expect(getTypingLabel('preview-product', [])).toBe('Designer 正在输入');
  });

  it('uses backend search results outside preview mode', async () => {
    const [{ useChatStore }, { ChatWindow }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ChatWindow'),
    ]);
    const searchMessages = vi.fn().mockResolvedValue(undefined);
    const originalSearchMessages = useChatStore.getState().searchMessages;
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      messagesByConv: {
        'conversation-1': [createTextMessage(1n, '本地旧消息')],
      },
      messageSearchesByConv: {
        'conversation-1': {
          query: 'backend',
          messages: [createTextMessage(9n, 'backend returned message')],
          hasMore: false,
          nextCursor: '',
          loading: false,
        },
      },
      searchMessages,
    });

    render(
      <MemoryRouter initialEntries={['/chat']}>
        <ChatWindow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '搜索消息' }));
    fireEvent.change(screen.getByPlaceholderText('搜索当前会话消息'), {
      target: { value: 'backend' },
    });

    expect(screen.getByText('1 / 1')).toBeTruthy();
    expect(searchMessages).toHaveBeenCalledWith('conversation-1', 'backend');
    useChatStore.setState({ searchMessages: originalSearchMessages });
  });

  it('clears visible messages from the header action in preview mode', async () => {
    const [{ useChatStore }, { ChatWindow }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./ChatWindow'),
    ]);
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      messagesByConv: {
        'conversation-1': [createTextMessage(1n, '需要清空的消息')],
      },
      pinnedMessagesByConv: {
        'conversation-1': [createTextMessage(1n, '需要清空的消息')],
      },
    });

    render(
      <MemoryRouter initialEntries={['/chat?preview=1']}>
        <ChatWindow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '清空当前会话消息' }));

    expect(screen.queryByText('需要清空的消息')).toBeNull();
    expect(useChatStore.getState().messagesByConv['conversation-1']).toEqual([]);
    expect(useChatStore.getState().pinnedMessagesByConv['conversation-1']).toEqual([]);
  });
});

function createConversation() {
  return {
    conversationId: 'conversation-1',
    type: ConversationType.GROUP,
    name: '产品体验小组',
    avatarUrl: '',
    createdAtMs: 1_716_000_000_000n,
    memberCount: 8,
    topMemberIds: [],
    status: ConversationStatus.CONVERSATION_NORMAL,
    self: {
      role: MemberRole.MEMBER,
      joinedAtMs: 1_716_000_000_000n,
      lastReadSeq: 0n,
      unreadCount: 0n,
      isMuted: false,
      isPinned: false,
      pinTimeMs: 0n,
      isVisible: true,
    },
  };
}

function createTextMessage(messageId: bigint, text: string): Message {
  return {
    messageId,
    conversationId: 'conversation-1',
    senderId: 'u-2',
    createdAtMs: 1_716_000_000_000n,
    editedAtMs: 0n,
    seqId: messageId,
    userSeq: messageId,
    clientMsgId: `message-${messageId.toString()}`,
    status: MessageStatus.NORMAL,
    mentionedUserIds: [],
    reactions: [],
    isPinned: false,
    content: {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text } },
    },
  };
}
