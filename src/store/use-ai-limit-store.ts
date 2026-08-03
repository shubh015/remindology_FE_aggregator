import { create } from 'zustand';

interface AiLimitState {
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string | null;
  showModal: boolean;
}

interface AiLimitActions {
  updateFromHeaders: (used: number, remaining: number, limit: number) => void;
  updateFromApi: (used: number, remaining: number, limit: number, resetsAt: string) => void;
  showLimitModal: () => void;
  hideLimitModal: () => void;
}

export const useAiLimitStore = create<AiLimitState & AiLimitActions>((set) => ({
  used: 0,
  remaining: 15,
  limit: 15,
  resetsAt: null,
  showModal: false,
  updateFromHeaders: (used, remaining, limit) => set({ used, remaining, limit }),
  updateFromApi: (used, remaining, limit, resetsAt) => set({ used, remaining, limit, resetsAt }),
  showLimitModal: () => set({ showModal: true }),
  hideLimitModal: () => set({ showModal: false }),
}));
