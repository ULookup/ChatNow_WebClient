import { create } from 'zustand';
import type { Conversation } from '@/proto/conversation/conversation_service';
import type { Message, MessageContent, ReplyRef } from '@/proto/message/message_types';
import { MessageStatus } from '@/proto/message/message_types';
import { ConversationService } from '@/services/conversation';
import { TransmiteService } from '@/services/transmite';
import { MessageService } from '@/services/message';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConv: Record<string, Message[]>;
  lastReadSeq: Record<string, number>;
  unreadCounts: Record<string, number>;
  loading: boolean;

  loadConversations: () => Promise<void>;
  openConversation: (convId: string) => Promise<void>;
  sendMessage: (convId: string, content: MessageContent, replyTo?: ReplyRef) => Promise<void>;
  loadHistory: (convId: string, beforeSeq: number) => Promise<void>;
  syncMessages: (convId: string, afterSeq: number) => Promise<void>;
  markRead: (convId: string, seq: number) => Promise<void>;
  saveDraft: (convId: string, draft: string) => Promise<void>;
  setPin: (convId: string, pin: boolean) => Promise<void>;
  setMute: (convId: string, mute: boolean) => Promise<void>;

  // WS handlers (called from ws-client later)
  handleNewMessage: (msg: Message) => void;
  handleMessageRecalled: (convId: string, messageId: bigint) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConv: {},
  lastReadSeq: {},
  unreadCounts: {},
  loading: false,

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
    await ConversationService.saveDraft({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      draft,
    });
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
}));
