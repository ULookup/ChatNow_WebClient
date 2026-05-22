import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Conversation } from '@/proto/conversation/conversation_service';
import { MemberRole } from '@/proto/conversation/conversation_service';
import type { Message } from '@/proto/message/message_types';
import { useUIStore, type RightPanelType } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { Icon, IconButton } from '@/components/Icon/Icon';
import { Avatar } from '@/components/Avatar/Avatar';
import { getMessageTextPreview } from '@/pages/chat/messageComposer';
import { formatMessageClock, getMessageSenderLabel } from '@/pages/chat/messagePresentation';
import { UserProfile } from './UserProfile';
import { MemberList } from './MemberList';
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
      {panelType === 'group_info' && <ConversationSummary conv={conv} />}
      {panelType === 'user_profile' && <UserProfile />}
      {panelType === 'pinned_messages' && <PinnedMessages />}
    </div>
  );
}

function ConversationSummary({ conv }: { conv: Conversation }) {
  const convId = conv.conversationId;
  const convName = conv.name || '未命名群组';
  const memberCount = conv.memberCount;
  const [name, setName] = useState(conv.name || '');
  const [description, setDescription] = useState(conv.description || '');
  const [announcement, setAnnouncement] = useState('');
  const isOwner = conv.self?.role === MemberRole.OWNER;
  const updateConversation = useChatStore(s => s.updateConversation);
  const dismissConversation = useChatStore(s => s.dismissConversation);
  const quitConversation = useChatStore(s => s.quitConversation);
  const closeRightPanel = useUIStore(s => s.closeRightPanel);
  const addToast = useUIStore(s => s.addToast);
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  useEffect(() => {
    setName(conv.name || '');
    setDescription(conv.description || '');
    setAnnouncement('');
  }, [conv.conversationId, conv.description, conv.name]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const patch = {
      name: name.trim(),
      description: description.trim(),
      announcement: announcement.trim(),
    };
    if (isPreview) {
      useChatStore.setState((state) => ({
        conversations: state.conversations.map(item => (
          item.conversationId === convId
            ? { ...item, name: patch.name, description: patch.description }
            : item
        )),
      }));
      addToast('群资料已更新', 'success');
      return;
    }
    updateConversation(convId, patch)
      .then(() => addToast('群资料已更新', 'success'))
      .catch(() => addToast('群资料更新失败，请重试', 'error'));
  };

  const handleQuit = () => {
    if (isPreview) {
      removePreviewConversation(convId);
      closeRightPanel();
      return;
    }
    quitConversation(convId)
      .then(() => {
        closeRightPanel();
        addToast('已退出群聊', 'success');
      })
      .catch(() => addToast('退出群聊失败，请重试', 'error'));
  };
  const handleDismiss = () => {
    if (isPreview) {
      removePreviewConversation(convId);
      closeRightPanel();
      addToast('已解散群聊', 'success');
      return;
    }
    dismissConversation(convId)
      .then(() => {
        closeRightPanel();
        addToast('已解散群聊', 'success');
      })
      .catch(() => addToast('解散群聊失败，请重试', 'error'));
  };

  return (
    <div className={styles.summary}>
      <Avatar name={convName} size={58} />
      <div className={styles.summaryName}>{convName}</div>
      <div className={styles.summaryMeta}>{memberCount || 2} 位成员 · 正常同步</div>
      <form className={styles.profileForm} onSubmit={handleSave}>
        <label className={styles.fieldLabel}>
          <span>群名称</span>
          <input
            aria-label="群名称"
            className={styles.textField}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!isOwner}
          />
        </label>
        <label className={styles.fieldLabel}>
          <span>群描述</span>
          <textarea
            aria-label="群描述"
            className={styles.textArea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!isOwner}
            rows={2}
          />
        </label>
        <label className={styles.fieldLabel}>
          <span>群公告</span>
          <textarea
            aria-label="群公告"
            className={styles.textArea}
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
            disabled={!isOwner}
            rows={2}
          />
        </label>
        {isOwner && (
          <button className={styles.saveAction} type="submit">
            <Icon name="save" size={16} />
            <span>保存群资料</span>
          </button>
        )}
      </form>
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
        <MemberList convId={convId} canManage={isOwner} />
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
      {isOwner ? (
        <button className={styles.dangerAction} type="button" onClick={handleDismiss}>
          <Icon name="trash" size={16} />
          <span>解散群聊</span>
        </button>
      ) : (
        <button className={styles.dangerAction} type="button" onClick={handleQuit}>
          <Icon name="log-out" size={16} />
          <span>退出群聊</span>
        </button>
      )}
    </div>
  );
}

function removePreviewConversation(convId: string) {
  useChatStore.setState((state) => {
    const nextMembersByConv = { ...state.membersByConv };
    delete nextMembersByConv[convId];
    return {
      conversations: state.conversations.filter(item => item.conversationId !== convId),
      activeConversationId: state.activeConversationId === convId ? null : state.activeConversationId,
      membersByConv: nextMembersByConv,
    };
  });
}

function PinnedMessages() {
  const activeId = useChatStore(s => s.activeConversationId);
  const pinnedMessagesByConv = useChatStore(s => s.pinnedMessagesByConv);
  const messagesByConv = useChatStore(s => s.messagesByConv);
  const listPinnedMessages = useChatStore(s => s.listPinnedMessages);
  const unpinMessage = useChatStore(s => s.unpinMessage);
  const handleMessagePinned = useChatStore(s => s.handleMessagePinned);
  const addToast = useUIStore(s => s.addToast);
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const cachedPinned = activeId ? pinnedMessagesByConv[activeId] : undefined;
  const visibleMessages = activeId ? messagesByConv[activeId] ?? [] : [];
  const pinnedMessages = cachedPinned ?? visibleMessages.filter((message) => message.isPinned);

  useEffect(() => {
    if (!activeId || isPreview) return;
    listPinnedMessages(activeId).catch(() => {
      addToast('置顶消息加载失败', 'error');
    });
  }, [activeId, addToast, isPreview, listPinnedMessages]);

  const handleUnpin = async (message: Message) => {
    handleMessagePinned(message.conversationId, message.messageId, false);
    if (isPreview) return;

    try {
      await unpinMessage(message.conversationId, message.messageId);
      addToast('已取消置顶', 'success');
    } catch {
      handleMessagePinned(message.conversationId, message.messageId, true);
      addToast('取消置顶失败，请重试', 'error');
    }
  };

  if (pinnedMessages.length > 0) {
    return (
      <div className={styles.pinnedList}>
        {pinnedMessages.map((message) => (
          <article className={styles.pinnedItem} key={message.messageId.toString()}>
            <div className={styles.pinnedIcon}>
              <Icon name="pin" size={14} />
            </div>
            <div className={styles.pinnedBody}>
              <div className={styles.pinnedMeta}>
                <span>{getMessageSenderLabel(message.senderId)}</span>
                <time>{formatMessageClock(message.createdAtMs)}</time>
              </div>
              <p>{getMessageTextPreview(message)}</p>
            </div>
            <IconButton
              icon="x"
              label="取消置顶消息"
              className={styles.pinnedRemove}
              onClick={() => handleUnpin(message)}
            />
          </article>
        ))}
      </div>
    );
  }

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
