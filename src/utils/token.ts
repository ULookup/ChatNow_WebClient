const TOKEN_KEY = 'chatnow_access_token';
const REFRESH_KEY = 'chatnow_refresh_token';
const DEVICE_KEY = 'chatnow_device_id';

export function getDeviceId(): string {
  let device = localStorage.getItem(DEVICE_KEY);
  if (!device) {
    device = 'web-' + crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, device);
  }
  return device;
}

// These hints coordinate the client. The backend verifies all JWT claims.
export function getTokenHints(token: string): { did?: string; exp?: number } {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch { return {}; }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
