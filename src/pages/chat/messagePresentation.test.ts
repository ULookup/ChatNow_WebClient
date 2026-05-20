import { describe, expect, it } from 'vitest';
import { formatMessageClock, getMessageSenderLabel } from './messagePresentation';

describe('messagePresentation', () => {
  it('formats message time as a stable two-digit clock', () => {
    const timestamp = BigInt(new Date(2024, 4, 18, 9, 5).getTime());

    expect(formatMessageClock(timestamp)).toBe('09:05');
  });

  it('uses friendly preview names before falling back to sender id', () => {
    expect(getMessageSenderLabel('u-2')).toBe('Designer');
    expect(getMessageSenderLabel('unknown-user')).toBe('unknown-user');
  });
});
