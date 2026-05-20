import { useMemo, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { IconButton } from '@/components/Icon/Icon';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList/MessageList';
import { MessageInput } from './MessageInput/MessageInput';
import { getMessageSearchResults } from './messageSearch';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));
  const messages = useChatStore(s => activeId ? (s.messagesByConv[activeId] ?? []) : []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(
    () => getMessageSearchResults(messages, searchQuery),
    [messages, searchQuery],
  );

  if (!conv) return null;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={styles.window}>
      <ChatHeader
        conv={conv}
        searchActive={searchOpen}
        onToggleSearch={() => setSearchOpen((open) => !open)}
      />
      {searchOpen && (
        <div className={styles.searchStrip}>
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索当前会话消息"
          />
          <span>
            {searchQuery.trim()
              ? `${searchResults.count} 条结果`
              : '输入关键词开始搜索'}
          </span>
          <IconButton icon="x" label="关闭消息搜索" className={styles.searchClose} onClick={closeSearch} />
        </div>
      )}
      <MessageList searchQuery={searchOpen ? searchQuery : ''} />
      <div className={styles.input}>
        <MessageInput />
      </div>
    </div>
  );
}
