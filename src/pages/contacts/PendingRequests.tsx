import { useContactStore } from '@/stores/contactStore';
import { Avatar } from '@/components/Avatar/Avatar';

export function PendingRequests() {
  const pendingRequests = useContactStore((s) => s.pendingRequests);
  const handleFriendRequest = useContactStore((s) => s.handleFriendRequest);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        待处理的好友申请
      </h3>
      {pendingRequests.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: 40,
          }}
        >
          暂无待处理的申请
        </div>
      ) : (
        pendingRequests.map((event) => (
          <div
            key={event.eventId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 12,
              margin: '4px 0',
              background: 'rgba(255,255,255,0.35)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <Avatar
              name={event.sender?.nickname || '?'}
              size={32}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {event.sender?.nickname || '未知用户'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                请求添加你为好友
              </div>
            </div>
            <button
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 8,
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}
              onClick={() =>
                handleFriendRequest(
                  event.eventId,
                  true,
                  event.sender?.userId ?? '',
                )
              }
            >
              同意
            </button>
          </div>
        ))
      )}
    </div>
  );
}
