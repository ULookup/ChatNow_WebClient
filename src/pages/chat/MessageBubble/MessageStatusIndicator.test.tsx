import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageStatus } from '@/proto/message/message_types';
import { MessageStatusIndicator } from './MessageStatusIndicator';

describe('MessageStatusIndicator', () => {
  it('shows sent state for normal outgoing messages', () => {
    render(<MessageStatusIndicator status={MessageStatus.NORMAL} />);

    expect(screen.getByText('已发送')).toBeTruthy();
  });

  it('shows retry hint for failed local messages', () => {
    render(<MessageStatusIndicator status={MessageStatus.NORMAL} deliveryState="failed" />);

    expect(screen.getByText('发送失败，点击重试')).toBeTruthy();
  });
});
