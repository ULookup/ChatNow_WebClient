import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PresenceState } from '@/proto/presence/presence_service';

describe('UserProfile', () => {
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
    const [{ useUIStore }, { useAuthStore }, { usePresenceStore }] = await Promise.all([
      import('@/stores/uiStore'),
      import('@/stores/authStore'),
      import('@/stores/presenceStore'),
    ]);
    useUIStore.setState({ selectedUserProfile: null });
    useAuthStore.setState({ userId: null, userInfo: null });
    usePresenceStore.setState({ presences: {} });
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders selected sender profile with IM actions and detail sections', async () => {
    const [{ useUIStore }, { UserProfile }] = await Promise.all([
      import('@/stores/uiStore'),
      import('./UserProfile'),
    ]);
    useUIStore.setState({
      selectedUserProfile: {
        userId: 'u-2',
        nickname: 'Designer',
        avatarUrl: '',
        bio: '界面与动效设计',
      },
    });

    render(<UserProfile />);

    expect(screen.getByText('Designer')).toBeTruthy();
    expect(screen.getByText('界面与动效设计')).toBeTruthy();
    expect(screen.getByRole('button', { name: '给 Designer 发消息' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '搜索与 Designer 的聊天记录' })).toBeTruthy();
    expect(screen.getByText('状态未知')).toBeTruthy();
    expect(screen.getByText('共同群聊')).toBeTruthy();
    expect(screen.getByText('最近共享')).toBeTruthy();
    expect(screen.getByText('ID: u-2')).toBeTruthy();
  });

  it('renders real presence state and last active time from presence store', async () => {
    vi.setSystemTime(new Date('2026-05-21T12:00:00-07:00'));
    const [{ useUIStore }, { usePresenceStore }, { UserProfile }] = await Promise.all([
      import('@/stores/uiStore'),
      import('@/stores/presenceStore'),
      import('./UserProfile'),
    ]);
    useUIStore.setState({
      selectedUserProfile: {
        userId: 'u-2',
        nickname: 'Designer',
        avatarUrl: '',
        bio: '界面与动效设计',
      },
    });
    usePresenceStore.setState({
      presences: {
        'u-2': {
          userId: 'u-2',
          aggregatedState: PresenceState.AWAY,
          lastActiveAtMs: BigInt(new Date('2026-05-21T11:45:00-07:00').getTime()),
          devices: [],
        },
      },
    });

    render(<UserProfile />);

    expect(screen.getByText('离开')).toBeTruthy();
    expect(screen.getByText('15 分钟前活跃')).toBeTruthy();
    expect(screen.getByLabelText('离开')).toBeTruthy();
  });

  it('dispatches chat actions from selected sender profile', async () => {
    const [{ useUIStore }, { UserProfile }] = await Promise.all([
      import('@/stores/uiStore'),
      import('./UserProfile'),
    ]);
    useUIStore.setState({
      selectedUserProfile: {
        userId: 'u-2',
        nickname: 'Designer',
        avatarUrl: '',
        bio: '界面与动效设计',
      },
    });

    render(<UserProfile />);
    fireEvent.click(screen.getByRole('button', { name: '搜索与 Designer 的聊天记录' }));
    expect(useUIStore.getState().messageSearchRequest?.query).toBe('Designer');

    fireEvent.click(screen.getByRole('button', { name: '给 Designer 发消息' }));
    expect(useUIStore.getState().composerFocusRequest).toBe(1);
  });
});
