import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { RefreshTokenRsp } from '@/proto/identity/identity_service';
import { getAccessToken, setTokens } from '@/utils/token';
import { rpcCall } from './client';
import { useAuthStore } from '@/stores/authStore';

const auth = vi.hoisted(() => ({ clearAuth: vi.fn(), setState: vi.fn(), sessionGeneration: 0 }));
vi.mock('@/stores/authStore', () => ({ useAuthStore: { getState: () => auth, setState: auth.setState } }));
const options = { path: '/service/example', auth: 'JWT_REQUIRED' as const, requestBody: new Uint8Array(), responseType: { fromBinary: () => 'ok' } };
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); setTokens('old-access', 'old-refresh'); });
afterEach(() => vi.unstubAllGlobals());

it('shares one refresh for simultaneous unauthorized requests', async () => {
  let refreshes = 0;
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    if (url.endsWith('/refresh_token')) {
      refreshes++;
      await Promise.resolve();
      const bytes = RefreshTokenRsp.toBinary(RefreshTokenRsp.create({ header: { success: true }, tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' } }));
      return new Response(new Uint8Array(bytes).buffer);
    }
    return new Response(null, { status: (init.headers as Record<string, string>).Authorization === 'Bearer new-access' ? 200 : 401 });
  }));
  expect(await Promise.all([rpcCall(options), rpcCall(options)])).toEqual(['ok', 'ok']);
  expect(refreshes).toBe(1);
  expect(getAccessToken()).toBe('new-access');
});

it('clears application auth when refresh is rejected', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
  await expect(rpcCall(options)).rejects.toThrow('Session expired');
  expect(auth.clearAuth).toHaveBeenCalledOnce();
});

it('rejects a delayed response after the account changes', async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
  const pending = rpcCall(options);
  useAuthStore.getState().sessionGeneration++;
  setTokens('bob-access', 'bob-refresh');
  finish(new Response(null, { status: 200 }));
  await expect(pending).rejects.toThrow('Session changed');
  expect(fetch).toHaveBeenCalledOnce();
  expect(auth.clearAuth).not.toHaveBeenCalled();
});
