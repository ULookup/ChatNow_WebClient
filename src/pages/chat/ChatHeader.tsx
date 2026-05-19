import type { Conversation } from '@/proto/conversation/conversation_service';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ChatHeader.module.css';

interface Props { conv: Conversation; }

export function ChatHeader({ conv }: Props) {
  return (
    <div className={styles.header}>
      <Avatar name={conv.name ?? '?'} url={conv.avatarUrl || undefined} size={32} />
      <div className={styles.name}>{conv.name || '未命名'}</div>
      <div className={styles.actions}>
        <button className={styles.actionBtn}>🔍</button>
        <button className={styles.actionBtn}>📌</button>
      </div>
    </div>
  );
}
