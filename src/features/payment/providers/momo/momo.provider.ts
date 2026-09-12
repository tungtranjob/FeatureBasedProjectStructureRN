import {Linking} from 'react-native';
import {logger} from '@core/logger/logger';
import type {PaymentProvider} from '../provider.types';

const MOMO_SCHEME = 'momo://';
const MOMO_STORE_URL = 'https://momo.vn/download';

/**
 * THE MOMO PROVIDER — the redirect-to-another-app flow.
 *
 * This is the hardest kind of provider on mobile, because it makes our app LOSE
 * CONTROL: the user leaves, and the OS may kill the app while they are away
 * (especially Android on a low-RAM device).
 *
 * See use-payment-return.ts for how we recover the result.
 */
export const momoProvider: PaymentProvider = {
  method: 'MOMO',

  async isAvailable() {
    try {
      return await Linking.canOpenURL(MOMO_SCHEME);
    } catch {
      // iOS returns false if the scheme is not declared in LSApplicationQueriesSchemes.
      // Do not let that error take down the payment method picker.
      return false;
    }
  },

  async pay(intent) {
    if (!intent.redirectUrl) {
      return {status: 'aborted', reason: 'Thiếu link thanh toán từ máy chủ'};
    }

    /**
     * IN THIS DEMO: the mock server returns a fake `mock-gateway://` scheme that the
     * device cannot open. We detect that and return 'redirected' anyway, so the
     * PaymentProcessing screen appears and you can press the simulate button yourself.
     *
     * In a real app, delete this branch.
     */
    if (intent.redirectUrl.startsWith('mock-gateway://')) {
      logger.info('MoMo', 'Chế độ mock: bỏ qua bước mở app MoMo');
      return {status: 'redirected'};
    }

    const canOpen = await Linking.canOpenURL(intent.redirectUrl);
    if (!canOpen) {
      // MoMo is not installed -> send them to the store rather than a blunt error.
      await Linking.openURL(MOMO_STORE_URL);
      return {status: 'aborted', reason: 'Bạn chưa cài ứng dụng MoMo'};
    }

    await Linking.openURL(intent.redirectUrl);
    return {status: 'redirected'};
  },
};
