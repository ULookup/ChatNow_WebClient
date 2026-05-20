import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';

const textMessage: Message = {
  messageId: 42n,
  conversationId: 'conversation-1',
  content: {
    type: MessageType.TEXT,
    body: {
      oneofKind: 'text',
      text: { text: '这是一条需要被引用回复的消息' },
    },
  },
  senderId: 'teammate-1',
  createdAtMs: 1_716_000_000_000n,
  editedAtMs: 0n,
  seqId: 1n,
  userSeq: 1n,
  clientMsgId: 'server-42',
  status: MessageStatus.NORMAL,
  mentionedUserIds: [],
  reactions: [],
  isPinned: false,
};

describe('MessageBubble', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
  });

  afterEach(async () => {
    const [{ useUIStore }, { useAuthStore }] = await Promise.all([
      import('@/stores/uiStore'),
      import('@/stores/authStore'),
    ]);
    useUIStore.setState({ replyTarget: null, toasts: [] });
    useAuthStore.setState({ userId: null });
    cleanup();
    vi.unstubAllGlobals();
  });

  it('stores a reply target when the reply action is clicked', async () => {
    const [{ useAuthStore }, { useUIStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/uiStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '回复消息' }));

    expect(useUIStore.getState().replyTarget).toEqual({
      messageId: 42n,
      senderId: 'teammate-1',
      preview: '这是一条需要被引用回复的消息',
    });
  });

  it('copies text messages through the copy action', async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    vi.stubGlobal('navigator', { clipboard });
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '复制消息' }));

    await waitFor(() => {
      expect(clipboard.writeText).toHaveBeenCalledWith('这是一条需要被引用回复的消息');
    });
  });

  it('renders reaction groups under the message bubble', async () => {
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(
      <MessageBubble
        message={{
          ...textMessage,
          reactions: [{
            emoji: '👍',
            count: 3,
            recentUserIds: ['me', 'teammate-1'],
            selfReacted: true,
          }],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: '👍 表情回应，3 次' })).toBeTruthy();
  });

  it('shows sender context and message time for incoming messages', async () => {
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(
      <MessageBubble
        message={{
          ...textMessage,
          senderId: 'u-2',
          createdAtMs: BigInt(new Date(2024, 4, 18, 9, 5).getTime()),
        }}
      />,
    );

    expect(screen.getByText('Designer')).toBeTruthy();
    expect(screen.getByText('09:05')).toBeTruthy();
  });
});
