import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userInfo = useAuthStore(s => s.userInfo);
  const login = useAuthStore(s => s.login);
  const loginWithPhoneCode = useAuthStore(s => s.loginWithPhoneCode);
  const register = useAuthStore(s => s.register);
  const registerWithPhoneCode = useAuthStore(s => s.registerWithPhoneCode);
  const sendPhoneVerifyCode = useAuthStore(s => s.sendPhoneVerifyCode);
  const logout = useAuthStore(s => s.logout);

  return {
    isAuthenticated,
    userInfo,
    login,
    loginWithPhoneCode,
    register,
    registerWithPhoneCode,
    sendPhoneVerifyCode,
    logout,
  };
}
