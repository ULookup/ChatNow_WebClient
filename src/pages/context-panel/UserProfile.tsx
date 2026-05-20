import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/Avatar/Avatar';
import { useUIStore } from '@/stores/uiStore';

export function UserProfile() {
  const { userInfo } = useAuth();
  const selectedUserProfile = useUIStore(s => s.selectedUserProfile);
  const profile = selectedUserProfile ?? (userInfo
    ? {
        userId: userInfo.userId,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
        bio: userInfo.bio,
      }
    : null);

  if (!profile) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <Avatar name={profile.nickname} url={profile.avatarUrl || undefined} size={64} />
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{profile.nickname ?? '未知'}</div>
      {profile.bio && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{profile.bio}</div>}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>ID: {profile.userId}</div>
    </div>
  );
}
