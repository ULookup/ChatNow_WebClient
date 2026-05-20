import type { Message } from '@/proto/message/message_types';

export type MessageTimelineRow =
  | { type: 'day'; id: string; label: string }
  | { type: 'unread'; id: string; count: number }
  | { type: 'message'; id: string; message: Message }
  | { type: 'typing'; id: string; label: string };

interface TimelineOptions {
  lastReadSeq?: number;
  typingLabel?: string;
}

export function buildMessageTimeline(
  messages: Message[],
  { lastReadSeq, typingLabel }: TimelineOptions = {},
): MessageTimelineRow[] {
  const rows: MessageTimelineRow[] = [];
  let lastDay = '';
  let unreadInserted = false;
  const unreadCount = lastReadSeq === undefined
    ? 0
    : messages.filter((message) => Number(message.seqId) > lastReadSeq).length;

  for (const message of messages) {
    const day = formatMessageDay(message.createdAtMs);
    if (day !== lastDay) {
      rows.push({ type: 'day', id: `day-${day}`, label: day });
      lastDay = day;
    }

    if (!unreadInserted && unreadCount > 0 && Number(message.seqId) > (lastReadSeq ?? 0)) {
      rows.push({ type: 'unread', id: `unread-${message.seqId.toString()}`, count: unreadCount });
      unreadInserted = true;
    }

    rows.push({
      type: 'message',
      id: `message-${message.messageId.toString()}-${message.clientMsgId}`,
      message,
    });
  }

  if (typingLabel) {
    rows.push({ type: 'typing', id: 'typing-indicator', label: typingLabel });
  }

  return rows;
}

function formatMessageDay(createdAtMs: bigint): string {
  return new Date(Number(createdAtMs)).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}
