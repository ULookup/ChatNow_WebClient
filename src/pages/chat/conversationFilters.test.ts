import { describe, expect, it } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType } from '@/proto/message/message_types';
import { filterConversations } from './conversationFilters';

const baseConversation: Conversation = {
  conversationId: 'conv-1',
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
    contentPreview: '按钮动效已经加好了',
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
    draft: '回复设计反馈',
  },
};

describe('filterConversations', () => {
  it('returns all conversations for an empty query', () => {
    expect(filterConversations([baseConversation], '')).toHaveLength(1);
  });

  it('matches conversation name, draft, and last message preview', () => {
    expect(filterConversations([baseConversation], '产品')).toHaveLength(1);
    expect(filterConversations([baseConversation], '设计反馈')).toHaveLength(1);
    expect(filterConversations([baseConversation], '动效')).toHaveLength(1);
  });

  it('returns no conversations when query does not match searchable fields', () => {
    expect(filterConversations([baseConversation], '财务')).toHaveLength(0);
  });
});
