import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { useAuthStore as useAuthStoreType } from '../authStore';

let useAuthStore: typeof useAuthStoreType;

describe('authStore', () => {
  beforeEach(async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
    vi.resetModules();
    ({ useAuthStore } = await import('../authStore'));
    useAuthStore.setState({
      isAuthenticated: false,
      userId: null,
      userInfo: null,
      accessToken: null,
      refreshToken: null,
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize as not authenticated when no token exists', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().userId).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('should set auth tokens and user info', () => {
    const store = useAuthStore.getState();
    store.setAuth(
      {
        accessToken: 'test-access',
        refreshToken: 'test-refresh',
        accessExpiresInSec: 3600,
        refreshExpiresInSec: 7200,
      },
      {
        userId: 'user-1',
        nickname: 'Test',
        bio: '',
        phone: '',
        avatarUrl: '',
      },
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().userId).toBe('user-1');
    expect(useAuthStore.getState().accessToken).toBe('test-access');
    expect(useAuthStore.getState().refreshToken).toBe('test-refresh');
    expect(useAuthStore.getState().userInfo?.nickname).toBe('Test');
    expect(localStorage.getItem('chatnow_access_token')).toBe('test-access');
    expect(localStorage.getItem('chatnow_refresh_token')).toBe('test-refresh');
  });

  it('should clear auth state', () => {
    const store = useAuthStore.getState();
    store.setAuth(
      {
        accessToken: 'test-access',
        refreshToken: 'test-refresh',
        accessExpiresInSec: 3600,
        refreshExpiresInSec: 7200,
      },
      {
        userId: 'user-1',
        nickname: 'Test',
        bio: '',
        phone: '',
        avatarUrl: '',
      },
    );
    store.clearAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().userId).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
    expect(useAuthStore.getState().userInfo).toBeNull();
    expect(localStorage.getItem('chatnow_access_token')).toBeNull();
    expect(localStorage.getItem('chatnow_refresh_token')).toBeNull();
  });
});
