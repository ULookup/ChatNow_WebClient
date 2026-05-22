import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

describe('ContextPanel pinned messages', () => {
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
      pinnedMessagesByConv: {},
      messageSearchesByConv: {},
      membersByConv: {},
      conversationSearch: {
        query: '',
        conversations: [],
        loading: false,
        failed: false,
      },
      lastReadSeq: {},
      unreadCounts: {},
      pinnedLoading: false,
    });
    useUIStore.setState({
      rightPanelOpen: false,
      rightPanelType: null,
      selectedUserProfile: null,
    });
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders pinned messages for the active conversation', async () => {
    const [{ useChatStore }, { useUIStore }, { ContextPanel }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
      import('./ContextPanel'),
    ]);
    const listPinnedMessages = vi.fn().mockResolvedValue(undefined);
    const originalListPinnedMessages = useChatStore.getState().listPinnedMessages;
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      pinnedMessagesByConv: {
        'conversation-1': [createTextMessage(42n, '需要同步给全员的结论')],
      },
      listPinnedMessages,
    });
    useUIStore.setState({ rightPanelOpen: true, rightPanelType: 'pinned_messages' });

    render(<ContextPanel />);

    expect(screen.getByText('需要同步给全员的结论')).toBeTruthy();
    await waitFor(() => {
      expect(listPinnedMessages).toHaveBeenCalledWith('conversation-1');
    });
    useChatStore.setState({ listPinnedMessages: originalListPinnedMessages });
  });

  it('quits the active group conversation from the group detail panel', async () => {
    const [{ useChatStore }, { useUIStore }, { ContextPanel }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
      import('./ContextPanel'),
    ]);
    const quitConversation = vi.fn().mockResolvedValue(undefined);
    const originalQuitConversation = useChatStore.getState().quitConversation;
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      quitConversation,
    });
    useUIStore.setState({ rightPanelOpen: true, rightPanelType: 'group_info' });

    render(<ContextPanel />);
    fireEvent.click(screen.getByRole('button', { name: '退出群聊' }));

    await waitFor(() => {
      expect(quitConversation).toHaveBeenCalledWith('conversation-1');
    });
    useChatStore.setState({ quitConversation: originalQuitConversation });
  });

  it('updates group details from the group detail panel', async () => {
    const [{ useChatStore }, { useUIStore }, { ContextPanel }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
      import('./ContextPanel'),
    ]);
    const updateConversation = vi.fn().mockResolvedValue(undefined);
    const originalUpdateConversation = useChatStore.getState().updateConversation;
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [{ ...createConversation(), self: { ...createConversation().self!, role: MemberRole.OWNER } }],
      updateConversation,
    });
    useUIStore.setState({ rightPanelOpen: true, rightPanelType: 'group_info' });

    render(<ContextPanel />);
    fireEvent.change(screen.getByLabelText('群名称'), { target: { value: '新产品群' } });
    fireEvent.change(screen.getByLabelText('群描述'), { target: { value: '同步体验问题' } });
    fireEvent.change(screen.getByLabelText('群公告'), { target: { value: '周五评审' } });
    fireEvent.click(screen.getByRole('button', { name: '保存群资料' }));

    await waitFor(() => {
      expect(updateConversation).toHaveBeenCalledWith('conversation-1', {
        name: '新产品群',
        description: '同步体验问题',
        announcement: '周五评审',
      });
    });
    useChatStore.setState({ updateConversation: originalUpdateConversation });
  });

  it('dismisses an owned group from the group detail panel', async () => {
    const [{ useChatStore }, { useUIStore }, { ContextPanel }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/uiStore'),
      import('./ContextPanel'),
    ]);
    const dismissConversation = vi.fn().mockResolvedValue(undefined);
    const originalDismissConversation = useChatStore.getState().dismissConversation;
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [{ ...createConversation(), self: { ...createConversation().self!, role: MemberRole.OWNER } }],
      dismissConversation,
    });
    useUIStore.setState({ rightPanelOpen: true, rightPanelType: 'group_info' });

    render(<ContextPanel />);
    fireEvent.click(screen.getByRole('button', { name: '解散群聊' }));

    await waitFor(() => {
      expect(dismissConversation).toHaveBeenCalledWith('conversation-1');
    });
    useChatStore.setState({ dismissConversation: originalDismissConversation });
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
    isPinned: true,
    content: {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text } },
    },
  };
}
