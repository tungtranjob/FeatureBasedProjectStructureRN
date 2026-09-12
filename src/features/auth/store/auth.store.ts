import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {secureMmkvStorage} from '@core/storage/zustand-persist';
import {appEventBus} from '@core/events/app-event-bus';
import type {AuthStatus, Session} from '../model/types';

/**
 * AUTH STORE — ví dụ về CLIENT STATE (Zustand), không phải server state.
 *
 * Vì sao phiên đăng nhập không dùng TanStack Query: nó không phải dữ liệu
 * ta "lấy về rồi cache". Nó là trạng thái app tự nắm giữ, quyết định luôn
 * cả cây navigation, và phải tồn tại qua các lần khởi động app.
 *
 * Lưu ở vùng `secure` chứ không phải vùng thường — token không nằm chung
 * chỗ với giỏ hàng.
 */
interface AuthState {
  session: Session | null;
  status: AuthStatus;
  /** Đã đọc xong dữ liệu persist chưa — tránh nháy màn Login lúc khởi động. */
  hasHydrated: boolean;

  setSession: (session: Session) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      session: null,
      status: 'unauthenticated',
      hasHydrated: false,

      setSession: session => {
        set({session, status: 'authenticated'});
        appEventBus.emit('auth:logged-in', {userId: session.user.id});
      },

      logout: () => {
        set({session: null, status: 'unauthenticated'});
        // Phát event thay vì tự tay xoá giỏ hàng ở đây.
        // auth KHÔNG được biết cart tồn tại — xem app/bootstrap để thấy
        // ai lắng nghe event này.
        appEventBus.emit('auth:logged-out', undefined);
      },

      setHasHydrated: value => set({hasHydrated: value}),
    }),
    {
      name: 'foodgo.auth',
      storage: createJSONStorage(() => secureMmkvStorage),
      /** Chỉ persist session; `hasHydrated` là state tạm của lần chạy này. */
      partialize: state => ({session: state.session}),
      /** Khôi phục `status` từ session sau khi đọc storage xong. */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setHasHydrated(true);
          return;
        }
        if (state) {
          state.status = state.session ? 'authenticated' : 'unauthenticated';
          state.setHasHydrated(true);
        }
      },
      version: 1,
    },
  ),
);

/**
 * Selector nguyên thuỷ (primitive) — trả về string/boolean thay vì object.
 *
 * Vì sao quan trọng: zustand so sánh bằng Object.is. Nếu selector trả về
 * object mới mỗi lần, component sẽ re-render vô ích ở MỌI thay đổi của store.
 */
export const selectAccessToken = (state: AuthState): string | null =>
  state.session?.accessToken ?? null;

export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.status === 'authenticated';
