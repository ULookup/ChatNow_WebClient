import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Icon } from '@/components/Icon/Icon';
import { filterConversations } from './conversationFilters';
import { ConversationItem } from './ConversationItem';
import styles from './ConversationList.module.css';

export function ConversationList() {
  const conversations = useChatStore(s => s.conversations);
  const conversationSearch = useChatStore(s => s.conversationSearch);
  const searchConversations = useChatStore(s => s.searchConversations);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const queryText = query.trim();
  const filteredConversations = useMemo(() => {
    if (!queryText) return conversations;
    if (!isPreview && !conversationSearch.failed && conversationSearch.query === queryText) {
      return conversationSearch.conversations;
    }
    return filterConversations(conversations, queryText);
  }, [conversationSearch, conversations, isPreview, queryText]);

  useEffect(() => {
    if (isPreview) return;
    searchConversations(query);
  }, [isPreview, query, searchConversations]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.kicker}>ChatNow</div>
          <h1 className={styles.title}>消息</h1>
        </div>
        <button className={styles.createBtn} type="button" aria-label="创建会话" title="创建会话">
          <Icon name="plus" size={16} />
        </button>
      </div>
      <div className={styles.searchBar}>
        <Icon name="search" size={15} className={styles.searchIcon} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="搜索会话、好友或消息"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className={styles.shortcut}>⌘K</span>
        {queryText && !isPreview && conversationSearch.loading && (
          <span className={styles.searchState}>搜索中</span>
        )}
      </div>
      {queryText && !isPreview && conversationSearch.failed && (
        <div className={styles.searchHint}>后端搜索暂不可用，已显示本地匹配</div>
      )}
      <div className={styles.list}>
        {filteredConversations.map(conv => (
          <ConversationItem key={conv.conversationId} conv={conv} />
        ))}
        {filteredConversations.length === 0 && (
          <div className={styles.emptySearch}>
            <Icon name="search" size={18} />
            <span>没有找到匹配的会话</span>
          </div>
        )}
      </div>
    </div>
  );
}
