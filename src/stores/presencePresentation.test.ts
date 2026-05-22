import { describe, expect, it, vi } from 'vitest';
import { PresenceState, type Presence } from '@/proto/presence/presence_service';
import { formatLastActive, formatPresenceLabel, getPresenceTone } from './presencePresentation';

function presence(state: PresenceState, lastActiveAtMs = 0n): Presence {
  return {
    userId: 'u-2',
    aggregatedState: state,
    lastActiveAtMs,
    devices: [],
  };
}

describe('presencePresentation', () => {
  it('maps presence state to Chinese labels', () => {
    expect(formatPresenceLabel(presence(PresenceState.ONLINE))).toBe('在线');
    expect(formatPresenceLabel(presence(PresenceState.AWAY))).toBe('离开');
    expect(formatPresenceLabel(presence(PresenceState.BUSY))).toBe('忙碌');
    expect(formatPresenceLabel(presence(PresenceState.OFFLINE))).toBe('离线');
    expect(formatPresenceLabel(presence(PresenceState.INVISIBLE))).toBe('隐身');
    expect(formatPresenceLabel()).toBe('状态未知');
  });

  it('maps presence state to visual tones', () => {
    expect(getPresenceTone(presence(PresenceState.ONLINE))).toBe('online');
    expect(getPresenceTone(presence(PresenceState.AWAY))).toBe('away');
    expect(getPresenceTone(presence(PresenceState.BUSY))).toBe('busy');
    expect(getPresenceTone(presence(PresenceState.OFFLINE))).toBe('offline');
    expect(getPresenceTone()).toBe('unknown');
  });

  it('formats last active time relative to the current day', () => {
    vi.setSystemTime(new Date('2026-05-21T12:00:00-07:00'));

    expect(formatLastActive(BigInt(new Date('2026-05-21T11:59:30-07:00').getTime()))).toBe('刚刚活跃');
    expect(formatLastActive(BigInt(new Date('2026-05-21T11:45:00-07:00').getTime()))).toBe('15 分钟前活跃');
    expect(formatLastActive(BigInt(new Date('2026-05-21T09:05:00-07:00').getTime()))).toBe('今天 09:05 活跃');
    expect(formatLastActive(BigInt(new Date('2026-05-20T22:10:00-07:00').getTime()))).toBe('05/20 22:10 活跃');
    expect(formatLastActive()).toBe('');

    vi.useRealTimers();
  });
});
