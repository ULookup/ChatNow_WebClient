import { describe, expect, it } from 'vitest';
import {
  buildPhoneCodeCredential,
  buildUsernamePasswordCredential,
  getAccountKind,
} from './authCredential';

describe('authCredential', () => {
  it('classifies email, phone, and username account identifiers', () => {
    expect(getAccountKind('designer@example.com')).toBe('email');
    expect(getAccountKind('+1 415 555 0134')).toBe('phone');
    expect(getAccountKind('designer')).toBe('username');
  });

  it('maps email and username to the backend username password credential', () => {
    expect(buildUsernamePasswordCredential('designer@example.com', 'secret-1')).toEqual({
      oneofKind: 'usernamePwd',
      usernamePwd: { username: 'designer@example.com', password: 'secret-1' },
    });
    expect(buildUsernamePasswordCredential('designer', 'secret-1')).toEqual({
      oneofKind: 'usernamePwd',
      usernamePwd: { username: 'designer', password: 'secret-1' },
    });
  });

  it('maps phone verification fields to the backend phone code credential', () => {
    expect(buildPhoneCodeCredential('+1 415 555 0134', 'verify-1', '123456')).toEqual({
      oneofKind: 'phoneCode',
      phoneCode: {
        phone: '+14155550134',
        verifyCodeId: 'verify-1',
        verifyCode: '123456',
      },
    });
  });
});
