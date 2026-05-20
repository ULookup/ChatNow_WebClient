import { useUIStore, type RightPanelType } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { Icon, IconButton } from '@/components/Icon/Icon';
import { Avatar } from '@/components/Avatar/Avatar';
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
        <IconButton icon="x" label="关闭详情面板" className={styles.close} onClick={closeRightPanel} />
      </div>
      {panelType === 'group_info' && <ConversationSummary convName={conv.name || '未命名群组'} memberCount={conv.memberCount} />}
      {panelType === 'user_profile' && <UserProfile />}
      {panelType === 'pinned_messages' && <PinnedMessages />}
    </div>
  );
}

function ConversationSummary({ convName, memberCount }: { convName: string; memberCount: number }) {
  return (
    <div className={styles.summary}>
      <Avatar name={convName} size={58} />
      <div className={styles.summaryName}>{convName}</div>
      <div className={styles.summaryMeta}>{memberCount || 2} 位成员 · 正常同步</div>
      <div className={styles.quickGrid}>
        <button className={styles.quickCard} type="button">
          <Icon name="pin" size={16} />
          <span>置顶</span>
        </button>
        <button className={styles.quickCard} type="button">
          <Icon name="file-stack" size={16} />
          <span>文件</span>
        </button>
        <button className={styles.quickCard} type="button">
          <Icon name="search" size={16} />
          <span>搜索</span>
        </button>
      </div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>成员</div>
        <div className={styles.memberRow}>
          <Avatar name="Preview" size={28} />
          <span>Preview</span>
          <strong>我</strong>
        </div>
        <div className={styles.memberRow}>
          <Avatar name="Designer" size={28} />
          <span>Designer</span>
        </div>
        <div className={styles.memberRow}>
          <Avatar name="PM" size={28} />
          <span>PM</span>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>最近文件</div>
        <div className={styles.fileRow}>
          <Icon name="file-stack" size={16} />
          <span>interaction-notes.md</span>
        </div>
        <div className={styles.fileRow}>
          <Icon name="file-stack" size={16} />
          <span>liquid-console.png</span>
        </div>
      </section>
    </div>
  );
}

function PinnedMessages() {
  return (
    <div className={styles.placeholder}>
      还没有置顶消息
    </div>
  );
}

function getTitle(type: RightPanelType): string {
  switch (type) {
    case 'group_info': return '会话详情';
    case 'user_profile': return '用户资料';
    case 'pinned_messages': return '置顶消息';
    default: return '';
  }
}
