import type { Conversation } from '@/proto/conversation/conversation_service';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ConversationItem.module.css';

interface Props { conv: Conversation; }

export function ConversationItem({ conv }: Props) {
  const activeId = useChatStore(s => s.activeConversationId);
  const openConversation = useChatStore(s => s.openConversation);
  const isActive = conv.conversationId === activeId;
  const unread = Number(conv.self?.unreadCount ?? 0);
  const isMuted = conv.self?.isMuted;

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => conv.conversationId && openConversation(conv.conversationId)}
    >
      <Avatar name={conv.name ?? '?'} url={conv.avatarUrl || undefined} />
      <div className={styles.info}>
        <div className={styles.name}>
          {conv.name || '未命名会话'}
          {isMuted && <span className={styles.muted}>🔇</span>}
        </div>
        {conv.lastMessage && (
          <div className={styles.preview}>
            {conv.lastMessage.contentPreview || '[消息]'}
          </div>
        )}
      </div>
      <div className={styles.meta}>
        {conv.lastMessage && (
          <span className={styles.time}>{formatTime(Number(conv.lastMessage.sentAtMs))}</span>
        )}
        {unread > 0 && !isMuted && (
          <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 1) return '昨天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
