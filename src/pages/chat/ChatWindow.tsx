import { useChatStore } from '@/stores/chatStore';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList/MessageList';
import { MessageInput } from './MessageInput/MessageInput';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));

  if (!conv) return null;

  return (
    <div className={styles.window}>
      <ChatHeader conv={conv} />
      <MessageList />
      <div className={styles.input}>
        <MessageInput />
      </div>
    </div>
  );
}
