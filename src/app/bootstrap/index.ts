import {authTokenBridge} from '@core/api/auth-token';
import {logger} from '@core/logger/logger';
import {forceLogout, getAccessToken} from '@features/auth';
import {registerEventHandlers} from './register-event-handlers';

/**
 * Khởi tạo app — chạy MỘT LẦN trước khi render.
 *
 * Trả về hàm dọn dẹp để Fast Refresh không làm listener nhân lên.
 */
export function bootstrap(): () => void {
  logger.info('App', 'Bootstrap');

  /**
   * ⭐ ĐẢO NGƯỢC PHỤ THUỘC TẠI CHỖ.
   *
   * http-client (core) cần token, nhưng core không được import feature.
   * Ở đây — trong app/, nơi được phép biết cả hai — ta cắm chúng vào nhau.
   *
   * Nhờ vậy core/ vẫn dùng lại được cho một app khác không có feature auth
   * này, và đồ thị phụ thuộc không có chu trình nào.
   */
  authTokenBridge.setTokenProvider(getAccessToken);
  authTokenBridge.setUnauthorizedHandler(forceLogout);

  const unregisterEvents = registerEventHandlers();

  // Nơi đặt các bước khởi tạo khác trong app thật:
  //   initSentry();
  //   initPushNotifications();
  //   initAnalytics();
  //   await SplashScreen.hideAsync();

  return () => {
    unregisterEvents();
  };
}

export {registerEventHandlers};
