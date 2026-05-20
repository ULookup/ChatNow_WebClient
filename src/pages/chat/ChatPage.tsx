import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { ContextPanel } from '@/pages/context-panel/ContextPanel';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

export function ChatPage() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const loadConversations = useChatStore(s => s.loadConversations);
  const activeConvId = useChatStore(s => s.activeConversationId);

  useEffect(() => {
    if (isPreview) {
      seedPreviewData();
      return;
    }
    loadConversations();
  }, [isPreview, loadConversations]);

  return (
    <MainLayout
      leftPanel={<ConversationList />}
      mainContent={activeConvId ? <ChatWindow /> : <EmptyState />}
      rightPanel={<ContextPanel />}
    />
  );
}

function seedPreviewData() {
  const now = BigInt(Date.now());
  const conversations: Conversation[] = [
    {
      conversationId: 'preview-product',
      type: ConversationType.GROUP,
      name: '产品体验小组',
      avatarUrl: '',
      description: '用于预览 Liquid Console 主界面',
      createdAtMs: now - 86400000n,
      memberCount: 8,
      topMemberIds: ['preview-user', 'u-2', 'u-3'],
      status: ConversationStatus.CONVERSATION_NORMAL,
      lastMessage: {
        messageId: 3n,
        senderId: 'preview-user',
        messageType: MessageType.TEXT,
        contentPreview: '按钮动效已经加好了，hover 一下看看。',
        sentAtMs: now - 180000n,
        status: MessageStatus.NORMAL,
      },
      self: {
        role: MemberRole.OWNER,
        joinedAtMs: now - 86400000n,
        isMuted: false,
        isPinned: true,
        pinTimeMs: now - 3600000n,
        isVisible: true,
        lastReadSeq: 2n,
        unreadCount: 3n,
        draft: '这个输入栏也能看动效',
      },
    },
    {
      conversationId: 'preview-design',
      type: ConversationType.PRIVATE,
      name: 'UI 设计评审',
      avatarUrl: '',
      createdAtMs: now - 172800000n,
      memberCount: 2,
      topMemberIds: ['preview-user', 'u-4'],
      status: ConversationStatus.CONVERSATION_NORMAL,
      lastMessage: {
        messageId: 4n,
        senderId: 'u-4',
        messageType: MessageType.TEXT,
        contentPreview: '浅色玻璃质感现在更稳了。',
        sentAtMs: now - 4200000n,
        status: MessageStatus.NORMAL,
      },
      self: {
        role: MemberRole.MEMBER,
        joinedAtMs: now - 172800000n,
        isMuted: true,
        isPinned: false,
        pinTimeMs: 0n,
        isVisible: true,
        lastReadSeq: 12n,
        unreadCount: 6n,
      },
    },
  ];

  const messages: Message[] = [
    createPreviewMessage(1n, 'preview-product', 'u-2', '这版主界面保留四栏结构，但按钮状态更清楚。', now - 600000n, 1n),
    {
      ...createPreviewMessage(2n, 'preview-product', 'preview-user', '我想重点看看按钮 hover、按压和发送按钮的光扫。', now - 420000n, 2n),
      reactions: [
        { emoji: '👍', count: 3, recentUserIds: ['preview-user', 'u-2', 'u-3'], selfReacted: true },
      ],
    },
    {
      ...createPreviewMessage(3n, 'preview-product', 'u-3', '可以，左侧会话、顶部操作和输入栏都已经有动效。', now - 180000n, 3n),
      reactions: [
        { emoji: '✨', count: 2, recentUserIds: ['preview-user', 'u-2'], selfReacted: false },
      ],
    },
  ];

  useAuthStore.setState({
    isAuthenticated: true,
    userId: 'preview-user',
    userInfo: {
      userId: 'preview-user',
      nickname: 'Preview',
      avatarUrl: '',
      bio: '本地预览账号',
      phone: '',
    },
    accessToken: 'preview-token',
    refreshToken: 'preview-refresh-token',
  });

  useChatStore.setState({
    conversations,
    activeConversationId: 'preview-product',
    messagesByConv: { 'preview-product': messages },
    unreadCounts: { 'preview-product': 3, 'preview-design': 6 },
    lastReadSeq: { 'preview-product': 2, 'preview-design': 12 },
    loading: false,
  });
  useUIStore.setState({ rightPanelOpen: false, rightPanelType: 'group_info' });
}

function createPreviewMessage(
  messageId: bigint,
  conversationId: string,
  senderId: string,
  text: string,
  createdAtMs: bigint,
  seqId: bigint,
): Message {
  return {
    messageId,
    conversationId,
    senderId,
    createdAtMs,
    editedAtMs: 0n,
    seqId,
    userSeq: seqId,
    clientMsgId: `preview-${messageId.toString()}`,
    status: MessageStatus.NORMAL,
    mentionedUserIds: [],
    reactions: [],
    isPinned: false,
    content: {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text } },
    },
  };
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
      选择一个会话开始聊天
    </div>
  );
}
