import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './types';

/**
 * Điều hướng từ NGOÀI cây React.
 *
 * Cần cho các tình huống mà ta không có component nào trong tay:
 *  - Người dùng chạm vào push notification.
 *  - Listener của event bus trong app/bootstrap.
 *  - Interceptor bắt lỗi 401 và cần đá về màn đăng nhập.
 *
 * ⚠️ Luôn kiểm tra isReady(): điều hướng trước khi NavigationContainer gắn
 * xong sẽ im lặng không làm gì — một lỗi rất khó lần vì không có thông báo.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <T extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[T]
    ? [screen: T] | [screen: T, params: RootStackParamList[T]]
    : [screen: T, params: RootStackParamList[T]]
): void => {
  if (navigationRef.isReady()) {
    // @ts-expect-error — chữ ký biến thiên của navigate khó biểu diễn chính xác
    navigationRef.navigate(...args);
  }
};

export const resetToHome = (): void => {
  if (navigationRef.isReady()) {
    navigationRef.reset({index: 0, routes: [{name: 'MainTabs'}]});
  }
};
