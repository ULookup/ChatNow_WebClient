import type { LoginReq, RegisterReq } from '@/proto/identity/identity_service';

export type AccountKind = 'email' | 'phone' | 'username';

export function getAccountKind(account: string): AccountKind {
  const value = account.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  if (/^\+?[\d\s().-]{7,}$/.test(value) && /\d{7,}/.test(normalizePhone(value))) return 'phone';
  return 'username';
}

export function normalizeAccount(account: string): string {
  const value = account.trim();
  return getAccountKind(value) === 'phone' ? normalizePhone(value) : value;
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith('+') ? '+' : '';
  return `${prefix}${trimmed.replace(/\D/g, '')}`;
}

export function buildUsernamePasswordCredential(
  account: string,
  password: string,
): Extract<LoginReq['credential'], { oneofKind: 'usernamePwd' }> {
  return {
    oneofKind: 'usernamePwd',
    usernamePwd: {
      username: normalizeAccount(account),
      password,
    },
  };
}

export function buildPhoneCodeCredential(
  phone: string,
  verifyCodeId: string,
  verifyCode: string,
): Extract<LoginReq['credential'], { oneofKind: 'phoneCode' }> {
  return {
    oneofKind: 'phoneCode',
    phoneCode: {
      phone: normalizePhone(phone),
      verifyCodeId,
      verifyCode,
    },
  };
}

export type AuthCredential = LoginReq['credential'] | RegisterReq['credential'];
