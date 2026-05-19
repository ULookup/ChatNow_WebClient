import { useContactStore } from '@/stores/contactStore';
import { Avatar } from '@/components/Avatar/Avatar';

export function FriendList() {
  const friends = useContactStore((s) => s.friends);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {friends.map((friend) => (
        <div
          key={friend.userId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            margin: '2px 0',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <Avatar name={friend.nickname || '?'} size={28} />
          <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
            {friend.nickname || '未知'}
          </span>
        </div>
      ))}
      {friends.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          暂无好友
        </div>
      )}
    </div>
  );
}
