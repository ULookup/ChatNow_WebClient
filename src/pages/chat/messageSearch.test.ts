import { describe, expect, it } from 'vitest';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';
import { getMessageSearchResults } from './messageSearch';

function createMessage(messageId: bigint, text: string): Message {
  return {
    messageId,
    conversationId: 'conversation-1',
    senderId: 'user-1',
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

describe('getMessageSearchResults', () => {
  it('matches text messages case-insensitively and trims the query', () => {
    const messages = [
      createMessage(1n, '按钮 hover 已经完成'),
      createMessage(2n, '发送状态也要更清楚'),
      createMessage(3n, 'Hover 光扫继续微调'),
    ];

    const results = getMessageSearchResults(messages, ' hover ');

    expect(results.matches.map((message) => message.messageId)).toEqual([1n, 3n]);
    expect(results.count).toBe(2);
  });

  it('returns all messages when the query is empty', () => {
    const messages = [createMessage(1n, '任意消息')];

    expect(getMessageSearchResults(messages, '').matches).toEqual(messages);
    expect(getMessageSearchResults(messages, '').count).toBe(0);
  });
});
