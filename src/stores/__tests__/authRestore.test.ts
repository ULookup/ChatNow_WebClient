import { beforeEach, expect, it, vi } from 'vitest';
import { UserInfo } from '@/proto/common/types';
import { useAuthStore } from '../authStore';
import { setTokens } from '@/utils/token';
import { useChatStore } from '../chatStore';
import { useContactStore } from '../contactStore';
import { usePresenceStore } from '../presenceStore';
import { useUIStore } from '../uiStore';

const mocks = vi.hoisted(() => ({ getProfile: vi.fn(), logout: vi.fn(), connect: vi.fn(), disconnect: vi.fn() }));
vi.mock('@/services/identity', () => ({ IdentityService: mocks }));
vi.mock('@/services/ws-client', () => ({ wsClient: mocks }));
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useAuthStore.getState().clearAuth();
});

it('restores authoritative user identity before reconnecting a persisted session', async () => {
  setTokens('persisted-access', 'persisted-refresh');
  useAuthStore.setState({ isAuthenticated: true, userId: null });
  mocks.getProfile.mockResolvedValue({ header: { success: true }, userInfo: UserInfo.create({ userId: 'alice' }) });
  await useAuthStore.getState().restoreSession();
  expect(useAuthStore.getState().userId).toBe('alice');
  expect(mocks.connect).toHaveBeenCalledOnce();
});

it('clears the local session even when logout cannot reach the server', async () => {
  setTokens('persisted-access', 'persisted-refresh');
  useAuthStore.setState({ isAuthenticated: true, userId: 'alice' });
  mocks.logout.mockRejectedValue(new Error('offline'));
  await expect(useAuthStore.getState().logout()).rejects.toThrow('offline');
  expect(useAuthStore.getState().isAuthenticated).toBe(false);
});

it('removes account data before a different account can sign in', () => {
  useChatStore.setState({ activeConversationId: 'alice-private-chat', messagesByConv: { 'alice-private-chat': [] } });
  useUIStore.setState({ replyTarget: { messageId: 1n, senderId: 'alice', preview: 'private text' } });
  useAuthStore.getState().clearAuth();
  expect(useChatStore.getState()).toEqual(useChatStore.getInitialState());
  expect(useContactStore.getState()).toEqual(useContactStore.getInitialState());
  expect(usePresenceStore.getState()).toEqual(usePresenceStore.getInitialState());
  expect(useUIStore.getState()).toEqual(useUIStore.getInitialState());
});
