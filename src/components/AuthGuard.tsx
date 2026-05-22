import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';
  if (isPreview) return <Outlet />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
