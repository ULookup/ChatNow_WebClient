import { useEffect } from 'react';
import { useContactStore } from '@/stores/contactStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import styles from './ContactsPage.module.css';

interface Props {
  autoLoad?: boolean;
}

export function BlockedUsers({ autoLoad = true }: Props) {
  const blockedUsers = useContactStore((s) => s.blockedUsers);
  const loadBlocked = useContactStore((s) => s.loadBlocked);
  const unblockUser = useContactStore((s) => s.unblockUser);

  useEffect(() => {
    if (!autoLoad) return;
    loadBlocked().catch(() => { /* keep contacts usable if backend is offline */ });
  }, [autoLoad, loadBlocked]);

  return (
    <section className={styles.blockedSection}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.kicker}>Safety</div>
          <h2 className={styles.sectionTitle}>黑名单</h2>
        </div>
      </div>
      {blockedUsers.length === 0 ? (
        <div className={styles.compactEmpty}>暂无拉黑用户</div>
      ) : (
        <div className={styles.blockedList}>
          {blockedUsers.map((user) => {
            const nickname = user.nickname || '未知用户';
            return (
              <div className={styles.blockedItem} key={user.userId}>
                <Avatar name={nickname} url={user.avatarUrl || undefined} size={30} />
                <span>{nickname}</span>
                <IconButton
                  icon="x"
                  label={`解除拉黑 ${nickname}`}
                  className={styles.blockedAction}
                  onClick={() => unblockUser(user.userId)}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
