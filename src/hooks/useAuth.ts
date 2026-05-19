import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userInfo = useAuthStore(s => s.userInfo);
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const logout = useAuthStore(s => s.logout);

  return { isAuthenticated, userInfo, login, register, logout };
}
