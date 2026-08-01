import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // Ephemeral (not persisted) — cleared on clearAuth
  needsOnboarding: boolean;
  postAuthRedirect: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
  setNeedsOnboarding: (v: boolean) => void;
  setPostAuthRedirect: (path: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      needsOnboarding: false,
      postAuthRedirect: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({
          user: null, accessToken: null, refreshToken: null,
          isAuthenticated: false, needsOnboarding: false, postAuthRedirect: null,
        }),
      updateUser: (user) => set({ user }),
      setNeedsOnboarding: (v) => set({ needsOnboarding: v }),
      setPostAuthRedirect: (path) => set({ postAuthRedirect: path }),
    }),
    {
      name: 'remindology-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      // needsOnboarding and postAuthRedirect are intentionally excluded — session-only
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
export default useAuthStore;
