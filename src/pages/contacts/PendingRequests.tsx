import { useContactStore } from '@/stores/contactStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import styles from './ContactsPage.module.css';

export function PendingRequests() {
  const pendingRequests = useContactStore((s) => s.pendingRequests);
  const handleFriendRequest = useContactStore((s) => s.handleFriendRequest);

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
        pendingRequests.map((event) => (
          <div
            key={event.eventId}
            className={styles.requestItem}
          >
            <Avatar
              name={event.sender?.nickname || '?'}
              size={32}
            />
            <div className={styles.requestInfo}>
              <div className={styles.requestName}>
                {event.sender?.nickname || '未知用户'}
              </div>
              <div className={styles.requestMeta}>
                请求添加你为好友
              </div>
            </div>
            <IconButton
              icon="x"
              label={`拒绝 ${event.sender?.nickname || '用户'} 的好友申请`}
              variant="danger"
              className={styles.requestAction}
              onClick={() =>
                handleFriendRequest(
                  event.eventId,
                  false,
                  event.sender?.userId ?? '',
                )
              }
            />
            <IconButton
              icon="check"
              label={`同意 ${event.sender?.nickname || '用户'} 的好友申请`}
              variant="primary"
              className={styles.requestAction}
              onClick={() =>
                handleFriendRequest(
                  event.eventId,
                  true,
                  event.sender?.userId ?? '',
                )
              }
            />
          </div>
        ))
      )}
    </div>
  );
}
