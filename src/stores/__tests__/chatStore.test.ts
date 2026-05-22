import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

const saveDraft = vi.fn().mockResolvedValue({ header: { success: true } });
const addReaction = vi.fn().mockResolvedValue({ header: { success: true } });
const removeReaction = vi.fn().mockResolvedValue({ header: { success: true } });
const getReactions = vi.fn().mockResolvedValue({ header: { success: true }, reactions: [] });
const recall = vi.fn().mockResolvedValue({ header: { success: true } });
const pin = vi.fn().mockResolvedValue({ header: { success: true } });
const unpin = vi.fn().mockResolvedValue({ header: { success: true } });
const listPinned = vi.fn().mockResolvedValue({ header: { success: true }, messages: [] });
const search = vi.fn().mockResolvedValue({ header: { success: true }, messages: [], hasMore: false, nextCursor: '' });
const deleteMessages = vi.fn().mockResolvedValue({ header: { success: true } });
const clearConversation = vi.fn().mockResolvedValue({ header: { success: true } });
const updateReadAck = vi.fn().mockResolvedValue({ header: { success: true } });
const sendTyping = vi.fn().mockResolvedValue({ header: { success: true } });
const searchConversations = vi.fn().mockResolvedValue({ header: { success: true }, conversations: [] });
const setVisible = vi.fn().mockResolvedValue({ header: { success: true } });
const quit = vi.fn().mockResolvedValue({ header: { success: true } });
const updateConversation = vi.fn().mockResolvedValue({ header: { success: true }, conversation: undefined });
const dismiss = vi.fn().mockResolvedValue({ header: { success: true } });
const listMembers = vi.fn().mockResolvedValue({ header: { success: true }, members: [] });
const addMembers = vi.fn().mockResolvedValue({ header: { success: true } });
const removeMembers = vi.fn().mockResolvedValue({ header: { success: true } });
const changeRole = vi.fn().mockResolvedValue({ header: { success: true } });
const transferOwner = vi.fn().mockResolvedValue({ header: { success: true } });

vi.mock('@/services/conversation', () => ({
  ConversationService: {
    saveDraft,
    search: searchConversations,
    setVisible,
    quit,
    update: updateConversation,
    dismiss,
    listMembers,
    addMembers,
    removeMembers,
    changeRole,
    transferOwner,
  },
}));

vi.mock('@/services/message', () => ({
  MessageService: {
    addReaction,
    removeReaction,
    getReactions,
    recall,
    pin,
    unpin,
    listPinned,
    search,
    delete: deleteMessages,
    clearConversation,
    updateReadAck,
  },
}));

vi.mock('@/services/presence', () => ({
  PresenceService: {
    sendTyping,
  },
}));

function createMessage(): Message {
  return {
    messageId: 42n,
    conversationId: 'conversation-1',
    senderId: 'u-2',
    createdAtMs: 1_716_000_000_000n,
    editedAtMs: 0n,
    seqId: 1n,
    userSeq: 1n,
    clientMsgId: 'server-42',
    status: MessageStatus.NORMAL,
    mentionedUserIds: [],
    reactions: [],
    isPinned: false,
    content: {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text: 'hello' } },
    },
  };
}

function createConversation(draft = ''): Conversation {
  return {
    conversationId: 'conversation-1',
    type: ConversationType.PRIVATE,
    name: 'Designer',
    avatarUrl: '',
    createdAtMs: 1_716_000_000_000n,
    memberCount: 2,
    topMemberIds: ['me', 'u-2'],
    status: ConversationStatus.CONVERSATION_NORMAL,
    self: {
      role: MemberRole.MEMBER,
      joinedAtMs: 1_716_000_000_000n,
      isMuted: false,
      isPinned: false,
      pinTimeMs: 0n,
      isVisible: true,
      lastReadSeq: 1n,
      unreadCount: 0n,
      draft,
    },
  };
}

describe('chatStore reactions', () => {
  afterEach(async () => {
    const { useChatStore } = await import('@/stores/chatStore');
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
      typingUsersByConv: {},
      lastReadSeq: {},
      unreadCounts: {},
      loading: false,
      pinnedLoading: false,
    });
    addReaction.mockClear();
    removeReaction.mockClear();
    getReactions.mockClear();
    recall.mockClear();
    pin.mockClear();
    unpin.mockClear();
    listPinned.mockClear();
    search.mockClear();
    deleteMessages.mockClear();
    clearConversation.mockClear();
    updateReadAck.mockClear();
    sendTyping.mockClear();
    saveDraft.mockClear();
    searchConversations.mockClear();
    setVisible.mockClear();
    quit.mockClear();
    updateConversation.mockClear();
    dismiss.mockClear();
    listMembers.mockClear();
    addMembers.mockClear();
    removeMembers.mockClear();
    changeRole.mockClear();
    transferOwner.mockClear();
    listPinned.mockResolvedValue({ header: { success: true }, messages: [] });
    search.mockResolvedValue({ header: { success: true }, messages: [], hasMore: false, nextCursor: '' });
    clearConversation.mockResolvedValue({ header: { success: true } });
    getReactions.mockResolvedValue({ header: { success: true }, reactions: [] });
    updateReadAck.mockResolvedValue({ header: { success: true } });
    searchConversations.mockResolvedValue({ header: { success: true }, conversations: [] });
    setVisible.mockResolvedValue({ header: { success: true } });
    quit.mockResolvedValue({ header: { success: true } });
    updateConversation.mockResolvedValue({ header: { success: true }, conversation: undefined });
    dismiss.mockResolvedValue({ header: { success: true } });
    listMembers.mockResolvedValue({ header: { success: true }, members: [] });
    addMembers.mockResolvedValue({ header: { success: true } });
    removeMembers.mockResolvedValue({ header: { success: true } });
    changeRole.mockResolvedValue({ header: { success: true } });
    transferOwner.mockResolvedValue({ header: { success: true } });
  });

  it('adds a reaction through MessageService and updates the local message', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().addReaction('conversation-1', 42n, '❤️', 'me');

    expect(addReaction).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 42n,
      emoji: '❤️',
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].reactions).toEqual([{
      emoji: '❤️',
      count: 1,
      recentUserIds: ['me'],
      selfReacted: true,
    }]);
  });

  it('removes a reaction through MessageService and updates the local message', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: {
        'conversation-1': [{
          ...createMessage(),
          reactions: [{
            emoji: '👍',
            count: 2,
            recentUserIds: ['me', 'u-3'],
            selfReacted: true,
          }],
        }],
      },
    });

    await useChatStore.getState().removeReaction('conversation-1', 42n, '👍', 'me');

    expect(removeReaction).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 42n,
      emoji: '👍',
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].reactions).toEqual([{
      emoji: '👍',
      count: 1,
      recentUserIds: ['u-3'],
      selfReacted: false,
    }]);
  });

  it('refreshes message reactions through MessageService', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const backendReactions = [{
      emoji: '🎉',
      count: 4,
      recentUserIds: ['me', 'u-2'],
      selfReacted: true,
    }];
    getReactions.mockResolvedValue({ header: { success: true }, reactions: backendReactions });
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().refreshMessageReactions('conversation-1', 42n);

    expect(getReactions).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 42n,
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].reactions).toEqual(backendReactions);
  });

  it('updates read ack through MessageService and clears unread state', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      conversations: [{
        ...createConversation(),
        self: {
          ...createConversation().self!,
          lastReadSeq: 1n,
          unreadCount: 3n,
        },
      }],
      lastReadSeq: { 'conversation-1': 1 },
      unreadCounts: { 'conversation-1': 3 },
    });

    await useChatStore.getState().updateReadAck('conversation-1', 9n);

    expect(updateReadAck).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      seqId: 9n,
    }));
    expect(useChatStore.getState().lastReadSeq['conversation-1']).toBe(9);
    expect(useChatStore.getState().unreadCounts['conversation-1']).toBe(0);
    expect(useChatStore.getState().conversations[0].self?.lastReadSeq).toBe(9n);
    expect(useChatStore.getState().conversations[0].self?.unreadCount).toBe(0n);
  });

  it('recalls a message through MessageService and marks it recalled locally', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().recallMessage('conversation-1', 42n);

    expect(recall).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      messageId: 42n,
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].status).toBe(MessageStatus.RECALLED);
  });

  it('pins and unpins a message through MessageService and keeps pinned messages in sync', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().pinMessage('conversation-1', 42n);

    expect(pin).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      messageId: 42n,
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].isPinned).toBe(true);
    expect(useChatStore.getState().pinnedMessagesByConv['conversation-1'][0].messageId).toBe(42n);

    await useChatStore.getState().unpinMessage('conversation-1', 42n);

    expect(unpin).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      messageId: 42n,
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].isPinned).toBe(false);
    expect(useChatStore.getState().pinnedMessagesByConv['conversation-1']).toEqual([]);
  });

  it('loads pinned messages through MessageService', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const pinnedMessage = { ...createMessage(), isPinned: true };
    listPinned.mockResolvedValue({ header: { success: true }, messages: [pinnedMessage] });

    await useChatStore.getState().listPinnedMessages('conversation-1');

    expect(listPinned).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
    }));
    expect(useChatStore.getState().pinnedMessagesByConv['conversation-1']).toEqual([pinnedMessage]);
  });

  it('sends typing state and tracks incoming typing users', async () => {
    const { useChatStore } = await import('@/stores/chatStore');

    await useChatStore.getState().sendTyping('conversation-1', true);
    useChatStore.getState().handleTyping('conversation-1', 'u-2', true);
    useChatStore.getState().handleTyping('conversation-1', 'u-3', true);
    useChatStore.getState().handleTyping('conversation-1', 'u-2', false);

    expect(sendTyping).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      isTyping: true,
    }));
    expect(useChatStore.getState().typingUsersByConv['conversation-1']).toEqual(['u-3']);
  });

  it('searches messages through MessageService and stores backend results', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const resultMessage = { ...createMessage(), messageId: 88n };
    search.mockResolvedValue({
      header: { success: true },
      messages: [resultMessage],
      hasMore: true,
      nextCursor: 'cursor-2',
    });

    await useChatStore.getState().searchMessages('conversation-1', '结论');

    expect(search).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      keyword: '结论',
      limit: 50,
      cursor: '',
    }));
    expect(useChatStore.getState().messageSearchesByConv['conversation-1']).toEqual({
      query: '结论',
      messages: [resultMessage],
      hasMore: true,
      nextCursor: 'cursor-2',
      loading: false,
    });
  });

  it('deletes a message through MessageService and marks it deleted locally', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().deleteMessages('conversation-1', [42n]);

    expect(deleteMessages).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      messageIds: [42n],
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1'][0].status).toBe(MessageStatus.DELETED);
  });

  it('clears a conversation through MessageService and resets local message state', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const message = createMessage();
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [{
        ...createConversation(),
        lastMessage: {
          messageId: message.messageId,
          senderId: message.senderId,
          messageType: message.content?.type ?? 0,
          contentPreview: 'hello',
          sentAtMs: message.createdAtMs,
          status: message.status,
        },
      }],
      messagesByConv: { 'conversation-1': [message] },
      pinnedMessagesByConv: { 'conversation-1': [{ ...message, isPinned: true }] },
      messageSearchesByConv: {
        'conversation-1': {
          query: 'hello',
          messages: [message],
          hasMore: false,
          nextCursor: '',
          loading: false,
        },
      },
      unreadCounts: { 'conversation-1': 3 },
    });

    await useChatStore.getState().clearConversation('conversation-1');

    expect(clearConversation).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
    }));
    expect(useChatStore.getState().messagesByConv['conversation-1']).toEqual([]);
    expect(useChatStore.getState().pinnedMessagesByConv['conversation-1']).toEqual([]);
    expect(useChatStore.getState().messageSearchesByConv['conversation-1']).toBeUndefined();
    expect(useChatStore.getState().unreadCounts['conversation-1']).toBe(0);
    expect(useChatStore.getState().conversations[0].lastMessage).toBeUndefined();
  });

  it('saves a conversation draft through ConversationService and updates the local conversation', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      conversations: [createConversation()],
    });

    await useChatStore.getState().saveDraft('conversation-1', '稍后回复产品方案');

    expect(saveDraft).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      draft: '稍后回复产品方案',
    }));
    expect(useChatStore.getState().conversations[0].self?.draft).toBe('稍后回复产品方案');
  });

  it('searches conversations through ConversationService and stores backend results', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const result = { ...createConversation(), conversationId: 'conversation-2', name: '后端结果' };
    useChatStore.setState({ conversations: [createConversation()] });
    searchConversations.mockResolvedValue({
      header: { success: true },
      conversations: [result],
    });

    await useChatStore.getState().searchConversations('后端');

    expect(searchConversations).toHaveBeenCalledWith(expect.objectContaining({
      searchKey: '后端',
    }));
    expect(useChatStore.getState().conversationSearch).toEqual({
      query: '后端',
      conversations: [result],
      loading: false,
      failed: false,
    });
  });

  it('tracks failed conversation search so UI can fall back locally', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    searchConversations.mockRejectedValue(new Error('offline'));

    await useChatStore.getState().searchConversations('产品');

    expect(useChatStore.getState().conversationSearch).toMatchObject({
      query: '产品',
      conversations: [],
      loading: false,
      failed: true,
    });
  });

  it('hides a conversation through ConversationService and removes it locally', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
    });

    await useChatStore.getState().setVisible('conversation-1', false);

    expect(setVisible).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      visible: false,
    }));
    expect(useChatStore.getState().conversations).toEqual([]);
    expect(useChatStore.getState().activeConversationId).toBeNull();
  });

  it('quits a conversation through ConversationService and clears the active conversation', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      messagesByConv: { 'conversation-1': [createMessage()] },
    });

    await useChatStore.getState().quitConversation('conversation-1');

    expect(quit).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
    }));
    expect(useChatStore.getState().conversations).toEqual([]);
    expect(useChatStore.getState().activeConversationId).toBeNull();
    expect(useChatStore.getState().messagesByConv['conversation-1']).toBeUndefined();
  });

  it('updates group profile fields through ConversationService and updates local conversation', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const current = { ...createConversation(), type: ConversationType.GROUP, name: '旧群名', description: '旧描述' };
    const updated = { ...current, name: '新群名', description: '新描述' };
    updateConversation.mockResolvedValue({ header: { success: true }, conversation: updated });
    useChatStore.setState({ conversations: [current] });

    await useChatStore.getState().updateConversation('conversation-1', {
      name: '新群名',
      description: '新描述',
      announcement: '新公告',
    });

    expect(updateConversation).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
      name: '新群名',
      description: '新描述',
      announcement: '新公告',
    }));
    expect(useChatStore.getState().conversations[0]).toMatchObject({
      name: '新群名',
      description: '新描述',
    });
  });

  it('dismisses a group through ConversationService and removes it locally', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [{ ...createConversation(), type: ConversationType.GROUP }],
      membersByConv: { 'conversation-1': [] },
    });

    await useChatStore.getState().dismissConversation('conversation-1');

    expect(dismiss).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'conversation-1',
    }));
    expect(useChatStore.getState().conversations).toEqual([]);
    expect(useChatStore.getState().activeConversationId).toBeNull();
    expect(useChatStore.getState().membersByConv['conversation-1']).toBeUndefined();
  });

  it('loads and manages group members through ConversationService', async () => {
    const { useChatStore } = await import('@/stores/chatStore');
    const members = [
      { userInfo: { userId: 'u-1', nickname: 'Owner', avatarUrl: '', bio: '', phone: '' }, role: MemberRole.OWNER },
      { userInfo: { userId: 'u-2', nickname: 'Member', avatarUrl: '', bio: '', phone: '' }, role: MemberRole.MEMBER },
    ];
    listMembers.mockResolvedValue({ header: { success: true }, members });
    useChatStore.setState({
      conversations: [{ ...createConversation(), type: ConversationType.GROUP, memberCount: 2 }],
    });

    await useChatStore.getState().listMembers('conversation-1');
    await useChatStore.getState().removeMembers('conversation-1', ['u-2']);
    await useChatStore.getState().addMembers('conversation-1', ['u-3']);
    await useChatStore.getState().changeMemberRole('conversation-1', 'u-1', MemberRole.ADMIN);
    await useChatStore.getState().transferOwner('conversation-1', 'u-1');

    expect(listMembers).toHaveBeenCalledWith(expect.objectContaining({ conversationId: 'conversation-1' }));
    expect(removeMembers).toHaveBeenCalledWith(expect.objectContaining({ memberIds: ['u-2'] }));
    expect(addMembers).toHaveBeenCalledWith(expect.objectContaining({ memberIds: ['u-3'] }));
    expect(changeRole).toHaveBeenCalledWith(expect.objectContaining({ targetUserId: 'u-1', role: MemberRole.ADMIN }));
    expect(transferOwner).toHaveBeenCalledWith(expect.objectContaining({ newOwnerId: 'u-1' }));
    expect(useChatStore.getState().membersByConv['conversation-1']).toEqual([
      { ...members[0], role: MemberRole.OWNER },
    ]);
    expect(useChatStore.getState().conversations[0].memberCount).toBe(1);
  });
});
