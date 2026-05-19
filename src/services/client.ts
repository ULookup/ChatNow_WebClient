import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/token';
import { RefreshTokenReq, RefreshTokenRsp } from '@/proto/identity/identity_service';
import { v4 as uuid } from 'uuid';

const BASE_URL = 'http://localhost:9000';

export interface RpcCallOptions {
  path: string;
  auth: 'JWT_REQUIRED' | 'WHITELISTED';
  requestBody: Uint8Array;
  responseType: { fromBinary(bytes: Uint8Array): any };
}

/**
 * Convert Uint8Array to a fetch-compatible BodyInit.
 * TS 6.0 types Uint8Array as Uint8Array<ArrayBufferLike>, which is
 * not directly assignable to BodyInit's underlying BufferSource type.
 */
function toBodyInit(data: Uint8Array): BodyInit {
  return data as unknown as BodyInit;
}

export async function rpcCall<T>(options: RpcCallOptions): Promise<T> {
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
  });

  if (!response.ok) {
    // 401 — try refresh token
    if (response.status === 401 && options.auth === 'JWT_REQUIRED') {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryRes = await fetch(`${BASE_URL}${options.path}`, {
          method: 'POST',
          headers,
          body: toBodyInit(options.requestBody),
        });
        const retryBuf = new Uint8Array(await retryRes.arrayBuffer());
        return options.responseType.fromBinary(retryBuf);
      }
      clearTokens();
      window.location.hash = '#/login';
      throw new Error('Session expired');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buf = new Uint8Array(await response.arrayBuffer());
  return options.responseType.fromBinary(buf) as T;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
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
    });
    if (rsp.ok) {
      const buf = new Uint8Array(await rsp.arrayBuffer());
      const data = RefreshTokenRsp.fromBinary(buf);
      if (data.header?.success && data.tokens) {
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        return true;
      }
    }
  } catch {
    // Refresh failed
  }
  return false;
}
