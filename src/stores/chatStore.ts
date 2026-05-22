import { create } from 'zustand';
import { MemberRole, type Conversation, type MemberItem } from '@/proto/conversation/conversation_service';
import type { Message, MessageContent, ReactionGroup, ReplyRef } from '@/proto/message/message_types';
import { MessageStatus } from '@/proto/message/message_types';
import { ConversationService } from '@/services/conversation';
import { TransmiteService } from '@/services/transmite';
import { MessageService } from '@/services/message';
import { PresenceService } from '@/services/presence';

export interface MessageSearchState {
  query: string;
  messages: Message[];
  hasMore: boolean;
  nextCursor: string;
  loading: boolean;
}

export interface ConversationSearchState {
  query: string;
  conversations: Conversation[];
  loading: boolean;
  failed: boolean;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConv: Record<string, Message[]>;
  pinnedMessagesByConv: Record<string, Message[]>;
  messageSearchesByConv: Record<string, MessageSearchState>;
  conversationSearch: ConversationSearchState;
  membersByConv: Record<string, MemberItem[]>;
  typingUsersByConv: Record<string, string[]>;
  lastReadSeq: Record<string, number>;
  unreadCounts: Record<string, number>;
  loading: boolean;
  pinnedLoading: boolean;

  loadConversations: () => Promise<void>;
  openConversation: (convId: string) => Promise<void>;
  sendMessage: (convId: string, content: MessageContent, replyTo?: ReplyRef) => Promise<void>;
  loadHistory: (convId: string, beforeSeq: number) => Promise<void>;
  syncMessages: (convId: string, afterSeq: number) => Promise<void>;
  searchConversations: (keyword: string) => Promise<void>;
  searchMessages: (convId: string, keyword: string, cursor?: string) => Promise<void>;
  markRead: (convId: string, seq: number) => Promise<void>;
  saveDraft: (convId: string, draft: string) => Promise<void>;
  setPin: (convId: string, pin: boolean) => Promise<void>;
  setMute: (convId: string, mute: boolean) => Promise<void>;
  setVisible: (convId: string, visible: boolean) => Promise<void>;
  quitConversation: (convId: string) => Promise<void>;
  listMembers: (convId: string) => Promise<void>;
  updateConversation: (convId: string, patch: ConversationProfilePatch) => Promise<void>;
  dismissConversation: (convId: string) => Promise<void>;
  addMembers: (convId: string, memberIds: string[]) => Promise<void>;
  removeMembers: (convId: string, memberIds: string[]) => Promise<void>;
  changeMemberRole: (convId: string, targetUserId: string, role: MemberRole) => Promise<void>;
  transferOwner: (convId: string, newOwnerId: string) => Promise<void>;
  listPinnedMessages: (convId: string) => Promise<void>;
  pinMessage: (convId: string, messageId: bigint) => Promise<void>;
  unpinMessage: (convId: string, messageId: bigint) => Promise<void>;
  deleteMessages: (convId: string, messageIds: bigint[]) => Promise<void>;
  clearConversation: (convId: string) => Promise<void>;
  sendTyping: (convId: string, isTyping: boolean) => Promise<void>;
  recallMessage: (convId: string, messageId: bigint) => Promise<void>;
  addReaction: (convId: string, messageId: bigint, emoji: string, userId: string | null) => Promise<void>;
  removeReaction: (convId: string, messageId: bigint, emoji: string, userId: string | null) => Promise<void>;
  refreshMessageReactions: (convId: string, messageId: bigint) => Promise<void>;
  updateReadAck: (convId: string, seqId: bigint) => Promise<void>;

  // WS handlers (called from ws-client later)
  handleNewMessage: (msg: Message) => void;
  handleMessageRecalled: (convId: string, messageId: bigint) => void;
  handleMessagePinned: (convId: string, messageId: bigint, pinned: boolean) => void;
  handleMessagesDeleted: (convId: string, messageIds: bigint[]) => void;
  handleTyping: (convId: string, userId: string, isTyping: boolean) => void;
}

interface ConversationProfilePatch {
  name?: string;
  avatarUrl?: string;
  description?: string;
  announcement?: string;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConv: {},
  pinnedMessagesByConv: {},
  messageSearchesByConv: {},
  conversationSearch: {
    query: '',
    conversations: [],
    loading: false,
    failed: false,
  },
  membersByConv: {},
  typingUsersByConv: {},
  lastReadSeq: {},
  unreadCounts: {},
  loading: false,
  pinnedLoading: false,

  loadConversations: async () => {
    set({ loading: true });
    try {
      const rsp = await ConversationService.list({
        requestId: crypto.randomUUID(),
        page: { limit: 50, cursor: '' },
      });
      if (rsp.header?.success) {
        const convs = rsp.conversations ?? [];
        const lastReadSeq: Record<string, number> = {};
        const unreadCounts: Record<string, number> = {};
        for (const c of convs) {
          if (c.self) {
            lastReadSeq[c.conversationId] = Number(c.self.lastReadSeq);
            unreadCounts[c.conversationId] = Number(c.self.unreadCount);
          }
        }
        set({ conversations: convs, lastReadSeq, unreadCounts, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  openConversation: async (convId) => {
    set({ activeConversationId: convId });
    const conv = get().conversations.find(c => c.conversationId === convId);
    // Mark read if there are unread messages
    if (conv?.self?.unreadCount && conv.self.unreadCount > 0n) {
      try {
        await get().markRead(convId, Number(conv.self.lastReadSeq));
      } catch { /* non-critical */ }
    }
    // Load messages if not already loaded
    if (!get().messagesByConv[convId]) {
      try {
        await get().syncMessages(convId, 0);
      } catch { /* will load on retry */ }
    }
  },

  sendMessage: async (convId, content, replyTo) => {
    const clientMsgId = crypto.randomUUID();
    const rsp = await TransmiteService.send({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      content,
      clientMsgId,
      replyTo,
      mentionedUserIds: [],
    });
    if (rsp.header?.success && rsp.message) {
      get().handleNewMessage(rsp.message);
    } else {
      throw new Error(
        rsp.header?.errorMessage || 'Send message failed',
      );
    }
  },

  loadHistory: async (convId, beforeSeq) => {
    const rsp = await MessageService.getHistory({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      beforeSeq: BigInt(beforeSeq),
      limit: 30,
    });
    if (rsp.header?.success && rsp.messages) {
      const existing = get().messagesByConv[convId] ?? [];
      set({
        messagesByConv: {
          ...get().messagesByConv,
          [convId]: [...rsp.messages, ...existing],
        },
      });
    }
  },

  syncMessages: async (convId, afterSeq) => {
    const rsp = await MessageService.sync({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      afterSeq: BigInt(afterSeq),
      limit: 50,
    });
    if (rsp.header?.success && rsp.messages) {
      const existing = get().messagesByConv[convId] ?? [];
      const merged = [...existing];
      for (const msg of rsp.messages) {
        if (!merged.find(m => m.messageId === msg.messageId)) {
          merged.push(msg);
        }
      }
      merged.sort((a, b) => {
        const aSeq = a.seqId ?? 0n;
        const bSeq = b.seqId ?? 0n;
        if (aSeq < bSeq) return -1;
        if (aSeq > bSeq) return 1;
        return 0;
      });
      set({
        messagesByConv: {
          ...get().messagesByConv,
          [convId]: merged,
        },
      });
    }
  },

  searchConversations: async (keyword) => {
    const query = keyword.trim();
    if (!query) {
      set({
        conversationSearch: {
          query: '',
          conversations: [],
          loading: false,
          failed: false,
        },
      });
      return;
    }

    set({
      conversationSearch: {
        query,
        conversations: [],
        loading: true,
        failed: false,
      },
    });

    try {
      const rsp = await ConversationService.search({
        requestId: crypto.randomUUID(),
        searchKey: query,
      });
      if (!rsp.header?.success) {
        throw new Error(rsp.header?.errorMessage || 'Search conversations failed');
      }
      set({
        conversationSearch: {
          query,
          conversations: rsp.conversations ?? [],
          loading: false,
          failed: false,
        },
      });
    } catch {
      set({
        conversationSearch: {
          query,
          conversations: [],
          loading: false,
          failed: true,
        },
      });
    }
  },

  searchMessages: async (convId, keyword, cursor = '') => {
    const query = keyword.trim();
    if (!query) {
      set((s) => ({
        messageSearchesByConv: {
          ...s.messageSearchesByConv,
          [convId]: {
            query: '',
            messages: [],
            hasMore: false,
            nextCursor: '',
            loading: false,
          },
        },
      }));
      return;
    }

    set((s) => ({
      messageSearchesByConv: {
        ...s.messageSearchesByConv,
        [convId]: {
          query,
          messages: cursor ? s.messageSearchesByConv[convId]?.messages ?? [] : [],
          hasMore: false,
          nextCursor: cursor,
          loading: true,
        },
      },
    }));

    try {
      const rsp = await MessageService.search({
        requestId: crypto.randomUUID(),
        conversationId: convId,
        keyword: query,
        limit: 50,
        cursor,
      });
      if (!rsp.header?.success) {
        throw new Error(rsp.header?.errorMessage || 'Search messages failed');
      }
      set((s) => {
        const previous = cursor ? s.messageSearchesByConv[convId]?.messages ?? [] : [];
        return {
          messageSearchesByConv: {
            ...s.messageSearchesByConv,
            [convId]: {
              query,
              messages: [...previous, ...(rsp.messages ?? [])],
              hasMore: rsp.hasMore,
              nextCursor: rsp.nextCursor,
              loading: false,
            },
          },
        };
      });
    } catch (error) {
      set((s) => ({
        messageSearchesByConv: {
          ...s.messageSearchesByConv,
          [convId]: {
            ...(s.messageSearchesByConv[convId] ?? {
              query,
              messages: [],
              hasMore: false,
              nextCursor: '',
            }),
            loading: false,
          },
        },
      }));
      throw error;
    }
  },

  markRead: async (convId, seq) => {
    await ConversationService.markRead({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      lastReadSeq: BigInt(seq),
    });
    set({
      lastReadSeq: { ...get().lastReadSeq, [convId]: seq },
      unreadCounts: { ...get().unreadCounts, [convId]: 0 },
    });
  },

  saveDraft: async (convId, draft) => {
    const rsp = await ConversationService.saveDraft({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      draft,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Save draft failed');
    }
    set((s) => ({
      conversations: s.conversations.map(c =>
        c.conversationId === convId && c.self
          ? { ...c, self: { ...c.self, draft } }
          : c,
      ),
    }));
  },

  setPin: async (convId, pin) => {
    const rsp = await ConversationService.setPin({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      pin,
    });
    if (rsp.header?.success) {
      const convs = get().conversations.map(c =>
        c.conversationId === convId && c.self
          ? { ...c, self: { ...c.self, isPinned: pin } }
          : c,
      );
      set({ conversations: convs });
    }
  },

  setMute: async (convId, mute) => {
    const rsp = await ConversationService.setMute({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      mute,
    });
    if (rsp.header?.success) {
      const convs = get().conversations.map(c =>
        c.conversationId === convId && c.self
          ? { ...c, self: { ...c.self, isMuted: mute } }
          : c,
      );
      set({ conversations: convs });
    }
  },

  setVisible: async (convId, visible) => {
    const rsp = await ConversationService.setVisible({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      visible,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Set conversation visibility failed');
    }
    if (!visible) {
      removeConversationFromState(set, get, convId);
      return;
    }
    set((s) => ({
      conversations: s.conversations.map(c =>
        c.conversationId === convId && c.self
          ? { ...c, self: { ...c.self, isVisible: true } }
          : c,
      ),
    }));
  },

  quitConversation: async (convId) => {
    const rsp = await ConversationService.quit({
      requestId: crypto.randomUUID(),
      conversationId: convId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Quit conversation failed');
    }
    removeConversationFromState(set, get, convId);
  },

  listMembers: async (convId) => {
    const rsp = await ConversationService.listMembers({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      page: { limit: 100, cursor: '' },
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'List conversation members failed');
    }
    set((s) => ({
      membersByConv: {
        ...s.membersByConv,
        [convId]: rsp.members ?? [],
      },
    }));
  },

  updateConversation: async (convId, patch) => {
    const rsp = await ConversationService.update({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      ...patch,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Update conversation failed');
    }
    set((s) => ({
      conversations: s.conversations.map((conversation) => {
        if (conversation.conversationId !== convId) return conversation;
        if (rsp.conversation) return rsp.conversation;
        return {
          ...conversation,
          name: patch.name ?? conversation.name,
          avatarUrl: patch.avatarUrl ?? conversation.avatarUrl,
          description: patch.description ?? conversation.description,
        };
      }),
      conversationSearch: {
        ...s.conversationSearch,
        conversations: s.conversationSearch.conversations.map((conversation) => {
          if (conversation.conversationId !== convId) return conversation;
          if (rsp.conversation) return rsp.conversation;
          return {
            ...conversation,
            name: patch.name ?? conversation.name,
            avatarUrl: patch.avatarUrl ?? conversation.avatarUrl,
            description: patch.description ?? conversation.description,
          };
        }),
      },
    }));
  },

  dismissConversation: async (convId) => {
    const rsp = await ConversationService.dismiss({
      requestId: crypto.randomUUID(),
      conversationId: convId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Dismiss conversation failed');
    }
    removeConversationFromState(set, get, convId);
  },

  addMembers: async (convId, memberIds) => {
    const rsp = await ConversationService.addMembers({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      memberIds,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Add members failed');
    }
  },

  removeMembers: async (convId, memberIds) => {
    const rsp = await ConversationService.removeMembers({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      memberIds,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Remove members failed');
    }
    const removed = new Set(memberIds);
    set((s) => ({
      membersByConv: {
        ...s.membersByConv,
        [convId]: (s.membersByConv[convId] ?? []).filter(member => !removed.has(member.userInfo?.userId ?? '')),
      },
      conversations: s.conversations.map(conversation => (
        conversation.conversationId === convId
          ? { ...conversation, memberCount: Math.max(0, (conversation.memberCount ?? 0) - memberIds.length) }
          : conversation
      )),
    }));
  },

  changeMemberRole: async (convId, targetUserId, role) => {
    const rsp = await ConversationService.changeRole({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      targetUserId,
      role,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Change member role failed');
    }
    set((s) => ({
      membersByConv: {
        ...s.membersByConv,
        [convId]: (s.membersByConv[convId] ?? []).map(member => (
          member.userInfo?.userId === targetUserId ? { ...member, role } : member
        )),
      },
    }));
  },

  transferOwner: async (convId, newOwnerId) => {
    const rsp = await ConversationService.transferOwner({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      newOwnerId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Transfer owner failed');
    }
    set((s) => ({
      membersByConv: {
        ...s.membersByConv,
        [convId]: (s.membersByConv[convId] ?? []).map((member) => {
          if (member.userInfo?.userId === newOwnerId) return { ...member, role: MemberRole.OWNER };
          if (member.role === MemberRole.OWNER) return { ...member, role: MemberRole.MEMBER };
          return member;
        }),
      },
    }));
  },

  listPinnedMessages: async (convId) => {
    set({ pinnedLoading: true });
    try {
      const rsp = await MessageService.listPinned({
        requestId: crypto.randomUUID(),
        conversationId: convId,
      });
      if (!rsp.header?.success) {
        throw new Error(rsp.header?.errorMessage || 'List pinned messages failed');
      }
      set((s) => ({
        pinnedMessagesByConv: {
          ...s.pinnedMessagesByConv,
          [convId]: rsp.messages ?? [],
        },
        pinnedLoading: false,
      }));
    } catch (error) {
      set({ pinnedLoading: false });
      throw error;
    }
  },

  pinMessage: async (convId, messageId) => {
    const rsp = await MessageService.pin({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      messageId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Pin message failed');
    }
    get().handleMessagePinned(convId, messageId, true);
  },

  unpinMessage: async (convId, messageId) => {
    const rsp = await MessageService.unpin({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      messageId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Unpin message failed');
    }
    get().handleMessagePinned(convId, messageId, false);
  },

  deleteMessages: async (convId, messageIds) => {
    const rsp = await MessageService.delete({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      messageIds,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Delete messages failed');
    }
    get().handleMessagesDeleted(convId, messageIds);
  },

  clearConversation: async (convId) => {
    const rsp = await MessageService.clearConversation({
      requestId: crypto.randomUUID(),
      conversationId: convId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Clear conversation failed');
    }
    clearConversationLocal(set, get, convId);
  },

  sendTyping: async (convId, isTyping) => {
    const rsp = await PresenceService.sendTyping({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      isTyping,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Send typing failed');
    }
  },

  recallMessage: async (convId, messageId) => {
    const rsp = await MessageService.recall({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      messageId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Recall message failed');
    }
    get().handleMessageRecalled(convId, messageId);
  },

  addReaction: async (convId, messageId, emoji, userId) => {
    const rsp = await MessageService.addReaction({
      requestId: crypto.randomUUID(),
      messageId,
      emoji,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Add reaction failed');
    }
    set((s) => ({
      messagesByConv: updateMessageReactions(
        s.messagesByConv,
        convId,
        messageId,
        (reactions) => addReactionGroup(reactions, emoji, userId),
      ),
    }));
  },

  removeReaction: async (convId, messageId, emoji, userId) => {
    const rsp = await MessageService.removeReaction({
      requestId: crypto.randomUUID(),
      messageId,
      emoji,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Remove reaction failed');
    }
    set((s) => ({
      messagesByConv: updateMessageReactions(
        s.messagesByConv,
        convId,
        messageId,
        (reactions) => removeReactionGroup(reactions, emoji, userId),
      ),
    }));
  },

  refreshMessageReactions: async (convId, messageId) => {
    const rsp = await MessageService.getReactions({
      requestId: crypto.randomUUID(),
      messageId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Get reactions failed');
    }
    set((s) => ({
      messagesByConv: updateMessageReactions(
        s.messagesByConv,
        convId,
        messageId,
        () => rsp.reactions ?? [],
      ),
      pinnedMessagesByConv: updateMessageReactions(
        s.pinnedMessagesByConv,
        convId,
        messageId,
        () => rsp.reactions ?? [],
      ),
    }));
  },

  updateReadAck: async (convId, seqId) => {
    const rsp = await MessageService.updateReadAck({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      seqId,
    });
    if (!rsp.header?.success) {
      throw new Error(rsp.header?.errorMessage || 'Update read ack failed');
    }
    const nextSeq = Number(seqId);
    set((s) => ({
      lastReadSeq: { ...s.lastReadSeq, [convId]: nextSeq },
      unreadCounts: { ...s.unreadCounts, [convId]: 0 },
      conversations: s.conversations.map((conversation) => (
        conversation.conversationId === convId && conversation.self
          ? {
              ...conversation,
              self: {
                ...conversation.self,
                lastReadSeq: seqId,
                unreadCount: 0n,
              },
            }
          : conversation
      )),
    }));
  },

  handleNewMessage: (msg) => {
    const convId = msg.conversationId;
    if (!convId) return;

    const existing = get().messagesByConv[convId] ?? [];
    if (!existing.find(m => m.messageId === msg.messageId)) {
      set({
        messagesByConv: {
          ...get().messagesByConv,
          [convId]: [...existing, msg],
        },
      });
    }

    // Update lastMessage in conversation list if this is the active one
    const convs = get().conversations;
    const convIndex = convs.findIndex(c => c.conversationId === convId);
    if (convIndex !== -1) {
      const updated = [...convs];
      updated[convIndex] = {
        ...updated[convIndex],
        lastMessage: {
          messageId: msg.messageId,
          senderId: msg.senderId,
          messageType: msg.content?.type ?? 0,
          contentPreview: '',
          sentAtMs: msg.createdAtMs,
          status: msg.status,
        },
      };
      set({ conversations: updated });
    }
  },

  handleMessageRecalled: (convId, messageId) => {
    const msgs = get().messagesByConv[convId] ?? [];
    const updated = msgs.map(m =>
      m.messageId === messageId
        ? { ...m, status: MessageStatus.RECALLED }
        : m,
    );
    set({
      messagesByConv: { ...get().messagesByConv, [convId]: updated },
    });
  },

  handleMessagePinned: (convId, messageId, pinned) => {
    const messages = get().messagesByConv[convId] ?? [];
    const updatedMessages = messages.map((message) => (
      message.messageId === messageId
        ? { ...message, isPinned: pinned }
        : message
    ));
    const targetMessage = updatedMessages.find((message) => message.messageId === messageId);
    const currentPinned = get().pinnedMessagesByConv[convId] ?? [];
    const nextPinned = pinned && targetMessage
      ? upsertPinnedMessage(currentPinned, targetMessage)
      : currentPinned.filter((message) => message.messageId !== messageId);

    set({
      messagesByConv: { ...get().messagesByConv, [convId]: updatedMessages },
      pinnedMessagesByConv: { ...get().pinnedMessagesByConv, [convId]: nextPinned },
    });
  },

  handleMessagesDeleted: (convId, messageIds) => {
    const deletedIds = new Set(messageIds.map((messageId) => messageId.toString()));
    const messages = get().messagesByConv[convId] ?? [];
    const updatedMessages = messages.map((message) => (
      deletedIds.has(message.messageId.toString())
        ? { ...message, status: MessageStatus.DELETED }
        : message
    ));
    const currentPinned = get().pinnedMessagesByConv[convId] ?? [];
    const nextPinned = currentPinned.filter((message) => !deletedIds.has(message.messageId.toString()));

    set({
      messagesByConv: { ...get().messagesByConv, [convId]: updatedMessages },
      pinnedMessagesByConv: { ...get().pinnedMessagesByConv, [convId]: nextPinned },
    });
  },

  handleTyping: (convId, userId, isTyping) => {
    const current = get().typingUsersByConv[convId] ?? [];
    const next = isTyping
      ? [...new Set([...current, userId])]
      : current.filter((id) => id !== userId);

    set({
      typingUsersByConv: {
        ...get().typingUsersByConv,
        [convId]: next,
      },
    });
  },
}));

function clearConversationLocal(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  convId: string,
) {
  const nextMessageSearches = { ...get().messageSearchesByConv };
  delete nextMessageSearches[convId];

  set((s) => ({
    messagesByConv: { ...s.messagesByConv, [convId]: [] },
    pinnedMessagesByConv: { ...s.pinnedMessagesByConv, [convId]: [] },
    messageSearchesByConv: nextMessageSearches,
    unreadCounts: { ...s.unreadCounts, [convId]: 0 },
    conversations: s.conversations.map((conversation) => (
      conversation.conversationId === convId
        ? {
            ...conversation,
            lastMessage: undefined,
            self: conversation.self
              ? {
                  ...conversation.self,
                  unreadCount: 0n,
                }
              : conversation.self,
          }
        : conversation
    )),
  }));
}

function removeConversationFromState(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState,
  convId: string,
) {
  const {
    messagesByConv,
    pinnedMessagesByConv,
    messageSearchesByConv,
    typingUsersByConv,
    membersByConv,
    lastReadSeq,
    unreadCounts,
  } = get();
  const nextMessages = { ...messagesByConv };
  const nextPinned = { ...pinnedMessagesByConv };
  const nextMessageSearches = { ...messageSearchesByConv };
  const nextTyping = { ...typingUsersByConv };
  const nextMembers = { ...membersByConv };
  const nextLastRead = { ...lastReadSeq };
  const nextUnread = { ...unreadCounts };
  delete nextMessages[convId];
  delete nextPinned[convId];
  delete nextMessageSearches[convId];
  delete nextTyping[convId];
  delete nextMembers[convId];
  delete nextLastRead[convId];
  delete nextUnread[convId];

  set((s) => ({
    conversations: s.conversations.filter(c => c.conversationId !== convId),
    activeConversationId: s.activeConversationId === convId ? null : s.activeConversationId,
    messagesByConv: nextMessages,
    pinnedMessagesByConv: nextPinned,
    messageSearchesByConv: nextMessageSearches,
    typingUsersByConv: nextTyping,
    membersByConv: nextMembers,
    lastReadSeq: nextLastRead,
    unreadCounts: nextUnread,
    conversationSearch: {
      ...s.conversationSearch,
      conversations: s.conversationSearch.conversations.filter(c => c.conversationId !== convId),
    },
  }));
}

function upsertPinnedMessage(messages: Message[], message: Message): Message[] {
  const pinnedMessage = { ...message, isPinned: true };
  const existing = messages.filter((item) => item.messageId !== message.messageId);
  return [pinnedMessage, ...existing].sort((a, b) => {
    if (a.createdAtMs > b.createdAtMs) return -1;
    if (a.createdAtMs < b.createdAtMs) return 1;
    return 0;
  });
}

function updateMessageReactions(
  messagesByConv: Record<string, Message[]>,
  convId: string,
  messageId: bigint,
  update: (reactions: ReactionGroup[]) => ReactionGroup[],
): Record<string, Message[]> {
  const messages = messagesByConv[convId] ?? [];

  return {
    ...messagesByConv,
    [convId]: messages.map((message) => (
      message.messageId === messageId
        ? { ...message, reactions: update(message.reactions) }
        : message
    )),
  };
}

function addReactionGroup(reactions: ReactionGroup[], emoji: string, userId: string | null): ReactionGroup[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);
  if (!existing) {
    return [{
      emoji,
      count: 1,
      recentUserIds: userId ? [userId] : [],
      selfReacted: true,
    }, ...reactions];
  }

  return reactions.map((reaction) => {
    if (reaction.emoji !== emoji) return reaction;
    if (reaction.selfReacted) return reaction;

    return {
      ...reaction,
      count: reaction.count + 1,
      recentUserIds: addUserId(reaction.recentUserIds, userId),
      selfReacted: true,
    };
  });
}

function removeReactionGroup(reactions: ReactionGroup[], emoji: string, userId: string | null): ReactionGroup[] {
  return reactions
    .map((reaction) => {
      if (reaction.emoji !== emoji) return reaction;
      if (!reaction.selfReacted) return reaction;

      return {
        ...reaction,
        count: Math.max(0, reaction.count - 1),
        recentUserIds: removeUserId(reaction.recentUserIds, userId),
        selfReacted: false,
      };
    })
    .filter((reaction) => reaction.count > 0);
}

function addUserId(userIds: string[], userId: string | null): string[] {
  if (!userId) return userIds;
  return [...new Set([...userIds, userId])];
}

function removeUserId(userIds: string[], userId: string | null): string[] {
  if (!userId) return userIds;
  return userIds.filter((id) => id !== userId);
}
