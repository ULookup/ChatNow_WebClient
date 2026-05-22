import { describe, expect, it } from 'vitest';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';
import { buildMessageTimeline } from './messageTimeline';

function createMessage(messageId: bigint, seqId: bigint, text: string, createdAtMs: bigint): Message {
  return {
    messageId,
    conversationId: 'conversation-1',
    senderId: 'user-1',
    createdAtMs,
    editedAtMs: 0n,
    seqId,
    userSeq: seqId,
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

describe('buildMessageTimeline', () => {
  it('adds day dividers, unread divider, messages, and typing row in order', () => {
    const rows = buildMessageTimeline(
      [
        createMessage(1n, 1n, '昨天的消息', BigInt(new Date(2024, 4, 17, 10).getTime())),
        createMessage(2n, 2n, '第一条未读', BigInt(new Date(2024, 4, 18, 10).getTime())),
        createMessage(3n, 3n, '第二条未读', BigInt(new Date(2024, 4, 18, 11).getTime())),
      ],
      {
        lastReadSeq: 1,
        typingLabel: 'Designer 正在输入',
      },
    );

    expect(rows.map((row) => row.type)).toEqual([
      'day',
      'message',
      'day',
      'unread',
      'message',
      'message',
      'typing',
    ]);
    expect(rows[0]).toMatchObject({ type: 'day', label: '2024/5/17' });
    expect(rows[2]).toMatchObject({ type: 'day', label: '2024/5/18' });
    expect(rows[3]).toMatchObject({ type: 'unread', count: 2 });
    expect(rows[6]).toMatchObject({ type: 'typing', label: 'Designer 正在输入' });
  });
});
