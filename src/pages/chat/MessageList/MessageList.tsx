import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

export function MessageList() {
  const activeId = useChatStore((s) => s.activeConversationId);
  const messages = useChatStore((s) =>
    activeId ? (s.messagesByConv[activeId] ?? []) : [],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

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

  return (
    <div ref={parentRef} className={styles.list}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((vItem) => {
          const msg = messages[vItem.index];
          if (!msg) return null;
          return (
            <div
              key={msg.messageId?.toString() ?? vItem.key}
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
              <MessageBubble message={msg} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
