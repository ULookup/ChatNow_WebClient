import { create } from 'zustand';
import type { Presence } from '@/proto/presence/presence_service';
import { PresenceService } from '@/services/presence';

interface PresenceState {
  presences: Record<string, Presence>;
  updatePresence: (userId: string, presence: Presence) => void;
  batchGet: (userIds: string[]) => Promise<void>;
  subscribe: (userIds: string[]) => Promise<void>;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presences: {},

  updatePresence: (userId, presence) => {
    set((s) => ({ presences: { ...s.presences, [userId]: presence } }));
  },

  batchGet: async (userIds) => {
    try {
      const rsp = await PresenceService.batchGet({ requestId: crypto.randomUUID(), userIds } as any);
      if (rsp.header?.success && rsp.presences) {
        set((s) => ({ presences: { ...s.presences, ...rsp.presences } }));
      }
    } catch {
      /* network error */
    }
  },

  subscribe: async (userIds) => {
    try {
      await PresenceService.subscribe({ requestId: crypto.randomUUID(), subscribeUserIds: userIds } as any);
    } catch {
      /* network error */
    }
  },
}));
