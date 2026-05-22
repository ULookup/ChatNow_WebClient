import type { KeyboardEvent } from 'react';
import type { Conversation } from '@/proto/conversation/conversation_service';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { Icon, IconButton } from '@/components/Icon/Icon';
import styles from './ConversationItem.module.css';

interface Props { conv: Conversation; }

export function ConversationItem({ conv }: Props) {
  const activeId = useChatStore(s => s.activeConversationId);
  const openConversation = useChatStore(s => s.openConversation);
  const setPin = useChatStore(s => s.setPin);
  const setMute = useChatStore(s => s.setMute);
  const setVisible = useChatStore(s => s.setVisible);
  const openRightPanel = useUIStore(s => s.openRightPanel);
  const addToast = useUIStore(s => s.addToast);
  const isActive = conv.conversationId === activeId;
  const unread = Number(conv.self?.unreadCount ?? 0);
  const isMuted = conv.self?.isMuted;
  const isPinned = conv.self?.isPinned;
  const draft = conv.self?.draft?.trim();
  const preview = draft || conv.lastMessage?.contentPreview || '[消息]';
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const handleOpen = () => {
    if (conv.conversationId) openConversation(conv.conversationId);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`打开会话 ${conv.name || '未命名会话'}`}
    >
      <Avatar name={conv.name ?? '?'} url={conv.avatarUrl || undefined} />
      <div className={styles.info}>
        <div className={styles.name}>
          <span className={styles.nameText}>{conv.name || '未命名会话'}</span>
          <span className={styles.stateIcons}>
            {isPinned && <Icon name="pin" size={12} className={styles.stateIcon} />}
            {isMuted && <Icon name="bell-off" size={12} className={styles.stateIcon} />}
          </span>
        </div>
        <div className={styles.preview}>
          {draft && <span className={styles.draft}>草稿</span>}
          {preview}
        </div>
      </div>
      <div className={styles.meta}>
        {conv.lastMessage && (
          <span className={styles.time}>{formatTime(Number(conv.lastMessage.sentAtMs))}</span>
        )}
        {unread > 0 && (
          <span className={`${styles.badge} ${isMuted ? styles.badgeMuted : ''}`}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
        <span className={styles.quickActions} onClick={(event) => event.stopPropagation()}>
          <IconButton
            icon="pin"
            label={isPinned ? '取消置顶会话' : '置顶会话'}
            active={isPinned}
            className={styles.quickBtn}
            onClick={() => conv.conversationId && setPin(conv.conversationId, !isPinned)}
          />
          <IconButton
            icon="bell-off"
            label={isMuted ? '取消免打扰' : '设为免打扰'}
            active={isMuted}
            className={styles.quickBtn}
            onClick={() => conv.conversationId && setMute(conv.conversationId, !isMuted)}
          />
          <IconButton
            icon="eye-off"
            label="隐藏会话"
            className={styles.quickBtn}
            onClick={() => {
              if (!conv.conversationId) return;
              if (isPreview) {
                useChatStore.setState((state) => ({
                  conversations: state.conversations.filter(item => item.conversationId !== conv.conversationId),
                  activeConversationId: state.activeConversationId === conv.conversationId ? null : state.activeConversationId,
                }));
                return;
              }
              setVisible(conv.conversationId, false).catch(() => addToast('隐藏会话失败，请重试', 'error'));
            }}
          />
          <IconButton
            icon="panel-right"
            label="查看会话详情"
            className={styles.quickBtn}
            onClick={() => openRightPanel(conv.memberCount > 2 ? 'group_info' : 'user_profile')}
          />
        </span>
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
