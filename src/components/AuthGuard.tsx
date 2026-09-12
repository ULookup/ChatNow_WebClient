import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userId = useAuthStore(s => s.userId);
  const restoreSession = useAuthStore(s => s.restoreSession);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';
  useEffect(() => {
    if (isPreview || !isAuthenticated || userId) return;
    let cancelled = false;
    restoreSession().catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [isPreview, isAuthenticated, userId, restoreSession, attempt]);
  if (isPreview) return <Outlet />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!userId) return <div role="status">{failed ? <>连接失败 <button onClick={() => { setFailed(false); setAttempt(attempt + 1); }}>重试</button></> : '正在恢复会话…'}</div>;
  return <Outlet />;
}
