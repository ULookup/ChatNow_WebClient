import { describe, expect, it, vi } from 'vitest';

const rpcCall = vi.fn();

vi.mock('./client', () => ({
  rpcCall,
}));

describe('RelationshipService', () => {
  it('calls the documented list blocked endpoint', async () => {
    const { RelationshipService } = await import('./relationship');
    rpcCall.mockResolvedValue({ header: { success: true }, blockedList: [] });

    await RelationshipService.listBlockedUsers({
      requestId: 'req-1',
      page: { limit: 100, cursor: '' },
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/relationship/list_blocked',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls the documented list pending endpoint', async () => {
    const { RelationshipService } = await import('./relationship');
    rpcCall.mockResolvedValue({ header: { success: true }, event: [] });

    await RelationshipService.listPendingRequests({ requestId: 'req-1' });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/relationship/list_pending',
      auth: 'JWT_REQUIRED',
    }));
  });

  it('calls the friend search endpoint', async () => {
    const { RelationshipService } = await import('./relationship');
    rpcCall.mockResolvedValue({ header: { success: true }, userInfo: [] });

    await RelationshipService.searchFriends({
      requestId: 'req-1',
      searchKey: 'Ada',
    });

    expect(rpcCall).toHaveBeenCalledWith(expect.objectContaining({
      path: '/service/relationship/search_friends',
      auth: 'JWT_REQUIRED',
    }));
  });
});
