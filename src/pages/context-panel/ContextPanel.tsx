import { useUIStore, type RightPanelType } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { GroupInfo } from './GroupInfo';
import { UserProfile } from './UserProfile';
import styles from './ContextPanel.module.css';

export function ContextPanel() {
  const panelType = useUIStore(s => s.rightPanelType);
  const closeRightPanel = useUIStore(s => s.closeRightPanel);
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));

  if (!panelType || !conv) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{getTitle(panelType)}</span>
        <button className={styles.close} onClick={closeRightPanel}>✕</button>
      </div>
      {panelType === 'group_info' && <GroupInfo conv={conv} />}
      {panelType === 'user_profile' && <UserProfile />}
      {panelType === 'pinned_messages' && <div className={styles.placeholder}>置顶消息列表</div>}
    </div>
  );
}

function getTitle(type: RightPanelType): string {
  switch (type) {
    case 'group_info': return '群组信息';
    case 'user_profile': return '用户资料';
    case 'pinned_messages': return '置顶消息';
    default: return '';
  }
}
