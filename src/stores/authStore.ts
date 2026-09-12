import { create } from 'zustand';
import type { UserInfo } from '@/proto/common/types';
import type { AuthTokens } from '@/proto/identity/identity_service';
import { IdentityService } from '@/services/identity';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/utils/token';
import { wsClient } from '@/services/ws-client';
import { useChatStore } from './chatStore';
import { useContactStore } from './contactStore';
import { usePresenceStore } from './presenceStore';
import { useUIStore } from './uiStore';
import { buildPhoneCodeCredential, buildUsernamePasswordCredential, normalizePhone } from '@/pages/auth/authCredential';

interface AuthState {
  sessionGeneration: number;
  isAuthenticated: boolean;
  userId: string | null;
  userInfo: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (tokens: AuthTokens, user: UserInfo) => void;
  clearAuth: () => void;
  login: (account: string, password: string, deviceId: string, deviceName: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, verifyCodeId: string, verifyCode: string, deviceId: string, deviceName: string) => Promise<void>;
  register: (account: string, password: string, nickname?: string) => Promise<void>;
  registerWithPhoneCode: (phone: string, verifyCodeId: string, verifyCode: string, nickname: string) => Promise<void>;
  sendPhoneVerifyCode: (phone: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getProfile: (userId?: string) => Promise<UserInfo>;
  restoreSession: () => Promise<void>;
}

let restoration: Promise<void> | null = null;
let sessionGeneration = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  sessionGeneration: 0,
  isAuthenticated: !!getAccessToken(),
  userId: null,
  userInfo: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),

  setAuth: (tokens: AuthTokens, user: UserInfo) => {
    sessionGeneration++;
    setTokens(tokens.accessToken, tokens.refreshToken);
    set({
      sessionGeneration,
      isAuthenticated: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.userId || null,
      userInfo: user,
    });
    wsClient.connect();
  },

  clearAuth: () => {
    sessionGeneration++;
    clearTokens();
    set({
      sessionGeneration,
      isAuthenticated: false,
      userId: null,
      userInfo: null,
      accessToken: null,
      refreshToken: null,
    });
    wsClient.disconnect();
    useChatStore.setState(useChatStore.getInitialState(), true);
    useContactStore.setState(useContactStore.getInitialState(), true);
    usePresenceStore.setState(usePresenceStore.getInitialState(), true);
    useUIStore.setState(useUIStore.getInitialState(), true);
  },

  login: async (account, password, deviceId, deviceName) => {
    const rsp = await IdentityService.login({
      requestId: crypto.randomUUID(),
      credential: buildUsernamePasswordCredential(account, password),
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

  loginWithPhoneCode: async (phone, verifyCodeId, verifyCode, deviceId, deviceName) => {
    const rsp = await IdentityService.login({
      requestId: crypto.randomUUID(),
      credential: buildPhoneCodeCredential(phone, verifyCodeId, verifyCode),
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

  register: async (account, password, nickname) => {
    const rsp = await IdentityService.register({
      requestId: crypto.randomUUID(),
      credential: buildUsernamePasswordCredential(account, password),
      nickname: nickname?.trim() || account.trim(),
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

  registerWithPhoneCode: async (phone, verifyCodeId, verifyCode, nickname) => {
    const rsp = await IdentityService.register({
      requestId: crypto.randomUUID(),
      credential: buildPhoneCodeCredential(phone, verifyCodeId, verifyCode),
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

  sendPhoneVerifyCode: async (phone) => {
    const rsp = await IdentityService.sendVerifyCode({
      requestId: crypto.randomUUID(),
      destination: {
        oneofKind: 'phone',
        phone: normalizePhone(phone),
      },
    });
    if (rsp.header?.success && rsp.verifyCodeId) {
      return rsp.verifyCodeId;
    }
    throw new Error(rsp.header?.errorMessage || 'Send verify code failed');
  },

  logout: async () => {
    try {
      await IdentityService.logout({ requestId: crypto.randomUUID() });
    } finally { get().clearAuth(); }
  },

  restoreSession: () => {
    if (restoration) return restoration;
    const generation = sessionGeneration;
    restoration = (async () => {
      if (!getAccessToken()) return;
      const rsp = await IdentityService.getProfile({ requestId: crypto.randomUUID() });
      if (generation !== sessionGeneration) return;
      if (!rsp.header?.success || !rsp.userInfo) throw new Error('Unable to restore session');
      set({ userInfo: rsp.userInfo, userId: rsp.userInfo.userId, accessToken: getAccessToken(), refreshToken: getRefreshToken() });
      wsClient.connect();
    })().finally(() => { restoration = null; });
    return restoration;
  },

  refreshAuth: async () => {
    const refresh = getRefreshToken();
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
        set({ userInfo: rsp.userInfo, userId: rsp.userInfo.userId });
      }
      return rsp.userInfo;
    }
    throw new Error(
      rsp.header?.errorMessage || 'Get profile failed',
    );
  },
}));
