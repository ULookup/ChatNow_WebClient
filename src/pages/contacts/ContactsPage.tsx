import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { FriendList } from './FriendList';
import { PendingRequests } from './PendingRequests';
import { useContactStore } from '@/stores/contactStore';
import styles from './ContactsPage.module.css';

export function ContactsPage() {
  const loadFriends = useContactStore((s) => s.loadFriends);
  const loadPending = useContactStore((s) => s.loadPending);

  useEffect(() => {
    loadFriends();
    loadPending();
  }, [loadFriends, loadPending]);

  return (
    <MainLayout
      leftPanel={
        <div className={styles.panel}>
          <div className={styles.title}>联系人</div>
          <FriendList />
        </div>
      }
      mainContent={<PendingRequests />}
    />
  );
}
