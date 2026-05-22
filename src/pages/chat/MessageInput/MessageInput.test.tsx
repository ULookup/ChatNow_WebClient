import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationStatus, ConversationType, MemberRole, type Conversation } from '@/proto/conversation/conversation_service';
import type { FileInfo } from '@/proto/media/media_service';

const uploadChatFile = vi.fn();

vi.mock('@/services/mediaUpload', () => ({
  uploadChatFile,
}));

function createConversation(draft = ''): Conversation {
  return {
    conversationId: 'conversation-1',
    type: ConversationType.PRIVATE,
    name: 'Designer',
    avatarUrl: '',
    createdAtMs: 1_716_000_000_000n,
    memberCount: 2,
    topMemberIds: ['me', 'u-2'],
    status: ConversationStatus.CONVERSATION_NORMAL,
    self: {
      role: MemberRole.MEMBER,
      joinedAtMs: 1_716_000_000_000n,
      isMuted: false,
      isPinned: false,
      pinTimeMs: 0n,
      isVisible: true,
      lastReadSeq: 1n,
      unreadCount: 0n,
      draft,
    },
  };
}

describe('MessageInput typing', () => {
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
    const [{ useChatStore }, { useAuthStore }, { useUIStore }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/authStore'),
      import('@/stores/uiStore'),
    ]);
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
      messagesByConv: {},
      pinnedMessagesByConv: {},
      messageSearchesByConv: {},
      typingUsersByConv: {},
      lastReadSeq: {},
      unreadCounts: {},
    });
    useAuthStore.setState({ userId: null });
    useUIStore.setState({ replyTarget: null });
    cleanup();
    vi.unstubAllGlobals();
    uploadChatFile.mockReset();
  });

  it('sends typing state as the composer changes and clears it after send', async () => {
    const [{ useChatStore }, { useAuthStore }, { MessageInput }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/authStore'),
      import('./MessageInput'),
    ]);
    const sendTyping = vi.fn().mockResolvedValue(undefined);
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const originalSendTyping = useChatStore.getState().sendTyping;
    const originalSendMessage = useChatStore.getState().sendMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      sendTyping,
      sendMessage,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/chat']}>
        <MessageInput />
      </MemoryRouter>,
    );
    const editor = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    editor.textContent = 'hello';
    fireEvent.input(editor);

    await waitFor(() => {
      expect(sendTyping).toHaveBeenCalledWith('conversation-1', true);
    });
    fireEvent.click(screen.getByRole('button', { name: '发送消息' }));

    await waitFor(() => {
      expect(sendTyping).toHaveBeenCalledWith('conversation-1', false);
    });
    useChatStore.setState({
      sendTyping: originalSendTyping,
      sendMessage: originalSendMessage,
    });
  });

  it('restores the active conversation draft into the composer', async () => {
    const [{ useChatStore }, { MessageInput }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./MessageInput'),
    ]);
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation('这个方案稍后补一句')],
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/chat']}>
        <MessageInput />
      </MemoryRouter>,
    );

    expect(container.querySelector('[contenteditable="true"]')?.textContent).toBe('这个方案稍后补一句');
  });

  it('saves draft changes and clears the backend draft after send', async () => {
    const [{ useChatStore }, { useAuthStore }, { MessageInput }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/authStore'),
      import('./MessageInput'),
    ]);
    const saveDraft = vi.fn().mockResolvedValue(undefined);
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const originalSaveDraft = useChatStore.getState().saveDraft;
    const originalSendMessage = useChatStore.getState().sendMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      saveDraft,
      sendMessage,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/chat']}>
        <MessageInput />
      </MemoryRouter>,
    );
    const editor = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    editor.textContent = '需要同步到后端的草稿';
    fireEvent.input(editor);

    await waitFor(() => {
      expect(saveDraft).toHaveBeenCalledWith('conversation-1', '需要同步到后端的草稿');
    });
    fireEvent.click(screen.getByRole('button', { name: '发送消息' }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
      expect(saveDraft).toHaveBeenCalledWith('conversation-1', '');
    });
    useChatStore.setState({
      saveDraft: originalSaveDraft,
      sendMessage: originalSendMessage,
    });
  });

  it('uploads a selected file and sends a file message outside preview mode', async () => {
    const [{ useChatStore }, { useAuthStore }, { MessageInput }] = await Promise.all([
      import('@/stores/chatStore'),
      import('@/stores/authStore'),
      import('./MessageInput'),
    ]);
    const fileInfo: FileInfo = {
      fileId: 'file-1',
      fileName: 'brief.pdf',
      fileSize: 12_345n,
      mimeType: 'application/pdf',
      uploadedAtMs: 1_716_000_000_000n,
    };
    uploadChatFile.mockResolvedValue(fileInfo);
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const originalSendMessage = useChatStore.getState().sendMessage;
    useAuthStore.setState({ userId: 'me' });
    useChatStore.setState({
      activeConversationId: 'conversation-1',
      conversations: [createConversation()],
      sendMessage,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/chat']}>
        <MessageInput />
      </MemoryRouter>,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['pdf'], 'brief.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadChatFile).toHaveBeenCalledWith(file);
      expect(sendMessage).toHaveBeenCalledWith(
        'conversation-1',
        {
          type: 3,
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
        undefined,
      );
    });
    useChatStore.setState({ sendMessage: originalSendMessage });
  });
});
