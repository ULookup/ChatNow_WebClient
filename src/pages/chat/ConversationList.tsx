import { useChatStore } from '@/stores/chatStore';
import { ConversationItem } from './ConversationItem';
import styles from './ConversationList.module.css';

export function ConversationList() {
  const conversations = useChatStore(s => s.conversations);

  return (
    <div className={styles.panel}>
      <div className={styles.searchBar}>
        <input className={styles.searchInput} type="text" placeholder="🔍 搜索..." />
      </div>
      <div className={styles.list}>
        {conversations.map(conv => (
          <ConversationItem key={conv.conversationId} conv={conv} />
        ))}
      </div>
    </div>
  );
}
