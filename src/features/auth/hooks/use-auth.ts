import {useMutation} from '@tanstack/react-query';
import {useShallow} from 'zustand/react/shallow';
import {authApi} from '../api/auth.api';
import {useAuthStore} from '../store/auth.store';

/**
 * Hook public của feature auth. Màn hình không đụng trực tiếp vào store —
 * chúng đi qua hook này. Nhờ vậy ta có thể đổi cách lưu session (zustand ->
 * context -> redux) mà không sửa một dòng nào trong screen.
 */
export function useAuth() {
  // useShallow: so sánh nông từng field, tránh re-render khi object mới nhưng
  // nội dung không đổi.
  const {user, status, hasHydrated, logout} = useAuthStore(
    useShallow(state => ({
      user: state.session?.user ?? null,
      status: state.status,
      hasHydrated: state.hasHydrated,
      logout: state.logout,
    })),
  );

  return {
    user,
    status,
    hasHydrated,
    isAuthenticated: status === 'authenticated',
    logout,
  };
}

/**
 * Mutation đăng nhập.
 *
 * Đăng nhập là server state? Không — nó là một HÀNH ĐỘNG. Ta dùng
 * useMutation để có sẵn isPending/error, còn kết quả thì ghi vào Zustand
 * store vì phiên đăng nhập là client state tồn tại lâu dài.
 */
export function useLogin() {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: session => setSession(session),
  });
}
