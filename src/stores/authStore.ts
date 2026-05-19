import { create } from 'zustand';
import type { UserInfo } from '@/proto/common/types';
import type { AuthTokens } from '@/proto/identity/identity_service';
import { IdentityService } from '@/services/identity';
import { setTokens, clearTokens, getAccessToken } from '@/utils/token';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userInfo: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (tokens: AuthTokens, user: UserInfo) => void;
  clearAuth: () => void;
  login: (nickname: string, password: string, deviceId: string, deviceName: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getProfile: (userId?: string) => Promise<UserInfo>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!getAccessToken(),
  userId: null,
  userInfo: null,
  accessToken: getAccessToken(),
  refreshToken: null,

  setAuth: (tokens: AuthTokens, user: UserInfo) => {
    setTokens(tokens.accessToken, tokens.refreshToken);
    set({
      isAuthenticated: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.userId || null,
      userInfo: user,
    });
  },

  clearAuth: () => {
    clearTokens();
    set({
      isAuthenticated: false,
      userId: null,
      userInfo: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  login: async (nickname, password, deviceId, deviceName) => {
    const rsp = await IdentityService.login({
      requestId: crypto.randomUUID(),
      credential: {
        oneofKind: 'usernamePwd' as const,
        usernamePwd: { username: nickname, password },
      },
      deviceId,
      deviceName,
    });
    if (rsp.header?.success && rsp.tokens && rsp.userInfo) {
      get().setAuth(rsp.tokens, rsp.userInfo);
    } else {
      throw new Error(
        rsp.header?.errorMessage || `Login failed: ${rsp.header?.errorCode}`,
      );
    }
  },

  register: async (nickname, password) => {
    const rsp = await IdentityService.register({
      requestId: crypto.randomUUID(),
      credential: {
        oneofKind: 'usernamePwd' as const,
        usernamePwd: { username: nickname, password },
      },
      nickname,
    });
    if (rsp.header?.success && rsp.tokens && rsp.userInfo) {
      get().setAuth(rsp.tokens, rsp.userInfo);
    } else {
      throw new Error(
        rsp.header?.errorMessage ||
          `Register failed: ${rsp.header?.errorCode}`,
      );
    }
  },

  logout: async () => {
    await IdentityService.logout({
      requestId: crypto.randomUUID(),
    });
    get().clearAuth();
  },

  refreshAuth: async () => {
    const refresh = get().refreshToken;
    if (!refresh) throw new Error('No refresh token');
    const rsp = await IdentityService.refreshToken({
      requestId: crypto.randomUUID(),
      refreshToken: refresh,
    });
    if (rsp.header?.success && rsp.tokens) {
      setTokens(rsp.tokens.accessToken, rsp.tokens.refreshToken);
      set({
        accessToken: rsp.tokens.accessToken,
        refreshToken: rsp.tokens.refreshToken,
      });
    } else {
      get().clearAuth();
      throw new Error('Token refresh failed');
    }
  },

  getProfile: async (userId?) => {
    const rsp = await IdentityService.getProfile({
      requestId: crypto.randomUUID(),
      userId,
    });
    if (rsp.header?.success && rsp.userInfo) {
      if (!userId) {
        set({ userInfo: rsp.userInfo });
      }
      return rsp.userInfo;
    }
    throw new Error(
      rsp.header?.errorMessage || 'Get profile failed',
    );
  },
}));
