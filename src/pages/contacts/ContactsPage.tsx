import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { FriendList } from './FriendList';
import { PendingRequests } from './PendingRequests';
import { BlockedUsers } from './BlockedUsers';
import { useContactStore } from '@/stores/contactStore';
import styles from './ContactsPage.module.css';

export function ContactsPage() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const loadFriends = useContactStore((s) => s.loadFriends);
  const loadPending = useContactStore((s) => s.loadPending);
  const loadBlocked = useContactStore((s) => s.loadBlocked);

  useEffect(() => {
    if (isPreview) {
      seedPreviewContacts();
      return;
    }
    loadFriends().catch(() => { /* keep page usable if relationship API is offline */ });
    loadPending().catch(() => { /* keep page usable if relationship API is offline */ });
    loadBlocked().catch(() => { /* keep page usable if relationship API is offline */ });
  }, [isPreview, loadBlocked, loadFriends, loadPending]);

  return (
    <MainLayout
      leftPanel={
        <div className={styles.panel}>
          <div className={styles.title}>联系人</div>
          <FriendList />
        </div>
      }
      mainContent={
        <div className={styles.contentStack}>
          <PendingRequests />
          <BlockedUsers autoLoad={!isPreview} />
        </div>
      }
    />
  );
}

function seedPreviewContacts() {
  useContactStore.setState({
    friends: [
      {
        userId: 'friend-ada',
        nickname: 'Ada',
        avatarUrl: '',
        bio: 'Product thinker',
        phone: '13800000000',
      },
      {
        userId: 'friend-grace',
        nickname: 'Grace',
        avatarUrl: '',
        bio: 'Frontend engineer',
        phone: '13900000000',
      },
    ],
    pendingRequests: [],
    blockedUsers: [
      {
        userId: 'blocked-user',
        nickname: 'Blocked User',
        avatarUrl: '',
        bio: '',
        phone: '',
      },
    ],
    friendSearch: {
      query: '',
      friends: [],
      loading: false,
      failed: false,
    },
    loading: false,
  });
}
