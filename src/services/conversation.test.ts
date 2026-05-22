import { describe, expect, it, vi } from 'vitest';

const rpcCall = vi.fn();

vi.mock('./client', () => ({
  rpcCall,
}));

describe('ConversationService', () => {
  it('calls the conversation search endpoint', async () => {
    const { ConversationService } = await import('./conversation');
    rpcCall.mockResolvedValue({ header: { success: true }, conversations: [] });

    await ConversationService.search({ requestId: 'req-1', searchKey: '产品' });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/conversation/search',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls the set visible endpoint', async () => {
    const { ConversationService } = await import('./conversation');
    rpcCall.mockResolvedValue({ header: { success: true } });

    await ConversationService.setVisible({
      requestId: 'req-1',
      conversationId: 'conversation-1',
      visible: false,
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/conversation/set_visible',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls the quit conversation endpoint', async () => {
    const { ConversationService } = await import('./conversation');
    rpcCall.mockResolvedValue({ header: { success: true } });

    await ConversationService.quit({
      requestId: 'req-1',
      conversationId: 'conversation-1',
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/conversation/quit',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls group management endpoints', async () => {
    const { ConversationService } = await import('./conversation');
    rpcCall.mockResolvedValue({ header: { success: true } });

    await ConversationService.update({
      requestId: 'req-1',
      conversationId: 'conversation-1',
      name: '新群名',
      description: '新描述',
      announcement: '新公告',
    });
    await ConversationService.dismiss({ requestId: 'req-1', conversationId: 'conversation-1' });
    await ConversationService.addMembers({ requestId: 'req-1', conversationId: 'conversation-1', memberIds: ['u-2'] });
    await ConversationService.removeMembers({ requestId: 'req-1', conversationId: 'conversation-1', memberIds: ['u-2'] });
    await ConversationService.changeRole({
      requestId: 'req-1',
      conversationId: 'conversation-1',
      targetUserId: 'u-2',
      role: 2,
    });
    await ConversationService.transferOwner({
      requestId: 'req-1',
      conversationId: 'conversation-1',
      newOwnerId: 'u-2',
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/update' }));
    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/dismiss' }));
    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/add_members' }));
    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/remove_members' }));
    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/change_role' }));
    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({ path: '/service/conversation/transfer_owner' }));
  });
});
