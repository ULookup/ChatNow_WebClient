import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('LoginForm', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('submits email, phone, or username password login through auth store', async () => {
    const [{ useAuthStore }, { LoginForm }] = await Promise.all([
      import('@/stores/authStore'),
      import('./LoginForm'),
    ]);
    const originalLogin = useAuthStore.getState().login;
    const login = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('邮箱 / 手机号 / 用户名'), {
      target: { value: 'designer@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'secret-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('designer@example.com', 'secret-1', expect.any(String), 'Web Browser');
    });
    useAuthStore.setState({ login: originalLogin });
  });

  it('requests a phone verification code and logs in with the code', async () => {
    const [{ useAuthStore }, { LoginForm }] = await Promise.all([
      import('@/stores/authStore'),
      import('./LoginForm'),
    ]);
    const originalSend = useAuthStore.getState().sendPhoneVerifyCode;
    const originalLoginWithCode = useAuthStore.getState().loginWithPhoneCode;
    const sendPhoneVerifyCode = vi.fn().mockResolvedValue('verify-1');
    const loginWithPhoneCode = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ sendPhoneVerifyCode, loginWithPhoneCode });

    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: '验证码登录' }));
    fireEvent.change(screen.getByLabelText('手机号'), {
      target: { value: '+1 415 555 0134' },
    });
    fireEvent.click(screen.getByRole('button', { name: '获取验证码' }));
    await waitFor(() => {
      expect(sendPhoneVerifyCode).toHaveBeenCalledWith('+1 415 555 0134');
    });
    fireEvent.change(screen.getByLabelText('验证码'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(loginWithPhoneCode).toHaveBeenCalledWith('+1 415 555 0134', 'verify-1', '123456', expect.any(String), 'Web Browser');
    });
    useAuthStore.setState({
      sendPhoneVerifyCode: originalSend,
      loginWithPhoneCode: originalLoginWithCode,
    });
  });
});
