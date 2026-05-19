import { useChatStore } from '@/stores/chatStore';
import { ChatHeader } from './ChatHeader';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));

  if (!conv) return null;

  return (
    <div className={styles.window}>
      <ChatHeader conv={conv} />
      <div className={styles.messages}>
        {/* MessageList component will be added in Task 9 */}
        <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
          消息列表组件将在下一步实现
        </div>
      </div>
      <div className={styles.input}>
        {/* MessageInput component will be added in Task 10 */}
        <div style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
          消息输入组件将在下一步实现
        </div>
      </div>
    </div>
  );
}
