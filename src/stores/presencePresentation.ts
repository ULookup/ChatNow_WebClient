import { PresenceState, type Presence } from '@/proto/presence/presence_service';

export type PresenceTone = 'online' | 'away' | 'busy' | 'offline' | 'unknown';

export function formatPresenceLabel(presence?: Presence): string {
  switch (presence?.aggregatedState) {
    case PresenceState.ONLINE:
      return '在线';
    case PresenceState.AWAY:
      return '离开';
    case PresenceState.BUSY:
      return '忙碌';
    case PresenceState.OFFLINE:
      return '离线';
    case PresenceState.INVISIBLE:
      return '隐身';
    default:
      return '状态未知';
  }
}

export function getPresenceTone(presence?: Presence): PresenceTone {
  switch (presence?.aggregatedState) {
    case PresenceState.ONLINE:
      return 'online';
    case PresenceState.AWAY:
      return 'away';
    case PresenceState.BUSY:
      return 'busy';
    case PresenceState.OFFLINE:
    case PresenceState.INVISIBLE:
      return 'offline';
    default:
      return 'unknown';
  }
}

export function formatLastActive(lastActiveAtMs?: bigint): string {
  if (!lastActiveAtMs || lastActiveAtMs <= 0n) return '';

  const lastActive = new Date(Number(lastActiveAtMs));
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  if (diffMs >= 0 && diffMs < 60_000) return '刚刚活跃';
  if (diffMs >= 0 && diffMs < 60 * 60_000) return `${Math.floor(diffMs / 60_000)} 分钟前活跃`;

  const time = `${pad2(lastActive.getHours())}:${pad2(lastActive.getMinutes())}`;
  if (lastActive.toDateString() === now.toDateString()) return `今天 ${time} 活跃`;

  return `${pad2(lastActive.getMonth() + 1)}/${pad2(lastActive.getDate())} ${time} 活跃`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}
