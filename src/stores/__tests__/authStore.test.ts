import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { useAuthStore as useAuthStoreType } from '../authStore';

let useAuthStore: typeof useAuthStoreType;
const login = vi.fn();
const register = vi.fn();
const sendVerifyCode = vi.fn();

vi.mock('@/services/identity', () => ({
  IdentityService: {
    login,
    register,
    sendVerifyCode,
    logout: vi.fn().mockResolvedValue({ header: { success: true } }),
    refreshToken: vi.fn(),
    getProfile: vi.fn(),
  },
}));

vi.mock('@/services/ws-client', () => ({
  wsClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

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
    login.mockReset();
    register.mockReset();
    sendVerifyCode.mockReset();
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

  it('logs in with username, email, and phone password credentials', async () => {
    const response = {
      header: { success: true },
      tokens: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        accessExpiresInSec: 3600,
        refreshExpiresInSec: 7200,
      },
      userInfo: { userId: 'user-1', nickname: 'Designer', bio: '', phone: '', avatarUrl: '' },
    };
    login.mockResolvedValue(response);

    await useAuthStore.getState().login('designer@example.com', 'secret-1', 'device-1', 'Web');
    await useAuthStore.getState().login('+1 415 555 0134', 'secret-1', 'device-2', 'Web');

    expect(login).toHaveBeenNthCalledWith(1, expect.objectContaining({
      credential: {
        oneofKind: 'usernamePwd',
        usernamePwd: { username: 'designer@example.com', password: 'secret-1' },
      },
    }));
    expect(login).toHaveBeenNthCalledWith(2, expect.objectContaining({
      credential: {
        oneofKind: 'usernamePwd',
        usernamePwd: { username: '+14155550134', password: 'secret-1' },
      },
    }));
  });

  it('sends phone verification code and logs in or registers with phone code credentials', async () => {
    const authResponse = {
      header: { success: true },
      tokens: {
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        accessExpiresInSec: 3600,
        refreshExpiresInSec: 7200,
      },
      userInfo: { userId: 'user-2', nickname: 'Phone User', bio: '', phone: '+14155550134', avatarUrl: '' },
    };
    sendVerifyCode.mockResolvedValue({ header: { success: true }, verifyCodeId: 'verify-1' });
    login.mockResolvedValue(authResponse);
    register.mockResolvedValue(authResponse);

    await expect(useAuthStore.getState().sendPhoneVerifyCode('+1 415 555 0134')).resolves.toBe('verify-1');
    await useAuthStore.getState().loginWithPhoneCode('+1 415 555 0134', 'verify-1', '123456', 'device-1', 'Web');
    await useAuthStore.getState().registerWithPhoneCode('+1 415 555 0134', 'verify-1', '123456', 'Phone User');

    expect(sendVerifyCode).toHaveBeenCalledWith(expect.objectContaining({
      destination: { oneofKind: 'phone', phone: '+14155550134' },
    }));
    expect(login).toHaveBeenCalledWith(expect.objectContaining({
      credential: {
        oneofKind: 'phoneCode',
        phoneCode: { phone: '+14155550134', verifyCodeId: 'verify-1', verifyCode: '123456' },
      },
    }));
    expect(register).toHaveBeenCalledWith(expect.objectContaining({
      credential: {
        oneofKind: 'phoneCode',
        phoneCode: { phone: '+14155550134', verifyCodeId: 'verify-1', verifyCode: '123456' },
      },
      nickname: 'Phone User',
    }));
  });
});
