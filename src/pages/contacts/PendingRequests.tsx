import { useState } from 'react';
import { useContactStore } from '@/stores/contactStore';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import styles from './ContactsPage.module.css';

export function PendingRequests() {
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [errorEventId, setErrorEventId] = useState<string | null>(null);
  const pendingRequests = useContactStore((s) => s.pendingRequests);
  const handleFriendRequest = useContactStore((s) => s.handleFriendRequest);
  const openConversation = useChatStore((s) => s.openConversation);
  const switchModule = useUIStore((s) => s.switchModule);

  const handleRequest = async (eventId: string, agree: boolean, applyUserId: string) => {
    setBusyEventId(eventId);
    setErrorEventId(null);
    try {
      const newConversationId = await handleFriendRequest(eventId, agree, applyUserId);
      if (agree && newConversationId) {
        switchModule('chat');
        await openConversation(newConversationId);
      }
    } catch {
      setErrorEventId(eventId);
    } finally {
      setBusyEventId(null);
    }
  };

  return (
    <div className={styles.requests}>
      <div className={styles.requestsHeader}>
        <div>
          <div className={styles.kicker}>Relationships</div>
          <h2 className={styles.contentTitle}>待处理的好友申请</h2>
        </div>
      </div>
      {pendingRequests.length === 0 ? (
        <div className={styles.emptyState}>
          暂无待处理的申请
        </div>
      ) : (
        pendingRequests.map((event) => {
          const nickname = event.sender?.nickname || '用户';
          const isBusy = busyEventId === event.eventId;
          const hasError = errorEventId === event.eventId;

          return (
            <div
              key={event.eventId}
              className={styles.requestItem}
            >
              <Avatar
                name={event.sender?.nickname || '?'}
                url={event.sender?.avatarUrl || undefined}
                size={32}
              />
              <div className={styles.requestInfo}>
                <div className={styles.requestName}>
                  {event.sender?.nickname || '未知用户'}
                </div>
                <div className={`${styles.requestMeta} ${hasError ? styles.requestError : ''}`}>
                  {hasError ? '处理失败，请重试' : '请求添加你为好友'}
                </div>
              </div>
              <IconButton
                icon="x"
                label={`拒绝 ${nickname} 的好友申请`}
                variant="danger"
                className={styles.requestAction}
                disabled={isBusy}
                onClick={() => handleRequest(event.eventId, false, event.sender?.userId ?? '')}
              />
              <IconButton
                icon="check"
                label={`同意 ${nickname} 的好友申请`}
                variant="primary"
                className={styles.requestAction}
                disabled={isBusy}
                onClick={() => handleRequest(event.eventId, true, event.sender?.userId ?? '')}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
