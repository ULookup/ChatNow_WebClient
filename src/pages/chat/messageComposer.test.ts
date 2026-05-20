import { describe, expect, it } from 'vitest';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';
import { createLocalTextMessage, getMessageTextPreview } from './messageComposer';

const textMessage: Message = {
  messageId: 10n,
  conversationId: 'conv-1',
  senderId: 'u-1',
  createdAtMs: 1n,
  editedAtMs: 0n,
  seqId: 1n,
  userSeq: 1n,
  clientMsgId: 'client-1',
  status: MessageStatus.NORMAL,
  mentionedUserIds: [],
  reactions: [],
  isPinned: false,
  content: {
    type: MessageType.TEXT,
    body: { oneofKind: 'text', text: { text: '这是一条很长很长的消息，用来测试回复预览会被截断' } },
  },
};

describe('messageComposer', () => {
  it('extracts a compact preview from text messages', () => {
    expect(getMessageTextPreview(textMessage, 12)).toBe('这是一条很长很长的消息...');
  });

  it('uses a generic preview for non-text messages', () => {
    const imageMessage: Message = {
      ...textMessage,
      content: {
        type: MessageType.IMAGE,
        body: {
          oneofKind: 'image',
          image: { fileId: 'file-1', width: 100, height: 80, thumbnailUrl: '' },
        },
      },
    };

    expect(getMessageTextPreview(imageMessage)).toBe('[图片]');
  });

  it('creates local text messages with reply references', () => {
    const localMessage = createLocalTextMessage({
      conversationId: 'conv-1',
      senderId: 'u-me',
      text: '收到，我来处理',
      replyTo: {
        messageId: 10n,
        senderId: 'u-1',
        preview: '这是一条消息',
      },
    });

    expect(localMessage.conversationId).toBe('conv-1');
    expect(localMessage.senderId).toBe('u-me');
    expect(localMessage.replyTo?.contentPreview).toBe('这是一条消息');
    expect(localMessage.clientMsgId.startsWith('local-pending')).toBe(true);
  });
});
