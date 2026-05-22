import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageStatus, MessageType, type Message } from '@/proto/message/message_types';
import { PresenceState } from '@/proto/presence/presence_service';

const resolveDownloadUrl = vi.fn();

vi.mock('@/services/mediaDownload', () => ({
  resolveDownloadUrl,
}));

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

const fileMessage: Message = {
  ...textMessage,
  messageId: 43n,
  content: {
    type: MessageType.FILE,
    body: {
      oneofKind: 'file',
      file: {
        fileId: 'file-1',
        fileName: 'brief.pdf',
        fileSize: 12_345n,
        mimeType: 'application/pdf',
      },
    },
  },
};

const imageMessage: Message = {
  ...textMessage,
  messageId: 44n,
  content: {
    type: MessageType.IMAGE,
    body: {
      oneofKind: 'image',
      image: {
        fileId: 'image-1',
        width: 640,
        height: 480,
        thumbnailUrl: '',
      },
    },
  },
};

const videoMessage: Message = {
  ...textMessage,
  messageId: 45n,
  content: {
    type: MessageType.VIDEO,
    body: {
      oneofKind: 'video',
      video: {
        fileId: 'video-1',
        durationSec: 95,
        width: 1280,
        height: 720,
        thumbnailUrl: 'https://cdn.example/video-thumb.jpg',
      },
    },
  },
};

const audioMessage: Message = {
  ...textMessage,
  messageId: 46n,
  content: {
    type: MessageType.AUDIO,
    body: {
      oneofKind: 'audio',
      audio: {
        fileId: 'audio-1',
        durationSec: 42,
      },
    },
  },
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
    const [{ useUIStore }, { useAuthStore }, { usePresenceStore }, { useChatStore }] = await Promise.all([
      import('@/stores/uiStore'),
      import('@/stores/authStore'),
      import('@/stores/presenceStore'),
      import('@/stores/chatStore'),
    ]);
    useUIStore.setState({
      replyTarget: null,
      rightPanelOpen: false,
      rightPanelType: null,
      selectedUserProfile: null,
      toasts: [],
    });
    useAuthStore.setState({ userId: null });
    usePresenceStore.setState({ presences: {} });
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
      messagesByConv: {},
      lastReadSeq: {},
      unreadCounts: {},
    });
    cleanup();
    vi.unstubAllGlobals();
    resolveDownloadUrl.mockReset();
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

  it('requests a download URL when downloading a file message', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    resolveDownloadUrl.mockResolvedValue('https://download.example/brief.pdf');
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={fileMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '下载 brief.pdf' }));

    await waitFor(() => {
      expect(resolveDownloadUrl).toHaveBeenCalledWith('file-1');
      expect(open).toHaveBeenCalledWith('https://download.example/brief.pdf', '_blank', 'noopener,noreferrer');
    });
  });

  it('requests a download URL to render image messages without a thumbnail URL', async () => {
    resolveDownloadUrl.mockResolvedValue('https://download.example/image-1.jpg');
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={imageMessage} />);

    const image = await screen.findByRole('img', { name: '图片消息' });
    expect(resolveDownloadUrl).toHaveBeenCalledWith('image-1');
    expect(image.getAttribute('src')).toBe('https://download.example/image-1.jpg');
  });

  it('requests a download URL when opening a video message', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    resolveDownloadUrl.mockResolvedValue('https://download.example/video-1.mp4');
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={videoMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '播放视频消息' }));

    await waitFor(() => {
      expect(resolveDownloadUrl).toHaveBeenCalledWith('video-1');
      expect(open).toHaveBeenCalledWith('https://download.example/video-1.mp4', '_blank', 'noopener,noreferrer');
    });
    expect(screen.getByText('1:35')).toBeTruthy();
  });

  it('requests a download URL when opening an audio message', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    resolveDownloadUrl.mockResolvedValue('https://download.example/audio-1.m4a');
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={audioMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '播放语音消息' }));

    await waitFor(() => {
      expect(resolveDownloadUrl).toHaveBeenCalledWith('audio-1');
      expect(open).toHaveBeenCalledWith('https://download.example/audio-1.m4a', '_blank', 'noopener,noreferrer');
    });
    expect(screen.getByText('0:42')).toBeTruthy();
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

  it('opens a reaction tray and adds an optimistic reaction', async () => {
    const [{ useAuthStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '添加表情回应' }));
    fireEvent.click(screen.getByRole('button', { name: '用 ❤️ 回应' }));

    expect(screen.getByRole('button', { name: '❤️ 表情回应，1 次' })).toBeTruthy();
  });

  it('toggles an existing self reaction from the reaction pill', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: '👍 表情回应，3 次' }));

    expect(screen.getByRole('button', { name: '👍 表情回应，2 次' })).toBeTruthy();
  });

  it('opens the sender profile when the message avatar is clicked', async () => {
    const [{ useAuthStore }, { useUIStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/uiStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });

    render(<MessageBubble message={{ ...textMessage, senderId: 'u-2' }} />);
    fireEvent.click(screen.getByRole('button', { name: '查看 Designer 的资料' }));

    expect(useUIStore.getState().rightPanelOpen).toBe(true);
    expect(useUIStore.getState().rightPanelType).toBe('user_profile');
    expect(useUIStore.getState().selectedUserProfile).toEqual({
      userId: 'u-2',
      nickname: 'Designer',
      avatarUrl: '',
      bio: '界面与动效设计',
    });
  });

  it('shows sender presence on the message avatar', async () => {
    const [{ useAuthStore }, { usePresenceStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/presenceStore'),
      import('./MessageBubble'),
    ]);
    useAuthStore.setState({ userId: 'me' });
    usePresenceStore.setState({
      presences: {
        'u-2': {
          userId: 'u-2',
          aggregatedState: PresenceState.BUSY,
          lastActiveAtMs: 0n,
          devices: [],
        },
      },
    });

    render(<MessageBubble message={{ ...textMessage, senderId: 'u-2' }} />);

    expect(screen.getByLabelText('Designer 当前状态：忙碌')).toBeTruthy();
  });

  it('calls the chat store when adding a reaction outside preview mode', async () => {
    const [{ useAuthStore }, { useChatStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/chatStore'),
      import('./MessageBubble'),
    ]);
    const addReaction = vi.fn().mockResolvedValue(undefined);
    const originalAddReaction = useChatStore.getState().addReaction;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({ addReaction });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '添加表情回应' }));
    fireEvent.click(screen.getByRole('button', { name: '用 ❤️ 回应' }));

    await waitFor(() => {
      expect(addReaction).toHaveBeenCalledWith('conversation-1', 42n, '❤️', 'me');
    });
    useChatStore.setState({ addReaction: originalAddReaction });
  });

  it('calls the chat store when recalling an own message outside preview mode', async () => {
    const [{ useAuthStore }, { useChatStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/chatStore'),
      import('./MessageBubble'),
    ]);
    const recallMessage = vi.fn().mockResolvedValue(undefined);
    const originalRecallMessage = useChatStore.getState().recallMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({ recallMessage });

    render(<MessageBubble message={{ ...textMessage, senderId: 'me' }} />);
    fireEvent.click(screen.getByRole('button', { name: '撤回消息' }));

    await waitFor(() => {
      expect(recallMessage).toHaveBeenCalledWith('conversation-1', 42n);
    });
    useChatStore.setState({ recallMessage: originalRecallMessage });
  });

  it('calls the chat store when pinning a message outside preview mode', async () => {
    const [{ useAuthStore }, { useChatStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/chatStore'),
      import('./MessageBubble'),
    ]);
    const pinMessage = vi.fn().mockResolvedValue(undefined);
    const originalPinMessage = useChatStore.getState().pinMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({ pinMessage });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '置顶消息' }));

    await waitFor(() => {
      expect(pinMessage).toHaveBeenCalledWith('conversation-1', 42n);
    });
    useChatStore.setState({ pinMessage: originalPinMessage });
  });

  it('calls the chat store when unpinning a pinned message outside preview mode', async () => {
    const [{ useAuthStore }, { useChatStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/chatStore'),
      import('./MessageBubble'),
    ]);
    const unpinMessage = vi.fn().mockResolvedValue(undefined);
    const originalUnpinMessage = useChatStore.getState().unpinMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({ unpinMessage });

    render(<MessageBubble message={{ ...textMessage, isPinned: true }} />);
    fireEvent.click(screen.getByRole('button', { name: '取消置顶消息' }));

    await waitFor(() => {
      expect(unpinMessage).toHaveBeenCalledWith('conversation-1', 42n);
    });
    useChatStore.setState({ unpinMessage: originalUnpinMessage });
  });

  it('calls the chat store when deleting a message outside preview mode', async () => {
    const [{ useAuthStore }, { useChatStore }, { MessageBubble }] = await Promise.all([
      import('@/stores/authStore'),
      import('@/stores/chatStore'),
      import('./MessageBubble'),
    ]);
    const deleteMessages = vi.fn().mockResolvedValue(undefined);
    const originalDeleteMessages = useChatStore.getState().deleteMessages;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({ deleteMessages });

    render(<MessageBubble message={textMessage} />);
    fireEvent.click(screen.getByRole('button', { name: '删除消息' }));

    await waitFor(() => {
      expect(deleteMessages).toHaveBeenCalledWith('conversation-1', [42n]);
    });
    useChatStore.setState({ deleteMessages: originalDeleteMessages });
  });
});
