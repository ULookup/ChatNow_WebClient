import { create } from 'zustand';

export type Module = 'chat' | 'contacts' | 'settings';
export type RightPanelType = 'group_info' | 'user_profile' | 'pinned_messages' | null;

export interface ReplyTarget {
  messageId: bigint;
  senderId: string;
  preview: string;
}

export interface SelectedUserProfile {
  userId: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
}

export interface MessageSearchRequest {
  query: string;
  requestId: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface UIState {
  activeModule: Module;
  rightPanelOpen: boolean;
  rightPanelType: RightPanelType;
  replyTarget: ReplyTarget | null;
  selectedUserProfile: SelectedUserProfile | null;
  messageSearchRequest: MessageSearchRequest | null;
  composerFocusRequest: number;
  toasts: Toast[];

  switchModule: (m: Module) => void;
  openRightPanel: (type: RightPanelType) => void;
  closeRightPanel: () => void;
  setSelectedUserProfile: (profile: SelectedUserProfile) => void;
  requestMessageSearch: (query: string) => void;
  requestComposerFocus: () => void;
  setReplyTarget: (target: ReplyTarget) => void;
  clearReplyTarget: () => void;
  addToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModule: 'chat',
  rightPanelOpen: false,
  rightPanelType: null,
  replyTarget: null,
  selectedUserProfile: null,
  messageSearchRequest: null,
  composerFocusRequest: 0,
  toasts: [],

  switchModule: (m) => set({ activeModule: m }),

  openRightPanel: (type) => set({ rightPanelOpen: true, rightPanelType: type }),
  closeRightPanel: () => set({ rightPanelOpen: false, rightPanelType: null }),
  setSelectedUserProfile: (profile) => set({ selectedUserProfile: profile }),
  requestMessageSearch: (query) => set((s) => ({
    messageSearchRequest: {
      query,
      requestId: (s.messageSearchRequest?.requestId ?? 0) + 1,
    },
  })),
  requestComposerFocus: () => set((s) => ({ composerFocusRequest: s.composerFocusRequest + 1 })),
  setReplyTarget: (target) => set({ replyTarget: target }),
  clearReplyTarget: () => set({ replyTarget: null }),

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
