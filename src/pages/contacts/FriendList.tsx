import { useContactStore } from '@/stores/contactStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import styles from './ContactsPage.module.css';

export function FriendList() {
  const friends = useContactStore((s) => s.friends);

  return (
    <div className={styles.friendList}>
      {friends.map((friend) => (
        <div
          key={friend.userId}
          className={styles.friendItem}
        >
          <Avatar name={friend.nickname || '?'} size={28} />
          <span className={styles.friendName}>{friend.nickname || '未知'}</span>
          <IconButton icon="info" label={`查看 ${friend.nickname || '好友'} 资料`} className={styles.friendAction} />
        </div>
      ))}
      {friends.length === 0 && (
        <div className={styles.empty}>
          暂无好友
        </div>
      )}
    </div>
  );
}
