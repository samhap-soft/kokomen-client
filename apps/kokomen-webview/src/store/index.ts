import { User } from "@kokomen/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// 인증 액션 타입 정의
interface AuthActions {
  // eslint-disable-next-line no-unused-vars
  setAuth: (user: User) => void;
  clearAuth: () => void;
  logout: () => void;
}

// 전체 스토어 타입
type AuthStore = AuthState & AuthActions;

// Zustand 스토어 - 인증 상태만 관리
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,

      isAuthenticated: false,

      // 인증 정보 설정
      setAuth: (user: User) => {
        set({
          user,
          isAuthenticated: true
        });
      },

      // 인증 정보 제거
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },

      // 로그아웃 (TanStack Query 캐시도 함께 정리)
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
        // TanStack Query 캐시 무효화는 컴포넌트에서 처리
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// 헬퍼 훅들
export const useUser = (): User | null =>
  useAuthStore((state) => {
    if (!state.user) return null;
    return state.user;
  });
export const useIsAuthenticated = (): boolean =>
  useAuthStore((state) => state.isAuthenticated);
