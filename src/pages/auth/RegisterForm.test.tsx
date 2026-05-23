import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('RegisterForm', () => {
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

  it('registers with email, phone, or username password credentials', async () => {
    const [{ useAuthStore }, { RegisterForm }] = await Promise.all([
      import('@/stores/authStore'),
      import('./RegisterForm'),
    ]);
    const originalRegister = useAuthStore.getState().register;
    const register = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ register });

    render(<RegisterForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('邮箱 / 手机号 / 用户名'), {
      target: { value: 'designer' },
    });
    fireEvent.change(screen.getByLabelText('昵称'), {
      target: { value: 'Designer' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'secret-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('designer', 'secret-1', 'Designer');
    });
    useAuthStore.setState({ register: originalRegister });
  });

  it('registers a phone account with verification code', async () => {
    const [{ useAuthStore }, { RegisterForm }] = await Promise.all([
      import('@/stores/authStore'),
      import('./RegisterForm'),
    ]);
    const originalSend = useAuthStore.getState().sendPhoneVerifyCode;
    const originalRegisterWithCode = useAuthStore.getState().registerWithPhoneCode;
    const sendPhoneVerifyCode = vi.fn().mockResolvedValue('verify-1');
    const registerWithPhoneCode = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ sendPhoneVerifyCode, registerWithPhoneCode });

    render(<RegisterForm onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '手机验证码注册' }));
    fireEvent.change(screen.getByLabelText('手机号'), {
      target: { value: '+1 415 555 0134' },
    });
    fireEvent.change(screen.getByLabelText('昵称'), {
      target: { value: 'Phone User' },
    });
    fireEvent.click(screen.getByRole('button', { name: '获取验证码' }));
    await waitFor(() => {
      expect(sendPhoneVerifyCode).toHaveBeenCalledWith('+1 415 555 0134');
    });
    fireEvent.change(screen.getByLabelText('验证码'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(registerWithPhoneCode).toHaveBeenCalledWith('+1 415 555 0134', 'verify-1', '123456', 'Phone User');
    });
    useAuthStore.setState({
      sendPhoneVerifyCode: originalSend,
      registerWithPhoneCode: originalRegisterWithCode,
    });
  });
});
