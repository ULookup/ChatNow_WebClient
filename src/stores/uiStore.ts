import { create } from 'zustand';

export type Module = 'chat' | 'contacts' | 'settings';
export type RightPanelType = 'group_info' | 'user_profile' | 'pinned_messages' | null;

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface UIState {
  activeModule: Module;
  rightPanelOpen: boolean;
  rightPanelType: RightPanelType;
  toasts: Toast[];

  switchModule: (m: Module) => void;
  openRightPanel: (type: RightPanelType) => void;
  closeRightPanel: () => void;
  addToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModule: 'chat',
  rightPanelOpen: false,
  rightPanelType: null,
  toasts: [],

  switchModule: (m) => set({ activeModule: m }),

  openRightPanel: (type) => set({ rightPanelOpen: true, rightPanelType: type }),
  closeRightPanel: () => set({ rightPanelOpen: false, rightPanelType: null }),

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
