import { getAccessToken, getRefreshToken, getTokenHints, setTokens } from '@/utils/token';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE } from './endpoints';
import { RefreshTokenReq, RefreshTokenRsp } from '@/proto/identity/identity_service';
import { v4 as uuid } from 'uuid';

const BASE_URL = API_BASE;

export interface RpcCallOptions<T> {
  path: string;
  auth: 'JWT_REQUIRED' | 'WHITELISTED';
  requestBody: Uint8Array;
  responseType: { fromBinary(bytes: Uint8Array): T };
}

/**
 * Convert Uint8Array to a fetch-compatible BodyInit.
 * TS 6.0 types Uint8Array as Uint8Array<ArrayBufferLike>, which is
 * not directly assignable to BodyInit's underlying BufferSource type.
 */
function toBodyInit(data: Uint8Array): BodyInit {
  return data as unknown as BodyInit;
}

export async function rpcCall<T>(options: RpcCallOptions<T>): Promise<T> {
  const generation = useAuthStore.getState().sessionGeneration;
  const assertSession = () => {
    if (options.auth === 'JWT_REQUIRED' && generation !== useAuthStore.getState().sessionGeneration) {
      throw new Error('Session changed');
    }
  };
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-protobuf',
    'x-trace-id': uuid().replace(/-/g, ''),
  };

  if (options.auth === 'JWT_REQUIRED') {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${options.path}`, {
    method: 'POST',
    headers,
    body: toBodyInit(options.requestBody),
    signal: AbortSignal.timeout(15000),
  });
  assertSession();

  if (!response.ok) {
    // 401 — try refresh token
    if (response.status === 401 && options.auth === 'JWT_REQUIRED') {
      const refreshed = headers.Authorization !== `Bearer ${getAccessToken()}` || await tryRefreshToken();
      assertSession();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryRes = await fetch(`${BASE_URL}${options.path}`, {
          method: 'POST',
          headers,
          body: toBodyInit(options.requestBody),
          signal: AbortSignal.timeout(15000),
        });
        assertSession();
        if (!retryRes.ok) {
          if (retryRes.status === 401) useAuthStore.getState().clearAuth();
          throw new Error(`HTTP ${retryRes.status}: ${retryRes.statusText}`);
        }
        const retryBuf = new Uint8Array(await retryRes.arrayBuffer());
        assertSession();
        return options.responseType.fromBinary(retryBuf);
      }
      useAuthStore.getState().clearAuth();
      throw new Error('Session expired');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buf = new Uint8Array(await response.arrayBuffer());
  assertSession();
  return options.responseType.fromBinary(buf) as T;
}

let refreshing: Promise<boolean> | null = null;

export function tryRefreshToken(): Promise<boolean> {
  if (!refreshing) refreshing = refreshToken().finally(() => { refreshing = null; });
  return refreshing;
}

export async function ensureFreshAccessToken(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;
  const expiry = getTokenHints(token).exp;
  if (expiry && expiry * 1000 <= Date.now() + 30000) return tryRefreshToken();
  return true;
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  {
    const req: RefreshTokenReq = {
      requestId: crypto.randomUUID(),
      refreshToken,
    };
    const rsp = await fetch(`${BASE_URL}/service/identity/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-protobuf',
        'x-trace-id': uuid().replace(/-/g, ''),
      },
      body: toBodyInit(RefreshTokenReq.toBinary(req)),
      signal: AbortSignal.timeout(15000),
    });
    if (rsp.ok) {
      const buf = new Uint8Array(await rsp.arrayBuffer());
      const data = RefreshTokenRsp.fromBinary(buf);
      if (data.header?.success && data.tokens) {
        // A response from a previous session must not restore a logged-out user.
        if (getRefreshToken() !== refreshToken) return false;
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        useAuthStore.setState({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
        return true;
      }
    }
  }
  return false;
}
