import { useState, useEffect } from 'react';
import type { MemberItem } from '@/proto/conversation/conversation_service';
import { MemberRole } from '@/proto/conversation/conversation_service';
import { ConversationService } from '@/services/conversation';
import { Avatar } from '@/components/Avatar/Avatar';

export function MemberList({ convId }: { convId: string }) {
  const [members, setMembers] = useState<MemberItem[]>([]);

  useEffect(() => {
    ConversationService.listMembers({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      page: { limit: 100, cursor: '' },
    }).then(rsp => {
      if (rsp.members && rsp.members.length > 0) setMembers(rsp.members);
    }).catch(() => { /* ignore */ });
  }, [convId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {members.map(m => (
        <div key={m.userInfo?.userId} style={{
          padding: '7px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}>
          <Avatar name={m.userInfo?.nickname ?? '?'} size={26} />
          <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{m.userInfo?.nickname}</span>
          {m.role === MemberRole.OWNER && <span style={{ fontSize: 9, color: '#f59e0b' }}>群主</span>}
          {m.role === MemberRole.ADMIN && <span style={{ fontSize: 9, color: 'var(--accent)' }}>管理员</span>}
        </div>
      ))}
    </div>
  );
}
