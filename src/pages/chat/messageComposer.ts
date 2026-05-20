import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

interface LocalTextMessageInput {
  conversationId: string;
  senderId: string;
  text: string;
  replyTo?: {
    messageId: bigint;
    senderId: string;
    preview: string;
  } | null;
}

export function getMessageTextPreview(message: Message, maxLength = 32): string {
  const body = message.content?.body;
  let preview = '[消息]';

  if (body?.oneofKind === 'text') preview = body.text.text;
  if (body?.oneofKind === 'image') preview = '[图片]';
  if (body?.oneofKind === 'file') preview = `[文件] ${body.file.fileName}`;
  if (body?.oneofKind === 'audio') preview = '[语音]';
  if (body?.oneofKind === 'video') preview = '[视频]';
  if (body?.oneofKind === 'location') preview = `[位置] ${body.location.name || body.location.address}`;
  if (body?.oneofKind === 'sticker') preview = '[贴纸]';
  if (body?.oneofKind === 'notice') preview = body.notice.text || '[系统通知]';

  const normalized = preview.trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).replace(/[，。！？、,.!?;；:：\s]+$/u, '')}...`;
}

export function createLocalTextMessage({ conversationId, senderId, text, replyTo }: LocalTextMessageInput): Message {
  const now = BigInt(Date.now());
  const localId = now * 1000n;

  return {
    messageId: localId,
    conversationId,
    senderId,
    createdAtMs: now,
    editedAtMs: 0n,
    seqId: localId,
    userSeq: localId,
    clientMsgId: `local-pending-${localId.toString()}`,
    status: MessageStatus.NORMAL,
    mentionedUserIds: [],
    reactions: [],
    isPinned: false,
    replyTo: replyTo
      ? {
          repliedMessageId: replyTo.messageId,
          repliedSenderId: replyTo.senderId,
          repliedMessageType: MessageType.TEXT,
          contentPreview: replyTo.preview,
          isRecalled: false,
        }
      : undefined,
    content: {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text } },
    },
  };
}
