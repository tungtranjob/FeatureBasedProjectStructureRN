import {logger} from '@core/logger/logger';
import {sleep} from '@shared/lib/sleep';
import type {PaymentProvider} from '../provider.types';

/**
 * PROVIDER THẺ — luồng "xong ngay trong app".
 *
 * Trong app thật đây là nơi gọi Stripe PaymentSheet
 * (@stripe/stripe-react-native): sheet hiện lên NGAY TRONG app, người dùng
 * không đi đâu cả, và ta biết kết quả ngay khi sheet đóng.
 *
 * Đặt cạnh MoMo trong cùng thư mục providers/ để thấy rõ: dù cơ chế khác
 * hẳn nhau, cả hai đều thoả mãn cùng một interface. Phần còn lại của app
 * không cần quan tâm sự khác biệt.
 */
export const cardProvider: PaymentProvider = {
  method: 'CARD',

  async isAvailable() {
    return true;
  },

  async pay(intent) {
    logger.info('Card', `Mở payment sheet cho ${intent.amount}đ`);
    // Thay bằng: await presentPaymentSheet()
    await sleep(400);
    // Trả về 'redirected' để demo dùng chung màn chờ với các cổng khác.
    // Với Stripe thật thì ở đây là {status: 'completed'}.
    return {status: 'redirected'};
  },
};
