import type {PaymentIntent, PaymentLaunchResult, PaymentMethod} from '../model/types';

/**
 * ⭐ CỔNG (PORT) CHUNG CHO MỌI NHÀ CUNG CẤP THANH TOÁN.
 *
 * Mỗi cổng thanh toán (MoMo, VNPay, Stripe...) có SDK và cách hoạt động
 * hoàn toàn khác nhau. Interface này là chỗ duy nhất phần còn lại của app
 * nhìn thấy — nó biến sự khác biệt đó thành chuyện nội bộ của thư mục
 * providers/.
 *
 * Nhờ vậy: thêm ZaloPay = thêm một thư mục. Không màn hình nào, không hook
 * nào, không store nào phải sửa.
 */
export interface PaymentProvider {
  readonly method: PaymentMethod;

  /**
   * Phương thức này có dùng được trên máy hiện tại không?
   * VD: app MoMo chưa cài thì không thể mở deeplink momo://.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Khởi động thanh toán.
   *
   * ⚠️ Hàm này KHÔNG trả về "đã thanh toán thành công hay chưa".
   * Với cổng chuyển hướng, nó chỉ trả về 'redirected' — nghĩa là app đã bị
   * đẩy ra nền. Kết quả thật phải hỏi server (xem use-payment-return.ts).
   * Client không bao giờ được tự kết luận là đã trả tiền.
   */
  pay(intent: PaymentIntent): Promise<PaymentLaunchResult>;
}
