import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { MemberRole, type MemberItem } from '@/proto/conversation/conversation_service';
import { useChatStore } from '@/stores/chatStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatPresenceLabel, getPresenceTone } from '@/stores/presencePresentation';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';

const EMPTY_MEMBERS: MemberItem[] = [];

export function MemberList({ convId, canManage = false }: { convId: string; canManage?: boolean }) {
  const members = useChatStore((s) => s.membersByConv[convId] ?? EMPTY_MEMBERS);
  const listMembers = useChatStore((s) => s.listMembers);
  const removeMembers = useChatStore((s) => s.removeMembers);
  const presences = usePresenceStore((s) => s.presences);
  const batchGetPresence = usePresenceStore((s) => s.batchGet);
  const subscribePresence = usePresenceStore((s) => s.subscribe);
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  useEffect(() => {
    if (members.length > 0 || isPreview) return;
    listMembers(convId).catch(() => { /* panel stays usable without member details */ });
  }, [convId, isPreview, listMembers, members.length]);

  useEffect(() => {
    const userIds = members
      .map((member) => member.userInfo?.userId)
      .filter((userId): userId is string => Boolean(userId));
    if (userIds.length === 0) return;
    batchGetPresence(userIds);
    subscribePresence(userIds);
  }, [batchGetPresence, members, subscribePresence]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {members.map(m => {
        const userId = m.userInfo?.userId ?? '';
        const nickname = m.userInfo?.nickname ?? '未知';
        const presence = presences[userId];
        const presenceLabel = formatPresenceLabel(presence);
        const presenceTone = getPresenceTone(presence);

        return (
          <div key={userId} style={{
            padding: '7px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}>
            <span style={{ position: 'relative', flex: '0 0 auto' }}>
              <Avatar name={nickname} size={26} />
              <span
                aria-label={`${nickname} 当前状态：${presenceLabel}`}
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -1,
                  width: 9,
                  height: 9,
                  border: '2px solid rgba(255,255,255,0.94)',
                  borderRadius: 999,
                  background: getPresenceColor(presenceTone),
                }}
              />
            </span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: 'var(--text-primary)' }}>{nickname}</span>
            {m.role === MemberRole.OWNER && <span style={{ fontSize: 9, color: '#f59e0b' }}>群主</span>}
            {m.role === MemberRole.ADMIN && <span style={{ fontSize: 9, color: 'var(--accent)' }}>管理员</span>}
            {canManage && m.role !== MemberRole.OWNER && (
              <IconButton
                icon="trash"
                label={`移除 ${nickname}`}
                variant="danger"
                style={{ '--icon-button-size': '26px' } as CSSProperties}
                onClick={() => removeMembers(convId, [userId])}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getPresenceColor(tone: string): string {
  switch (tone) {
    case 'online':
      return '#29c36a';
    case 'away':
      return '#f5b942';
    case 'busy':
      return '#f15b5b';
    default:
      return '#a7b0bf';
  }
}
