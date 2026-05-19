import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/Avatar/Avatar';

export function UserProfile() {
  const { userInfo } = useAuth();

  if (!userInfo) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <Avatar name={userInfo.nickname} size={64} />
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{userInfo.nickname ?? '未知'}</div>
      {userInfo.bio && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{userInfo.bio}</div>}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>ID: {userInfo.userId}</div>
    </div>
  );
}
