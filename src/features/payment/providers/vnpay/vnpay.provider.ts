import {Linking} from 'react-native';
import {logger} from '@core/logger/logger';
import type {PaymentProvider} from '../provider.types';

/**
 * THE VNPAY PROVIDER — opens a payment web page.
 *
 * It differs from MoMo in opening a BROWSER rather than an app. A real app should use
 * react-native-inappbrowser-reborn (SFSafariViewController on iOS, Custom Tabs on
 * Android) instead of Linking.openURL:
 *   - The user is not thrown all the way out to Safari/Chrome.
 *   - Closing the browser returns to the app immediately, with a clear callback.
 *   - We can close it ourselves when the deep link arrives.
 *
 * Linking is used here for brevity, to avoid another native dependency.
 */
export const vnpayProvider: PaymentProvider = {
  method: 'VNPAY',

  async isAvailable() {
    return true; // every device has a browser
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
