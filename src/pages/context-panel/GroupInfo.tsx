import type { Conversation } from '@/proto/conversation/conversation_service';
import { MemberList } from './MemberList';

interface Props {
  conv: Conversation;
}

export function GroupInfo({ conv }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{conv.name || '未命名群组'}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          成员 {String(conv.memberCount ?? 0)} 人
        </div>
      </div>
      <MemberList convId={conv.conversationId} />
    </div>
  );
}
