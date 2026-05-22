import { describe, expect, it, vi } from 'vitest';

const rpcCall = vi.fn();

vi.mock('./client', () => ({
  rpcCall,
}));

describe('MessageService', () => {
  it('calls the clear conversation endpoint', async () => {
    const { MessageService } = await import('./message');
    rpcCall.mockResolvedValue({ header: { success: true } });

    await MessageService.clearConversation({
      requestId: 'req-1',
      conversationId: 'conversation-1',
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/message/clear',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls reaction detail and read ack endpoints', async () => {
    const { MessageService } = await import('./message');
    rpcCall.mockResolvedValue({ header: { success: true }, reactions: [] });

    await MessageService.getReactions({
      requestId: 'req-2',
      messageId: 42n,
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/message/get_reactions',
      auth: 'JWT_REQUIRED',
    }));

    await MessageService.updateReadAck({
      requestId: 'req-3',
      conversationId: 'conversation-1',
      seqId: 9n,
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/message/update_read_ack',
      auth: 'JWT_REQUIRED',
    }));
  });
});
