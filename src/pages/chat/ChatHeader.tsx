import type { Conversation } from '@/proto/conversation/conversation_service';
import { Avatar } from '@/components/Avatar/Avatar';
import { Icon, IconButton } from '@/components/Icon/Icon';
import { useUIStore } from '@/stores/uiStore';
import styles from './ChatHeader.module.css';

interface Props {
  conv: Conversation;
  searchActive?: boolean;
  onToggleSearch?: () => void;
}

export function ChatHeader({ conv, searchActive = false, onToggleSearch }: Props) {
  const openRightPanel = useUIStore(s => s.openRightPanel);
  const memberLabel = conv.memberCount > 0 ? `${conv.memberCount} 位成员` : '私密会话';

  return (
    <div className={styles.header}>
      <Avatar name={conv.name ?? '?'} url={conv.avatarUrl || undefined} size={32} />
      <div className={styles.identity}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{conv.name || '未命名'}</span>
          {conv.self?.isPinned && <Icon name="pin" size={13} className={styles.metaIcon} />}
          {conv.self?.isMuted && <Icon name="bell-off" size={13} className={styles.metaIcon} />}
        </div>
        <div className={styles.meta}>{memberLabel}</div>
      </div>
      <div className={styles.actions}>
        <IconButton
          icon="search"
          label="搜索消息"
          active={searchActive}
          className={styles.actionBtn}
          onClick={onToggleSearch}
        />
        <IconButton
          icon="panel-right"
          label="查看会话详情"
          className={styles.actionBtn}
          onClick={() => openRightPanel(conv.memberCount > 2 ? 'group_info' : 'user_profile')}
        />
      </div>
    </div>
  );
}
