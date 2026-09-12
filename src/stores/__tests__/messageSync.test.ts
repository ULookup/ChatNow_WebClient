import { beforeEach, expect, it, vi } from 'vitest';
import { Message } from '@/proto/message/message_types';
import { useChatStore } from '../chatStore';

const sync = vi.hoisted(() => vi.fn());
vi.mock('@/services/message', () => ({ MessageService: { sync } }));
beforeEach(() => { sync.mockReset(); useChatStore.setState({ messagesByConv: {} }); });

it('continues catch-up until all pages have arrived', async () => {
  sync.mockResolvedValueOnce({ header: { success: true }, hasMore: true, messages: [Message.create({ messageId: 1n, seqId: 51n })] });
  sync.mockResolvedValueOnce({ header: { success: true }, hasMore: false, messages: [Message.create({ messageId: 2n, seqId: 52n })] });
  await useChatStore.getState().syncMessages('room', 50);
  expect(sync).toHaveBeenCalledTimes(2);
  expect(sync.mock.calls[1][0].afterSeq).toBe(51n);
  expect(useChatStore.getState().messagesByConv.room.map(message => message.seqId)).toEqual([51n, 52n]);
});

it('rejects a non-progressing page instead of looping forever', async () => {
  sync.mockResolvedValue({ header: { success: true }, hasMore: true, messages: [] });
  await expect(useChatStore.getState().syncMessages('room', 50)).rejects.toThrow('progress');
  expect(sync).toHaveBeenCalledOnce();
});
