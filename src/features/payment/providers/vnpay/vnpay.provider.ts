import {Linking} from 'react-native';
import {logger} from '@core/logger/logger';
import type {PaymentProvider} from '../provider.types';

/**
 * PROVIDER VNPAY — mở trang web thanh toán.
 *
 * Khác MoMo ở chỗ nó mở TRÌNH DUYỆT chứ không mở app. Trong app thật nên
 * dùng react-native-inappbrowser-reborn (SFSafariViewController trên iOS,
 * Custom Tabs trên Android) thay vì Linking.openURL:
 *   - Người dùng không bị đá hẳn ra Safari/Chrome.
 *   - Đóng trình duyệt là quay lại app ngay, có callback rõ ràng.
 *   - Ta chủ động đóng được khi nhận deep link.
 *
 * Ở đây dùng Linking cho gọn, khỏi thêm native dependency.
 */
export const vnpayProvider: PaymentProvider = {
  method: 'VNPAY',

  async isAvailable() {
    return true; // trình duyệt thì máy nào cũng có
  },

  async pay(intent) {
    if (!intent.redirectUrl) {
      return {status: 'aborted', reason: 'Thiếu link thanh toán từ máy chủ'};
    }

    if (intent.redirectUrl.startsWith('mock-gateway://')) {
      logger.info('VNPay', 'Chế độ mock: bỏ qua bước mở trình duyệt');
      return {status: 'redirected'};
    }

    await Linking.openURL(intent.redirectUrl);
    return {status: 'redirected'};
  },
};
