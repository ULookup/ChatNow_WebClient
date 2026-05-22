import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { IconButton } from '@/components/Icon/Icon';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList/MessageList';
import { MessageInput } from './MessageInput/MessageInput';
import { getMessageSearchResults } from './messageSearch';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const [searchParams] = useSearchParams();
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));
  const messages = useChatStore(s => activeId ? (s.messagesByConv[activeId] ?? []) : []);
  const messageSearch = useChatStore(s => activeId ? s.messageSearchesByConv[activeId] : undefined);
  const searchMessages = useChatStore(s => s.searchMessages);
  const clearConversation = useChatStore(s => s.clearConversation);
  const addToast = useUIStore(s => s.addToast);
  const messageSearchRequest = useUIStore(s => s.messageSearchRequest);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const isPreview = searchParams.get('preview') === '1';
  const searchResults = useMemo(
    () => getMessageSearchResults(messages, searchQuery),
    [messages, searchQuery],
  );
  const trimmedSearchQuery = searchQuery.trim();
  const useBackendSearch = !isPreview && Boolean(activeId && trimmedSearchQuery);
  const backendSearchMatches = useBackendSearch && messageSearch?.query === trimmedSearchQuery
    ? messageSearch.messages
    : [];
  const effectiveSearchResults = useBackendSearch
    ? {
        matches: backendSearchMatches,
        count: backendSearchMatches.length,
        query: trimmedSearchQuery.toLocaleLowerCase(),
      }
    : searchResults;

  useEffect(() => {
    if (!messageSearchRequest) return;
    setSearchOpen(true);
    setSearchQuery(messageSearchRequest.query);
    setActiveSearchIndex(0);
  }, [messageSearchRequest]);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [effectiveSearchResults.query, effectiveSearchResults.count]);

  useEffect(() => {
    if (!activeId || !searchOpen || isPreview) return;
    const query = searchQuery.trim();
    if (!query) return;

    searchMessages(activeId, query).catch(() => {
      addToast('消息搜索失败，请重试', 'error');
    });
  }, [activeId, addToast, isPreview, searchMessages, searchOpen, searchQuery]);

  if (!conv) return null;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveSearchIndex(0);
  };
  const searchPositionLabel = messageSearch?.loading && useBackendSearch
    ? '搜索中...'
    : effectiveSearchResults.count > 0
    ? `${activeSearchIndex + 1} / ${effectiveSearchResults.count}`
    : searchQuery.trim()
      ? `${effectiveSearchResults.count} 条结果`
      : '输入关键词开始搜索';
  const showSearchStepper = effectiveSearchResults.count > 0;
  const stepSearch = (direction: 1 | -1) => {
    if (effectiveSearchResults.count === 0) return;
    setActiveSearchIndex((index) => (
      index + direction + effectiveSearchResults.count
    ) % effectiveSearchResults.count);
  };
  const handleClearConversation = async () => {
    if (!activeId) return;
    if (isPreview) {
      useChatStore.setState((state) => {
        const nextMessageSearches = { ...state.messageSearchesByConv };
        delete nextMessageSearches[activeId];
        return {
          messagesByConv: { ...state.messagesByConv, [activeId]: [] },
          pinnedMessagesByConv: { ...state.pinnedMessagesByConv, [activeId]: [] },
          messageSearchesByConv: nextMessageSearches,
          unreadCounts: { ...state.unreadCounts, [activeId]: 0 },
          conversations: state.conversations.map((conversation) => (
            conversation.conversationId === activeId
              ? {
                  ...conversation,
                  lastMessage: undefined,
                  self: conversation.self
                    ? { ...conversation.self, unreadCount: 0n }
                    : conversation.self,
                }
              : conversation
          )),
        };
      });
      addToast('已清空当前会话消息', 'success');
      return;
    }

    try {
      await clearConversation(activeId);
      addToast('已清空当前会话消息', 'success');
    } catch {
      addToast('清空会话失败，请重试', 'error');
    }
  };

  return (
    <div className={styles.window}>
      <ChatHeader
        conv={conv}
        searchActive={searchOpen}
        onToggleSearch={() => setSearchOpen((open) => !open)}
        onClearConversation={handleClearConversation}
      />
      {searchOpen && (
        <div className={styles.searchStrip}>
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索当前会话消息"
          />
          <span>{searchPositionLabel}</span>
          {showSearchStepper && (
            <div className={styles.searchStepper}>
              <IconButton
                icon="arrow-up"
                label="上一条搜索结果"
                className={styles.searchStepBtn}
                onClick={() => stepSearch(-1)}
              />
              <IconButton
                icon="arrow-down"
                label="下一条搜索结果"
                className={styles.searchStepBtn}
                onClick={() => stepSearch(1)}
              />
            </div>
          )}
          <IconButton icon="x" label="关闭消息搜索" className={styles.searchClose} onClick={closeSearch} />
        </div>
      )}
      <MessageList
        searchQuery={searchOpen ? searchQuery : ''}
        searchMessages={useBackendSearch ? effectiveSearchResults.matches : undefined}
      />
      <div className={styles.input}>
        <MessageInput />
      </div>
    </div>
  );
}
