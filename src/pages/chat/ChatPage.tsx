import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useChatStore } from '@/stores/chatStore';

export function ChatPage() {
  const loadConversations = useChatStore(s => s.loadConversations);
  const activeConvId = useChatStore(s => s.activeConversationId);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  return (
    <MainLayout
      leftPanel={<ConversationList />}
      mainContent={activeConvId ? <ChatWindow /> : <EmptyState />}
    />
  );
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
      选择一个会话开始聊天
    </div>
  );
}
