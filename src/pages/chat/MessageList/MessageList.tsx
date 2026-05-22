import { useMemo, useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Message } from '@/proto/message/message_types';
import { useChatStore } from '@/stores/chatStore';
import { IconButton } from '@/components/Icon/Icon';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { buildMessageTimeline, type MessageTimelineRow } from '../messageTimeline';
import { getMessageSearchResults } from '../messageSearch';
import { getMessageSenderLabel } from '../messagePresentation';
import styles from './MessageList.module.css';

interface MessageListProps {
  searchQuery?: string;
  searchMessages?: Message[];
}

export function MessageList({ searchQuery = '', searchMessages }: MessageListProps) {
  const activeId = useChatStore((s) => s.activeConversationId);
  const lastReadSeq = useChatStore((s) =>
    activeId ? s.lastReadSeq[activeId] : undefined,
  );
  const messages = useChatStore((s) =>
    activeId ? (s.messagesByConv[activeId] ?? []) : [],
  );
  const typingUsersByConv = useChatStore((s) => s.typingUsersByConv);
  const updateReadAck = useChatStore((s) => s.updateReadAck);
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  const parentRef = useRef<HTMLDivElement>(null);
  const [isAwayFromBottom, setIsAwayFromBottom] = useState(false);
  const typingUserIds = activeId ? typingUsersByConv[activeId] ?? [] : [];
  const typingLabel = getTypingLabel(activeId, typingUserIds);
  const searchResults = useMemo(
    () => getMessageSearchResults(messages, searchQuery),
    [messages, searchQuery],
  );
  const visibleMessages = searchResults.query ? searchMessages ?? searchResults.matches : messages;
  const maxVisibleSeq = useMemo(
    () => visibleMessages.reduce((max, message) => (
      message.seqId && message.seqId > max ? message.seqId : max
    ), 0n),
    [visibleMessages],
  );
  const rows = useMemo(
    () => buildMessageTimeline(visibleMessages, {
      lastReadSeq: searchResults.query ? undefined : lastReadSeq,
      typingLabel: searchResults.query ? undefined : typingLabel,
    }),
    [lastReadSeq, searchResults.query, typingLabel, visibleMessages],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => estimateRowSize(rows[index]),
    overscan: 5,
  });

  useEffect(() => {
    if (rows.length > 0) {
      virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  useEffect(() => {
    if (!activeId || isPreview || searchResults.query || maxVisibleSeq <= BigInt(lastReadSeq ?? 0)) return;
    updateReadAck(activeId, maxVisibleSeq).catch(() => {
      // Read receipts should never interrupt message reading.
    });
  }, [activeId, isPreview, lastReadSeq, maxVisibleSeq, searchResults.query, updateReadAck]);

  const handleScroll = () => {
    const el = parentRef.current;
    if (!el) return;
    setIsAwayFromBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 160);
  };

  const scrollToBottom = () => {
    if (rows.length > 0) {
      virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
      setIsAwayFromBottom(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div
        ref={parentRef}
        className={styles.list}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        暂无消息，发送第一条消息吧
      </div>
    );
  }

  if (searchResults.query && searchResults.count === 0) {
    return (
      <div className={styles.emptySearch}>
        <strong>没有找到相关消息</strong>
        <span>换个关键词试试</span>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div ref={parentRef} className={styles.list} onScroll={handleScroll}>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((vItem) => {
            const row = rows[vItem.index];
            if (!row) return null;
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vItem.start}px)`,
                }}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
              >
                <TimelineRow row={row} searchQuery={searchResults.query} />
              </div>
            );
          })}
        </div>
      </div>
      {isAwayFromBottom && (
        <IconButton
          icon="arrow-down"
          label="回到底部"
          className={styles.scrollBottom}
          onClick={scrollToBottom}
        />
      )}
    </div>
  );
}

export function getTypingLabel(activeId: string | null, typingUserIds: string[]): string | undefined {
  if (typingUserIds.length > 0) {
    if (typingUserIds.length === 1) return `${getMessageSenderLabel(typingUserIds[0])} 正在输入`;
    return `${typingUserIds.slice(0, 2).map(getMessageSenderLabel).join('、')} 等正在输入`;
  }
  return activeId?.startsWith('preview-') ? 'Designer 正在输入' : undefined;
}

function TimelineRow({ row, searchQuery }: { row: MessageTimelineRow; searchQuery: string }) {
  switch (row.type) {
    case 'day':
      return <div className={styles.dayDivider}>{row.label}</div>;
    case 'unread':
      return <div className={styles.unreadDivider}>{row.count} 条新消息</div>;
    case 'typing':
      return (
        <div className={styles.typingRow}>
          <span>{row.label}</span>
          <i />
          <i />
          <i />
        </div>
      );
    case 'message':
      return <MessageBubble message={row.message} searchQuery={searchQuery} />;
  }
}

function estimateRowSize(row: MessageTimelineRow | undefined): number {
  if (!row) return 60;
  if (row.type === 'day' || row.type === 'unread') return 38;
  if (row.type === 'typing') return 44;
  return 72;
}
