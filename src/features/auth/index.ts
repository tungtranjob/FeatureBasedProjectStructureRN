/**
 * PUBLIC API CỦA FEATURE AUTH.
 *
 * Đây là hợp đồng với phần còn lại của app. Bất cứ thứ gì KHÔNG xuất hiện ở
 * đây đều là chuyện nội bộ của auth và có thể đổi tự do mà không ảnh hưởng ai.
 *
 * Chú ý: `useAuthStore` KHÔNG được export. Nếu feature khác chạm được vào
 * store, ta mất quyền kiểm soát và store sẽ bị sửa từ 20 chỗ khác nhau.
 * Ngoại lệ duy nhất là `getAccessTokenForBridge` — dùng ở app/bootstrap để
 * cắm token vào http-client.
 */
export {LoginScreen} from './screens/LoginScreen';
export {ProfileScreen} from './screens/ProfileScreen';
export {AUTH_ROUTES} from './navigation/auth.routes';
export type {AuthStackParamList} from './navigation/auth.routes';
export {useAuth, useLogin} from './hooks/use-auth';
export type {AuthUser, AuthStatus} from './model/types';

import {useAuthStore, selectAccessToken} from './store/auth.store';

/** Đọc token ngoài React tree (cho http-client). Chỉ app/bootstrap dùng. */
export const getAccessToken = (): string | null =>
  selectAccessToken(useAuthStore.getState());

/** Đăng xuất ngoài React tree (khi server trả 401). */
export const forceLogout = (): void => useAuthStore.getState().logout();
