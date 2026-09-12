import {Linking} from 'react-native';
import {logger} from '@core/logger/logger';
import type {PaymentProvider} from '../provider.types';

const MOMO_SCHEME = 'momo://';
const MOMO_STORE_URL = 'https://momo.vn/download';

/**
 * PROVIDER MOMO — luồng chuyển hướng sang app khác.
 *
 * Đây là loại provider khó nhất trên mobile, vì nó làm app của ta MẤT
 * QUYỀN ĐIỀU KHIỂN: người dùng rời đi, và hệ điều hành có thể giết app
 * trong lúc đó (đặc biệt là Android với máy RAM thấp).
 *
 * Xem use-payment-return.ts để biết ta lấy lại kết quả bằng cách nào.
 */
export const momoProvider: PaymentProvider = {
  method: 'MOMO',

  async isAvailable() {
    try {
      return await Linking.canOpenURL(MOMO_SCHEME);
    } catch {
      // iOS trả về false nếu scheme chưa khai báo trong LSApplicationQueriesSchemes.
      // Đừng để lỗi này làm sập màn chọn thanh toán.
      return false;
    }
  },

  async pay(intent) {
    if (!intent.redirectUrl) {
      return {status: 'aborted', reason: 'Thiếu link thanh toán từ máy chủ'};
    }

    /**
     * TRONG BẢN DEMO NÀY: mock server trả về scheme giả `mock-gateway://`
     * mà máy không mở được. Ta phát hiện điều đó và trả về 'redirected'
     * luôn, để màn PaymentProcessing hiện ra và bạn tự bấm nút mô phỏng.
     *
     * Trong app thật, hãy xoá nhánh này.
     */
    if (intent.redirectUrl.startsWith('mock-gateway://')) {
      logger.info('MoMo', 'Chế độ mock: bỏ qua bước mở app MoMo');
      return {status: 'redirected'};
    }

    const canOpen = await Linking.canOpenURL(intent.redirectUrl);
    if (!canOpen) {
      // Chưa cài app MoMo -> đẩy sang store thay vì báo lỗi cụt lủn.
      await Linking.openURL(MOMO_STORE_URL);
      return {status: 'aborted', reason: 'Bạn chưa cài ứng dụng MoMo'};
    }

    await Linking.openURL(intent.redirectUrl);
    return {status: 'redirected'};
  },
};
