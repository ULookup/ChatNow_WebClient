import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemberRole } from '@/proto/conversation/conversation_service';

describe('MemberList management', () => {
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
    const { useChatStore } = await import('@/stores/chatStore');
    useChatStore.setState({ membersByConv: {} });
    cleanup();
    vi.unstubAllGlobals();
  });

  it('removes a member from the member list action', async () => {
    const [{ useChatStore }, { MemberList }] = await Promise.all([
      import('@/stores/chatStore'),
      import('./MemberList'),
    ]);
    const removeMembers = vi.fn().mockResolvedValue(undefined);
    const originalRemoveMembers = useChatStore.getState().removeMembers;
    useChatStore.setState({
      membersByConv: {
        'conversation-1': [{
          userInfo: { userId: 'u-2', nickname: 'Designer', avatarUrl: '', bio: '', phone: '' },
          role: MemberRole.MEMBER,
          joinTimeMs: 1n,
        }],
      },
      removeMembers,
    });

    render(<MemberList convId="conversation-1" canManage />);
    fireEvent.click(screen.getByRole('button', { name: '移除 Designer' }));

    await waitFor(() => {
      expect(removeMembers).toHaveBeenCalledWith('conversation-1', ['u-2']);
    });
    useChatStore.setState({ removeMembers: originalRemoveMembers });
  });
});
